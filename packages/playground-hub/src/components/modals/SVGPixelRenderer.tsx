import React from "react";
import { Pixel } from "../../utils/imageToPixels";

interface SVGPixelRendererProps {
  pixels: Pixel[];
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

export const SVGPixelRenderer: React.FC<SVGPixelRendererProps> = ({
  pixels,
  containerWidth,
  containerHeight,
  pixelSize,
}) => {
  return (
    <svg
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      style={{
        // 픽셀 퍼펙트 렌더링
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,

        // 스무딩 비활성화
        shapeRendering: "crispEdges",

        border: "none",
        outline: "none",
        display: "block",
      }}
    >
      {pixels.map((pixel) => (
        <rect
          key={pixel.id}
          x={pixel.x}
          y={pixel.y}
          width={pixelSize}
          height={pixelSize}
          fill={pixel.color}
          shapeRendering="crispEdges"
        />
      ))}
    </svg>
  );
};
