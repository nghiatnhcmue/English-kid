/**
 * Tiện ích xử lý file âm thanh & nén ảnh WebP cho trình soạn thảo từ vựng của Giáo viên.
 */

export function readAudioFileAsDataUrl(file, maxBytes = 300 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Chưa chọn file âm thanh.'));
    if (file.size > maxBytes) {
      return reject(
        new Error(
          `File âm thanh quá lớn (${(file.size / 1024).toFixed(0)}KB, tối đa ${Math.round(
            maxBytes / 1024,
          )}KB). Hãy cắt ngắn chỉ còn phần đọc từ/câu.`,
        ),
      );
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve({ dataUrl: e.target?.result || '', fileName: file.name });
    reader.onerror = () => reject(new Error('Không đọc được file âm thanh.'));
    reader.readAsDataURL(file);
  });
}

export function compressImageToWebpDataUrl(file, maxDim = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Chưa chọn file ảnh.'));
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => reject(new Error('Không xử lý được ảnh.'));
      img.src = event.target?.result;
    };
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'));
    reader.readAsDataURL(file);
  });
}
