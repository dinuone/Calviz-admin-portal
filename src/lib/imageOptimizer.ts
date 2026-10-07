/**
 * Client-Side Image Optimizer
 * Automatically resizes & compresses uploaded images to modern WebP format (max ~200-300KB)
 * preserving crisp visual quality while dramatically speeding up page loads.
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
}

export async function optimizeImageForUpload(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  // If it's not an image (e.g. PDF for bank slip), do not touch
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If already small (< 150 KB) and already webp, skip re-compression
  if (file.size <= 150 * 1024 && file.type === "image/webp") {
    return file;
  }

  const {
    maxWidth = 1600,
    maxHeight = 2000,
    quality = 0.85,
  } = options;

  return new Promise((resolve) => {
    // Fallback gracefully to original file if browser environment lacks canvas
    if (typeof window === "undefined" || !window.HTMLCanvasElement) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale down
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }

        // High quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP (supported by all modern browsers)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }

            // Generate clean filename with .webp extension
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const optimizedFile = new File([blob], `${originalNameWithoutExt}.webp`, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            // If optimized file is somehow larger than original, keep original
            if (optimizedFile.size >= file.size && file.type === "image/webp") {
              return resolve(file);
            }

            resolve(optimizedFile);
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
