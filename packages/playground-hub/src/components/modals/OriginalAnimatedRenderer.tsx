import React, { useRef, useEffect, useState } from "react";
import planetSvg from "../../assets/planet.svg";

interface OriginalAnimatedRendererProps {
  containerWidth: number;
  containerHeight: number;
  loadingStage: number;
}

export const OriginalAnimatedRenderer: React.FC<
  OriginalAnimatedRendererProps
> = ({ containerWidth, containerHeight, loadingStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const currentStageRef = useRef<number>(-1);
  const stageStartTimeRef = useRef<number>(0);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  // Load original image once
  useEffect(() => {
    console.log("OriginalAnimatedRenderer: Loading original image");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planetSvg;

    img.onload = () => {
      console.log("OriginalAnimatedRenderer: Original image loaded");
      setOriginalImage(img);
      setIsLoading(false);
    };

    img.onerror = (error) => {
      console.error("OriginalAnimatedRenderer: Failed to load image:", error);
      setIsLoading(false);
    };
  }, []);

  // Handle stage changes with animation
  useEffect(() => {
    if (isLoading || !originalImage) return;

    console.log("OriginalAnimatedRenderer: Stage changed to", loadingStage);

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Reset stage tracking
    currentStageRef.current = loadingStage;
    stageStartTimeRef.current = Date.now();

    // Calculate animation progress for this stage
    const updateAnimationProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - stageStartTimeRef.current;

      // Each stage takes 3 seconds to complete
      const stageDuration = 3000;
      const stageProgress = Math.min(elapsed / stageDuration, 1);

      // Total progress: completed stages + current stage progress
      const totalProgress = (loadingStage + stageProgress) / 5; // 5 total stages (0-4)

      console.log(
        `OriginalAnimatedRenderer: Stage ${loadingStage}, progress: ${(stageProgress * 100).toFixed(1)}%, total: ${(totalProgress * 100).toFixed(1)}%`
      );

      setAnimationProgress(totalProgress);

      // Stop animation when current stage is complete
      if (stageProgress >= 1) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        console.log(
          "OriginalAnimatedRenderer: Animation complete for stage",
          loadingStage
        );
      }
    };

    // Start animation
    animationRef.current = setInterval(updateAnimationProgress, 50); // 20fps
    updateAnimationProgress(); // Initial call

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [loadingStage, isLoading, originalImage]);

  // Canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 고품질 렌더링 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);

    // 이미지 스무딩 활성화 (원본 품질 유지)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    (ctx as any).webkitImageSmoothingEnabled = true;
    (ctx as any).mozImageSmoothingEnabled = true;
    (ctx as any).msImageSmoothingEnabled = true;
    (ctx as any).oImageSmoothingEnabled = true;

    console.log(
      "OriginalAnimatedRenderer: Rendering with progress",
      (animationProgress * 100).toFixed(1) + "%"
    );

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Create clipping mask based on animation progress
    ctx.save();

    // Create vertical reveal animation (top to bottom)
    const revealHeight = containerHeight * animationProgress;
    ctx.beginPath();
    ctx.rect(0, 0, containerWidth, revealHeight);
    ctx.clip();

    // Draw the original image (full quality)
    ctx.drawImage(originalImage, 0, 0, containerWidth, containerHeight);

    ctx.restore();
  }, [originalImage, animationProgress, containerWidth, containerHeight]);

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
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        // 원본 이미지 품질 유지 (True와 동일한 설정)
        imageRendering: "auto",
        imageRendering: "high-quality" as any,
        imageRendering: "-webkit-optimize-contrast" as any,

        // 브라우저 스무딩 활성화 (원본 품질)
        WebkitFontSmoothing: "antialiased" as any,
        MozOsxFontSmoothing: "grayscale" as any,
        fontSmooth: "always" as any,

        // 하드웨어 가속
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        display: "block",
        border: "1px solid #FF5722", // Red-orange border to distinguish
        outline: "none",
      }}
    />
  );
};
