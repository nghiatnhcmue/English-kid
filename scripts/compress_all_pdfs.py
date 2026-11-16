import os
import glob
import io
import fitz
from PIL import Image

def compress_pdf(pdf_path, max_dim=1250, quality=72):
    orig_size = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f"Compressing {os.path.basename(pdf_path)} ({orig_size:.2f} MB)...")
    
    tmp_path = pdf_path + ".tmp.pdf"
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    images_compressed = 0
    
    for page_idx, page in enumerate(doc):
        img_list = page.get_images(full=True)
        for img_info in img_list:
            xref = img_info[0]
            try:
                base_img = doc.extract_image(xref)
                if not base_img:
                    continue
                img_bytes = base_img["image"]
                pil_img = Image.open(io.BytesIO(img_bytes))
                
                w, h = pil_img.size
                if w > max_dim or h > int(max_dim * 1.35):
                    pil_img.thumbnail((max_dim, int(max_dim * 1.35)), Image.Resampling.LANCZOS)
                
                out_io = io.BytesIO()
                if pil_img.mode in ("RGBA", "P"):
                    pil_img = pil_img.convert("RGB")
                pil_img.save(out_io, format="JPEG", quality=quality, optimize=True)
                doc.update_stream(xref, out_io.getvalue())
                images_compressed += 1
            except Exception:
                continue

    doc.save(tmp_path, garbage=4, deflate=True)
    doc.close()
    
    new_size = os.path.getsize(tmp_path) / (1024 * 1024)
    if new_size < orig_size:
        os.replace(tmp_path, pdf_path)
        print(f"  -> Reduced to {new_size:.2f} MB (saved {orig_size - new_size:.2f} MB)")
    else:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        print(f"  -> Kept original (compressed was {new_size:.2f} MB)")

def main():
    pdf_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "pdf")
    all_pdfs = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    
    print(f"Found {len(all_pdfs)} PDF files in {pdf_dir}")
    target_pdfs = [p for p in all_pdfs if os.path.getsize(p) > 23 * 1024 * 1024]
    print(f"Found {len(target_pdfs)} PDFs exceeding 23 MB threshold")
    
    for p in target_pdfs:
        compress_pdf(p)

    print("\nSummary of all PDF file sizes:")
    for p in sorted(all_pdfs):
        sz = os.path.getsize(p) / (1024 * 1024)
        status = "OK (< 25MB)" if sz < 24.5 else "EXCEEDS LIMIT (> 25MB)"
        print(f"  {os.path.basename(p):30s} : {sz:6.2f} MB  [{status}]")

if __name__ == "__main__":
    main()
