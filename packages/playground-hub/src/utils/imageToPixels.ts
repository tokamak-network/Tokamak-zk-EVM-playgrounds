export interface Pixel {
  id: string;
  x: number;
  y: number;
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
  const stageDelay = stage * 1000; // 1 second per stage (doubled from 500ms)
  const pixelDelay = (x + y) * 20; // 20ms per pixel (doubled from 10ms)
  const rowDelay = y * 10; // 10ms per row (doubled from 5ms)
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
 * Generate pixel grid for image splitting animation
 * Instead of extracting colors, we just create a grid of positions
 */
export const generatePixelGrid = (
  width: number = 76,
  height: number = 48,
  pixelSize: number = 2
): Pixel[] => {
  const pixels: Pixel[] = [];

  // Generate grid of pixel positions
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const stage = getStageFromY(y, height);
      const delay = calculatePixelDelay(x, y, stage);

      pixels.push({
        id: `pixel-${x}-${y}`,
        x,
        y,
        stage,
        delay,
      });
    }
  }

  return pixels;
};
