import React, { useRef, useEffect, useState } from "react";
import planetSvg from "../../assets/planet.svg";

interface OriginalAnimatedRendererProps {
  containerWidth: number;
  containerHeight: number;
  loadingStage: number;
}

interface PixelData {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  a: number;
  stage: number;
  animationDelay: number;
}

export const OriginalAnimatedRenderer: React.FC<
  OriginalAnimatedRendererProps
> = ({ containerWidth, containerHeight, loadingStage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allPixels, setAllPixels] = useState<PixelData[]>([]);
  const [visiblePixels, setVisiblePixels] = useState<PixelData[]>([]);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null
  );


  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const currentStageRef = useRef<number>(-1);
  const stageStartTimeRef = useRef<number>(0);

  // Load image and extract pixel data
  useEffect(() => {
    if (allPixels.length > 0) return; // Skip if already loaded

    console.log("OriginalAnimatedRenderer: Loading and processing image");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = planetSvg;

    img.onload = () => {
      console.log("OriginalAnimatedRenderer: Image loaded, extracting pixels");

      // Create temporary canvas to extract pixel data
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCanvas.width = containerWidth;
      tempCanvas.height = containerHeight;

      // Enable high-quality rendering for pixel extraction
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = "high";

      // Draw image to extract pixels
      tempCtx.drawImage(img, 0, 0, containerWidth, containerHeight);

      // Extract pixel data
      const imageData = tempCtx.getImageData(
        0,
        0,
        containerWidth,
        containerHeight
      );
      const data = imageData.data;
      const pixels: PixelData[] = [];

      // Process every pixel
      for (let y = 0; y < containerHeight; y++) {
        for (let x = 0; x < containerWidth; x++) {
          const index = (y * containerWidth + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          // Only include visible pixels (skip transparent background)
          if (a > 50) {
            // Determine stage based on Y position (like Safe renderer)
            const stageHeight = containerHeight / 5;
            const stage = Math.floor(y / stageHeight);

            // Add random delay for more natural animation
            const animationDelay = Math.random() * 1000; // 0-1000ms delay

            pixels.push({
              x,
              y,
              r,
              g,
              b,
              a,
              stage,
              animationDelay,
            });
          }
        }
      }

      console.log(
        "OriginalAnimatedRenderer: Extracted",
        pixels.length,
        "pixels"
      );
      setAllPixels(pixels);
      setOriginalImage(img); // Store original image for final rendering
      setIsLoading(false);
    };

    img.onerror = (error) => {
      console.error("OriginalAnimatedRenderer: Failed to load image:", error);
      setIsLoading(false);
    };
  }, [containerWidth, containerHeight]);

  // Handle stage changes with pixel animation
  useEffect(() => {
    if (isLoading || allPixels.length === 0) return;

    console.log("OriginalAnimatedRenderer: Stage changed to", loadingStage);

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Reset stage tracking
    currentStageRef.current = loadingStage;
    stageStartTimeRef.current = Date.now();

    // Calculate visible pixels for this stage (only current stage, no completed stages)
    const updateVisiblePixels = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - stageStartTimeRef.current;

      // Get progressive pixels for current stage only
      const currentStagePixels = allPixels.filter(
        (p) => p.stage === loadingStage
      );
      const activePixels = currentStagePixels.filter((pixel) => {
        return elapsed > pixel.animationDelay;
      });

      console.log(
        `OriginalAnimatedRenderer: Stage ${loadingStage}, showing ${activePixels.length}/${currentStagePixels.length} pixels`
      );

      setVisiblePixels(activePixels);

      // Restart animation when all pixels of current stage are visible (infinite loop)
      if (activePixels.length >= currentStagePixels.length) {
        console.log(
          "OriginalAnimatedRenderer: Animation complete for stage",
          loadingStage,
          "- restarting"
        );
        
        // Restart the animation for this stage after a brief pause
        setTimeout(() => {
          stageStartTimeRef.current = Date.now(); // Reset start time
        }, 500); // 500ms pause before restarting
      }
    };

    // Start animation
    animationRef.current = setInterval(updateVisiblePixels, 50); // 20fps
    updateVisiblePixels(); // Initial call

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [loadingStage, isLoading, allPixels]);

  // Canvas rendering effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
      "OriginalAnimatedRenderer: Rendering",
      visiblePixels.length,
      "pixels (Particles)"
    );

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    if (originalImage) {
      // Mixed rendering: completed stages as original image + current stage as particles

      // First, draw the original image for completed stages
      const stageHeight = containerHeight / 5;
      const completedHeight = loadingStage * stageHeight;

      if (completedHeight > 0) {
        // Draw completed stages as original image
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, containerWidth, completedHeight);
        ctx.clip();
        ctx.drawImage(originalImage, 0, 0, containerWidth, containerHeight);
        ctx.restore();

        console.log(
          `OriginalAnimatedRenderer: Drew completed stages (0-${loadingStage - 1}) as original image, height: ${completedHeight}px`
        );
      }

      // Then, render current stage as animated particles
      const currentTime = Date.now();
      const stageElapsed = currentTime - stageStartTimeRef.current;

      // Only render pixels for the current stage
      const currentStagePixels = visiblePixels.filter(
        (pixel) => pixel.stage === loadingStage
      );

      currentStagePixels.forEach((pixel) => {
        const pixelElapsed = stageElapsed - pixel.animationDelay;

        if (pixelElapsed > 0) {
          // Calculate flying animation for this pixel
          const animationDuration = 500; // 500ms flight time
          const progress = Math.min(pixelElapsed / animationDuration, 1);

          // Easing function for smooth animation
          const easeOut = 1 - Math.pow(1 - progress, 3);

          // Calculate current position (flying from left - outside component border)
          const startX = -250; // Start 250px to the left (outside component)
          const currentX = startX + (pixel.x - startX) * easeOut;
          const currentY = pixel.y;

          // Set pixel color
          ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;

          // Draw pixel (1x1 for maximum sharpness)
          ctx.fillRect(Math.round(currentX), Math.round(currentY), 1, 1);
        }
      });

      console.log(
        `OriginalAnimatedRenderer: Drew ${currentStagePixels.length} particles for current stage ${loadingStage}`
      );
    }
  }, [
    visiblePixels,
    containerWidth,
    containerHeight,
    originalImage,
    loadingStage,
  ]);

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
