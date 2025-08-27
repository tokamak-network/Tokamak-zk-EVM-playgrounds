import React, { useRef, useEffect } from "react";
import { Pixel } from "../../utils/imageToPixels";

interface ImageDataPixelRendererProps {
  pixels: Pixel[];
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

export const ImageDataPixelRenderer: React.FC<ImageDataPixelRendererProps> = ({
  pixels,
  containerWidth,
  containerHeight,
  pixelSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // ImageData 직접 조작
    const imageData = ctx.createImageData(containerWidth, containerHeight);
    const data = imageData.data;

    // 배경을 투명하게 초기화
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 0; // A (투명)
    }

    // 각 픽셀을 ImageData에 직접 설정
    pixels.forEach((pixel) => {
      const match = pixel.color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
      );
      if (match) {
        const [, r, g, b, a = "1"] = match;
        const red = parseInt(r);
        const green = parseInt(g);
        const blue = parseInt(b);
        const alpha = Math.round(parseFloat(a) * 255);

        // pixelSize x pixelSize 영역을 채움
        for (let dy = 0; dy < pixelSize; dy++) {
          for (let dx = 0; dx < pixelSize; dx++) {
            const x = pixel.x + dx;
            const y = pixel.y + dy;

            if (x < containerWidth && y < containerHeight) {
              const index = (y * containerWidth + x) * 4;
              data[index] = red;
              data[index + 1] = green;
              data[index + 2] = blue;
              data[index + 3] = alpha;
            }
          }
        }
      }
    });

    // ImageData를 Canvas에 그리기
    ctx.putImageData(imageData, 0, 0);
  }, [pixels, containerWidth, containerHeight, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,
        border: "none",
        outline: "none",
        display: "block",
      }}
    />
  );
};
