import React, { useRef, useEffect, useState } from "react";
import planetSvg from "../../assets/planet.svg";

interface AnimatedCodePenRendererProps {
  containerWidth: number;
  containerHeight: number;
  pixelSize: number;
  loadingStage: number;
}

interface PixelData {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  stage: number;
}

export const AnimatedCodePenRenderer: React.FC<
  AnimatedCodePenRendererProps
> = ({ containerWidth, containerHeight, pixelSize, loadingStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [allPixels, setAllPixels] = useState<PixelData[]>([]);
  const [visiblePixels, setVisiblePixels] = useState<PixelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const currentStageRef = useRef<number>(-1);
  const stageStartTimeRef = useRef<number>(0);

  // Load and process image data once (CodePen style)
  useEffect(() => {
    // Skip if already loading or loaded
    if (allPixels.length > 0) {
      console.log("AnimatedCodePenRenderer: Pixels already loaded, skipping");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    console.log("AnimatedCodePenRenderer: Loading image from", planetSvg);

    // CodePen 스타일: 이미지 로드 후 픽셀화
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planetSvg;

    console.log("AnimatedCodePenRenderer: Image src set, waiting for load...");

    img.onload = () => {
      console.log(
        "AnimatedCodePenRenderer: Image loaded successfully, processing pixels"
      );

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

      const pixels: PixelData[] = [];

      // 픽셀 단위로 데이터 추출 (개선된 샘플링)
      for (let y = 0; y < containerHeight; y += pixelSize) {
        for (let x = 0; x < containerWidth; x += pixelSize) {
          // 픽셀 블록의 평균값 계산 (더 나은 품질)
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

          // 투명하지 않은 픽셀만 처리 (CodePen 방식)
          if (a > 0) {
            // 밝은 배경 픽셀 필터링 (CodePen 방식)
            const brightness = (r + g + b) / 3;
            const isBackground =
              brightness > 230 || (r > 240 && g > 240 && b > 240);

            if (!isBackground) {
              // Safe 스타일의 스테이지 계산
              const stageHeight = containerHeight / 5;
              const stage = Math.floor(y / stageHeight);

              pixels.push({
                x: Math.floor(x),
                y: Math.floor(y),
                r,
                g,
                b,
                stage,
              });
            }
          }
        }
      }

      console.log(
        "AnimatedCodePenRenderer: Processed",
        pixels.length,
        "pixels"
      );
      console.log(
        "AnimatedCodePenRenderer: Setting pixels and isLoading=false"
      );
      setAllPixels(pixels);
      setIsLoading(false);
    };

    img.onerror = (error) => {
      console.error("AnimatedCodePenRenderer: Failed to load image:", error);
      setIsLoading(false);
    };
  }, []); // Only run once on mount

  // Handle stage changes with Safe-style animation
  useEffect(() => {
    if (isLoading || allPixels.length === 0) return;

    console.log("AnimatedCodePenRenderer: Stage changed to", loadingStage);

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Reset stage tracking
    currentStageRef.current = loadingStage;
    stageStartTimeRef.current = Date.now();

    // Calculate visible pixels for this stage (Safe animation logic)
    const updateVisiblePixels = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - stageStartTimeRef.current;

      // Get all pixels for completed stages
      const completedPixels: PixelData[] = [];
      for (let stage = 0; stage < loadingStage; stage++) {
        const stagePixels = allPixels.filter((p) => p.stage === stage);
        completedPixels.push(...stagePixels);
      }

      // Get progressive pixels for current stage
      const currentStagePixels = allPixels.filter(
        (p) => p.stage === loadingStage
      );
      const pixelsToShow = Math.min(
        currentStagePixels.length,
        Math.floor(elapsed / 50) // 1 pixel every 50ms (Safe timing)
      );

      const activePixels = currentStagePixels.slice(0, pixelsToShow);
      const totalVisible = [...completedPixels, ...activePixels];

      console.log(
        `AnimatedCodePenRenderer: Stage ${loadingStage}, showing ${activePixels.length}/${currentStagePixels.length} active pixels, total: ${totalVisible.length}`
      );

      setVisiblePixels(totalVisible);

      // Stop animation when all pixels of current stage are visible
      if (pixelsToShow >= currentStagePixels.length) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        console.log(
          "AnimatedCodePenRenderer: Animation complete for stage",
          loadingStage
        );
      }
    };

    // Start animation if there are pixels to animate
    const currentStagePixels = allPixels.filter(
      (p) => p.stage === loadingStage
    );
    if (currentStagePixels.length > 0) {
      animationRef.current = setInterval(updateVisiblePixels, 100);
      updateVisiblePixels(); // Initial call
    } else {
      // No pixels for this stage, just show completed pixels
      const completedPixels: PixelData[] = [];
      for (let stage = 0; stage < loadingStage; stage++) {
        const stagePixels = allPixels.filter((p) => p.stage === stage);
        completedPixels.push(...stagePixels);
      }
      setVisiblePixels(completedPixels);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [loadingStage, allPixels, isLoading]);

  // Canvas rendering effect (CodePen style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    console.log(
      "AnimatedCodePenRenderer: Rendering",
      visiblePixels.length,
      "pixels"
    );

    // Clear canvas (transparent background like CodePen)
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Render visible pixels with CodePen style
    visiblePixels.forEach((pixel, index) => {
      ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
      ctx.fillRect(pixel.x, pixel.y, pixelSize, pixelSize);

      // Log first few pixels for debugging
      if (index < 3) {
        console.log(
          `AnimatedCodePenRenderer: Pixel ${index}: (${pixel.x}, ${pixel.y}) color: rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
        );
      }
    });
  }, [visiblePixels, containerWidth, containerHeight, pixelSize]);

  if (isLoading) {
    return (
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        // CodePen 스타일 렌더링 설정
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        display: "block",
        border: "1px solid #9C27B0", // Purple border to distinguish animated CodePen
        outline: "none",
        width: "76px",
        height: "48px",
      }}
    />
  );
};
