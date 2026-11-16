import os
import io
import time
import glob
from concurrent.futures import ProcessPoolExecutor, as_completed
import fitz
from PIL import Image

def compress_single_pdf(pdf_path, max_dim=1000, quality=65):
    orig_sz = os.path.getsize(pdf_path) / (1024 * 1024)
    name = os.path.basename(pdf_path)
    print(f"[{name}] Starting compression (orig: {orig_sz:.2f} MB)...", flush=True)
    start_t = time.time()
    
    tmp_path = pdf_path + f".par_tmp_{os.getpid()}.pdf"
    try:
        doc = fitz.open(pdf_path)
        unique_xrefs = {x[0] for page in doc for x in page.get_images()}
        images_updated = 0
        
        for xref in unique_xrefs:
            try:
                base = doc.extract_image(xref)
                if not base:
                    continue
                orig_bytes = base["image"]
                pil_img = Image.open(io.BytesIO(orig_bytes))
                w, h = pil_img.size
                if w > max_dim or h > int(max_dim * 1.38):
                    pil_img.thumbnail((max_dim, int(max_dim * 1.38)), Image.Resampling.BILINEAR)
                if pil_img.mode in ("RGBA", "P"):
                    pil_img = pil_img.convert("RGB")
                out_io = io.BytesIO()
                pil_img.save(out_io, format="JPEG", quality=quality, subsampling=2)
                new_bytes = out_io.getvalue()
                if len(new_bytes) < len(orig_bytes):
                    doc.update_stream(xref, new_bytes)
                    images_updated += 1
            except Exception:
                pass
        
        doc.save(tmp_path, garbage=3, deflate=True)
        doc.close()
        
        new_sz = os.path.getsize(tmp_path) / (1024 * 1024)
        elapsed = time.time() - start_t
        if new_sz < orig_sz:
            os.replace(tmp_path, pdf_path)
            print(f"[{name}] SUCCESS in {elapsed:.1f}s: {orig_sz:.2f} MB -> {new_sz:.2f} MB (updated {images_updated} images)", flush=True)
            return (name, orig_sz, new_sz, True)
        else:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            print(f"[{name}] Kept original in {elapsed:.1f}s: compressed was {new_sz:.2f} MB", flush=True)
            return (name, orig_sz, new_sz, False)
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        print(f"[{name}] ERROR: {e}", flush=True)
        return (name, orig_sz, orig_sz, False)

def main():
    pdf_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "pdf")
    all_pdfs = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))
    targets = [p for p in all_pdfs if os.path.getsize(p) > 22 * 1024 * 1024]
    
    print(f"Found {len(targets)} PDFs exceeding 22 MB:", flush=True)
    for p in targets:
        print(f"  - {os.path.basename(p)} ({os.path.getsize(p)/(1024*1024):.2f} MB)", flush=True)
        
    if not targets:
        print("All PDFs are already <= 22 MB!", flush=True)
        return
        
    workers = min(3, len(targets))
    print(f"\nLaunching parallel compression with {workers} workers...", flush=True)
    start_total = time.time()
    
    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(compress_single_pdf, p): p for p in targets}
        for future in as_completed(futures):
            res = future.result()
            print(f"Finished: {res[0]}", flush=True)
            
    print(f"\nAll targets processed in {time.time() - start_total:.1f}s!", flush=True)
    print("\n--- FINAL VERIFICATION TABLE ---", flush=True)
    all_ok = True
    for p in sorted(glob.glob(os.path.join(pdf_dir, "*.pdf"))):
        sz = os.path.getsize(p) / (1024 * 1024)
        status = "OK (< 25MB)" if sz < 24.5 else "EXCEEDS LIMIT"
        if sz >= 24.5:
            all_ok = False
        print(f"{os.path.basename(p):32s} : {sz:6.2f} MB  [{status}]", flush=True)
        
    if all_ok:
        print("\nALL PDFS ARE VALID AND READY FOR CLOUDFLARE DEPLOYMENT!", flush=True)
    else:
        print("\nSOME PDFS STILL EXCEED 25MB LIMIT!", flush=True)

if __name__ == "__main__":
    main()
