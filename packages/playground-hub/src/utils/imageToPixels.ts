export interface Pixel {
  id: string;
  x: number;
  y: number;
  color: string;
  stage: number;
  delay: number;
}

/**
 * Calculate animation delay for each pixel
 */
export const calculatePixelDelay = (
  x: number,
  y: number,
  stage: number
): number => {
  const stageDelay = stage * 200; // 200ms per stage (much faster)
  const pixelDelay = (x + y) * 5; // 5ms per pixel (faster)
  const rowDelay = y * 2; // 2ms per row (faster)
  return stageDelay + pixelDelay + rowDelay;
};

/**
 * Determine which stage a pixel belongs to based on Y position
 */
export const getStageFromY = (y: number, height: number): number => {
  const stageHeight = height / 5;
  return Math.floor(y / stageHeight);
};

/**
 * Extract actual pixel colors from SVG image and replace background colors
 */
export const svgToPixels = async (
  svgUrl: string,
  width: number = 76,
  height: number = 48,
  pixelSize: number = 2
): Promise<Pixel[]> => {
  return new Promise((resolve, reject) => {
    console.log("svgToPixels: Loading image from", svgUrl);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = svgUrl;

    img.onload = () => {
      console.log("svgToPixels: Image loaded successfully");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("svgToPixels: Canvas context not available");
        reject(new Error("Canvas context not available"));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      // 완전한 픽셀 퍼펙트 렌더링을 위한 설정
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;
      (ctx as any).oImageSmoothingEnabled = false;

      // 원본 크기로 그리기 (스케일링 없음)
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels: Pixel[] = [];
      console.log("svgToPixels: Processing image data...");

      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          const index = (y * width + x) * 4;
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const a = imageData.data[index + 3];

          // Check if pixel is background (white/light colors)
          const brightness = (r + g + b) / 3;
          const isBackground =
            brightness > 230 || (r > 240 && g > 240 && b > 240);

          // Skip background pixels entirely - only create pixels for planet/ring
          if (!isBackground) {
            const color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            const stage = getStageFromY(y, height);
            const delay = calculatePixelDelay(x, y, stage);

            pixels.push({
              id: `pixel-${x}-${y}`,
              x,
              y,
              color,
              stage,
              delay,
            });
          }
        }
      }

      console.log(
        "svgToPixels: Completed processing, created",
        pixels.length,
        "pixels"
      );
      resolve(pixels);
    };

    img.onerror = (error) => {
      console.error("svgToPixels: Failed to load image:", error);
      reject(new Error(`Failed to load image: ${error}`));
    };
  });
};
