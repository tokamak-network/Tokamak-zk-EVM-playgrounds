import React from "react";
import { Pixel } from "../../utils/imageToPixels";

interface GridPixelRendererProps {
  pixels: Pixel[];
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

export const GridPixelRenderer: React.FC<GridPixelRendererProps> = ({
  pixels,
  containerWidth,
  containerHeight,
  pixelSize,
}) => {
  // 픽셀을 그리드 형태로 정렬
  const gridWidth = Math.ceil(containerWidth / pixelSize);
  const gridHeight = Math.ceil(containerHeight / pixelSize);

  // 그리드 배열 생성
  const grid: (Pixel | null)[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(null));

  // 픽셀을 그리드에 배치
  pixels.forEach((pixel) => {
    const gridX = Math.floor(pixel.x / pixelSize);
    const gridY = Math.floor(pixel.y / pixelSize);
    if (gridY < gridHeight && gridX < gridWidth) {
      grid[gridY][gridX] = pixel;
    }
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridWidth}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${pixelSize}px)`,
        gap: 0,
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,

        // 픽셀 퍼펙트 렌더링
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,
      }}
    >
      {grid.flat().map((pixel, index) => (
        <div
          key={index}
          style={{
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
            backgroundColor: pixel ? pixel.color : "transparent",

            // 픽셀 퍼펙트 렌더링
            imageRendering: "pixelated",
            imageRendering: "-moz-crisp-edges" as any,
            imageRendering: "-webkit-crisp-edges" as any,
            imageRendering: "crisp-edges" as any,

            // 경계 제거
            border: "none",
            outline: "none",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
};
