import React, { useRef, useEffect } from "react";
import planetSvg from "../../assets/planet.svg";

interface CodePenStyleRendererProps {
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
}

export const CodePenStyleRenderer: React.FC<CodePenStyleRendererProps> = ({
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

    // CodePen 스타일: 이미지 로드 후 픽셀화
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planetSvg;

    img.onload = () => {
      // Canvas 크기를 정확히 설정 (디바이스 픽셀 비율 고려)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;

      // CSS 크기는 원본 크기로 유지
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      // 컨텍스트 스케일링
      ctx.scale(dpr, dpr);

      // 모든 브라우저의 이미지 스무딩 완전 비활성화
      ctx.imageSmoothingEnabled = false;
      (ctx as any).webkitImageSmoothingEnabled = false;
      (ctx as any).mozImageSmoothingEnabled = false;
      (ctx as any).msImageSmoothingEnabled = false;
      (ctx as any).oImageSmoothingEnabled = false;

      // 추가 렌더링 최적화
      ctx.imageSmoothingQuality = "high";
      (ctx as any).textRenderingOptimization = "optimizeSpeed";
      (ctx as any).colorRendering = "optimizeSpeed";

      // 임시 캔버스에 원본 이미지 그리기
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCanvas.width = containerWidth;
      tempCanvas.height = containerHeight;
      tempCtx.imageSmoothingEnabled = false;
      (tempCtx as any).webkitImageSmoothingEnabled = false;
      (tempCtx as any).mozImageSmoothingEnabled = false;
      (tempCtx as any).msImageSmoothingEnabled = false;
      (tempCtx as any).oImageSmoothingEnabled = false;

      // 원본 이미지를 임시 캔버스에 그리기
      tempCtx.drawImage(img, 0, 0, containerWidth, containerHeight);

      // 픽셀 데이터 추출
      const imageData = tempCtx.getImageData(
        0,
        0,
        containerWidth,
        containerHeight
      );
      const data = imageData.data;

      // 메인 캔버스 클리어
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // 픽셀 단위로 정확하게 그리기 (개선된 샘플링)
      for (let y = 0; y < containerHeight; y += pixelSize) {
        for (let x = 0; x < containerWidth; x += pixelSize) {
          // 픽셀 블록의 평균값 계산 (정보 손실 최소화)
          let totalR = 0,
            totalG = 0,
            totalB = 0,
            totalA = 0;
          let sampleCount = 0;

          for (let dy = 0; dy < pixelSize && y + dy < containerHeight; dy++) {
            for (let dx = 0; dx < pixelSize && x + dx < containerWidth; dx++) {
              const index = ((y + dy) * containerWidth + (x + dx)) * 4;
              totalR += data[index];
              totalG += data[index + 1];
              totalB += data[index + 2];
              totalA += data[index + 3];
              sampleCount++;
            }
          }

          const r = Math.round(totalR / sampleCount);
          const g = Math.round(totalG / sampleCount);
          const b = Math.round(totalB / sampleCount);
          const a = Math.round(totalA / sampleCount);

          // 투명하지 않은 픽셀만 그리기 (배경 제외)
          if (a > 128) {
            // 알파 임계값 상향 조정
            // 밝은 배경 픽셀 필터링 (더 정확한 조건)
            const brightness = (r + g + b) / 3;
            const isBackground =
              brightness > 240 || (r > 250 && g > 250 && b > 250); // 더 엄격한 배경 필터링

            if (!isBackground) {
              ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
              // 정수 좌표로 정확히 그리기 (서브픽셀 렌더링 방지)
              const pixelX = Math.floor(x);
              const pixelY = Math.floor(y);
              ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

              // 픽셀 경계 강화 (선택적)
              // ctx.strokeStyle = ctx.fillStyle;
              // ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
            }
          }
        }
      }
    };
  }, [containerWidth, containerHeight, pixelSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        // 가장 강력한 픽셀 퍼펙트 설정
        imageRendering: "pixelated",
        imageRendering: "-moz-crisp-edges" as any,
        imageRendering: "-webkit-crisp-edges" as any,
        imageRendering: "crisp-edges" as any,

        // 브라우저 스무딩 완전 비활성화
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // 하드웨어 가속 및 변환 최적화
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        // 정확한 픽셀 렌더링
        display: "block",
        border: "none",
        outline: "none",

        // 추가 선명도 설정 제거 (검은색 영역 확산 방지)
        // filter: "contrast(1.1) saturate(1.1)",

        // 정수 배율 강제
        width: "76px",
        height: "48px",
      }}
    />
  );
};
