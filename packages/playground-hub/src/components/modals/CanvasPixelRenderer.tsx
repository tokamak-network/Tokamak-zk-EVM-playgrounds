import React, { useRef, useEffect } from "react";
import { Pixel } from "../../utils/imageToPixels";

interface CanvasPixelRendererProps {
  pixels: Pixel[];
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

export const CanvasPixelRenderer: React.FC<CanvasPixelRendererProps> = ({
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

    // 픽셀 퍼펙트 렌더링 설정
    ctx.imageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
    (ctx as any).oImageSmoothingEnabled = false;

    // 배경 클리어
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // 각 픽셀을 직접 그리기
    pixels.forEach((pixel) => {
      // 색상 파싱 (rgba(r,g,b,a) 형태)
      const match = pixel.color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
      );
      if (match) {
        const [, r, g, b, a = "1"] = match;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

        // 픽셀 사각형 그리기
        ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);
      }
    });
  }, [pixels, containerWidth, containerHeight, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        // 완전한 픽셀 퍼펙트 렌더링
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,
        imageRendering: "-webkit-optimize-contrast" as any,

        // 스무딩 완전 비활성화
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // 하드웨어 가속
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        // 경계 정리
        border: "none",
        outline: "none",
        display: "block",
      }}
    />
  );
};
