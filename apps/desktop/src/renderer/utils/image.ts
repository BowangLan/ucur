export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to read image from clipboard"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read image from clipboard"));
    reader.readAsDataURL(file);
  });
}

export function extractBase64(dataUrl: string): string {
  const splitAt = dataUrl.indexOf(",");
  return splitAt >= 0 ? dataUrl.slice(splitAt + 1) : dataUrl;
}

export async function normalizeForVisionModel(
  sourceDataUrl: string
): Promise<{ imageBase64: string; imageMimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxDimension = 2048;
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to prepare pasted image"));
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const normalizedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      resolve({
        imageBase64: extractBase64(normalizedDataUrl),
        imageMimeType: "image/jpeg",
      });
    };
    img.onerror = () => reject(new Error("Failed to decode pasted image"));
    img.src = sourceDataUrl;
  });
}
