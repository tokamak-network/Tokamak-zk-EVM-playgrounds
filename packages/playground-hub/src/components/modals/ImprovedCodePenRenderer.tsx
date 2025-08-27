import React, { useRef, useEffect, useState } from "react";
import { Pixel, svgToPixels } from "../../utils/imageToPixels";
import planetSvg from "../../assets/planet.svg";

interface ImprovedCodePenRendererProps {
  containerWidth: number;
  containerHeight: number;
  loadingStage: number;
}

export const ImprovedCodePenRenderer: React.FC<
  ImprovedCodePenRendererProps
> = ({ containerWidth, containerHeight, loadingStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [allPixels, setAllPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const stageStartTimeRef = useRef<number>(0);

  // Load pixel data once
  useEffect(() => {
    const loadPixels = async () => {
      try {
        console.log("ImprovedCodePenRenderer: Loading pixels");
        const pixels = await svgToPixels(planetSvg, 80, 50, 2);
        console.log("ImprovedCodePenRenderer: Loaded", pixels.length, "pixels");
        setAllPixels(pixels);
        setIsLoading(false);
      } catch (error) {
        console.error("ImprovedCodePenRenderer: Error loading pixels:", error);
        setIsLoading(false);
      }
    };

    loadPixels();
  }, []);

  // Handle stage changes and render to canvas
  useEffect(() => {
    if (isLoading || allPixels.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    console.log("ImprovedCodePenRenderer: Stage changed to", loadingStage);

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);

    // Disable all smoothing
    ctx.imageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;
    (ctx as any).oImageSmoothingEnabled = false;

    // Reset stage tracking
    stageStartTimeRef.current = Date.now();

    // Render function
    const renderPixels = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - stageStartTimeRef.current;

      // Clear canvas with modal background color
      ctx.fillStyle = "#BDBDBD"; // Match modal background
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // Get all pixels for completed stages
      const completedPixels: Pixel[] = [];
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
        Math.floor(elapsed / 50) // 1 pixel every 50ms
      );

      const activePixels = currentStagePixels.slice(0, pixelsToShow);
      const totalVisible = [...completedPixels, ...activePixels];

      console.log(
        `ImprovedCodePenRenderer: Stage ${loadingStage}, showing ${activePixels.length}/${currentStagePixels.length} active pixels, total: ${totalVisible.length}`
      );

      // Draw all visible pixels
      totalVisible.forEach((pixel) => {
        // Parse color from rgba string
        const colorMatch = pixel.color.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
        );
        if (colorMatch) {
          const [, r, g, b] = colorMatch;
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(Math.floor(pixel.x), Math.floor(pixel.y), 1, 1);
        }
      });

      // Stop animation when all pixels of current stage are visible
      if (pixelsToShow >= currentStagePixels.length) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        console.log(
          "ImprovedCodePenRenderer: Animation complete for stage",
          loadingStage
        );
      }
    };

    // Initial render
    renderPixels();

    // Start animation if there are pixels to animate
    const currentStagePixels = allPixels.filter(
      (p) => p.stage === loadingStage
    );
    if (currentStagePixels.length > 0) {
      animationRef.current = setInterval(renderPixels, 100);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [loadingStage, allPixels, isLoading, containerWidth, containerHeight]);

  if (isLoading) {
    return <div>Loading improved CodePen...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        // CodePen 스타일 픽셀 퍼펙트 설정
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,

        // 하드웨어 가속 및 변환 최적화
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        // 정확한 픽셀 렌더링
        display: "block",
        border: "1px solid #ff6600", // Orange border to distinguish
        outline: "none",
      }}
    />
  );
};
