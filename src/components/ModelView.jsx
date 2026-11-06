import { forwardRef, useEffect, useRef, useState } from 'react';
import { WordImage } from './ui.jsx';

let loader;
/** Tải thư viện @google/model-viewer chỉ khi có từ cần hiển thị mô hình 3D */
export function ensureModelViewer() {
  loader ??= import('@google/model-viewer');
  return loader;
}

/**
 * Hiển thị mô hình 3D .glb của từ vựng tiếng Anh.
 * Tự động lùi về hình ảnh minh họa hoặc emoji nếu chưa có file 3D hoặc lỗi tải.
 */
const ModelView = forwardRef(function ModelView(
  { word, interactive = false, autoRotate = true, ar = false, size = 'lg', className = '', style, children, onLoad },
  ref,
) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const innerRef = useRef(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useEffect(() => {
    if (!word?.model3d) return undefined;
    let alive = true;
    ensureModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [word?.model3d]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    const handleLoad = () => onLoadRef.current?.();
    const handleError = () => setFailed(true);
    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);
    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
    };
  }, [ready]);

  const setRefs = (el) => {
    innerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  if (!word?.model3d || failed || !ready) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={style}>
        <WordImage word={word} size={size} />
      </div>
    );
  }

  return (
    <model-viewer
      ref={setRefs}
      src={word.model3d}
      alt={`Mô hình 3D: ${word.word}`}
      loading={interactive ? 'eager' : 'lazy'}
      reveal="auto"
      camera-orbit="30deg 70deg auto"
      shadow-intensity="1"
      exposure="1.05"
      bounds="tight"
      interaction-prompt="none"
      {...(interactive ? { 'camera-controls': true, 'touch-action': 'pan-y' } : {})}
      {...(autoRotate ? { 'auto-rotate': true, 'rotation-per-second': '20deg' } : {})}
      {...(ar ? { ar: true, 'ar-modes': 'webxr scene-viewer quick-look' } : {})}
      className={className}
      style={{ pointerEvents: interactive ? 'auto' : 'none', background: 'transparent', ...style }}
    >
      <div slot="progress-bar" />
      {children}
    </model-viewer>
  );
});

export default ModelView;

/** Ghi nhớ màu gốc của mọi vật liệu để có thể "về màu gốc". */
function originalColors(mv) {
  if (!mv.__originalColors && mv.model?.materials) {
    mv.__originalColors = mv.model.materials.map((m) => [...m.pbrMetallicRoughness.baseColorFactor]);
  }
  return mv.__originalColors;
}

/** Đổi màu toàn bộ vật liệu của model (hex), hoặc trả về màu gốc khi hex = null. */
export function applyModelColor(mv, hex) {
  if (!mv?.model?.materials?.length) return false;
  const originals = originalColors(mv);
  mv.model.materials.forEach((m, i) => {
    if (hex) m.pbrMetallicRoughness.setBaseColorFactor(hex);
    else if (originals?.[i]) m.pbrMetallicRoughness.setBaseColorFactor(originals[i]);
  });
  return true;
}
