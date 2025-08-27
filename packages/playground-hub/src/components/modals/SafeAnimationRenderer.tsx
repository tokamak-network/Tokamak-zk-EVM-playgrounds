import React, { useState, useEffect, useRef } from "react";
import { Pixel, svgToPixels } from "../../utils/imageToPixels";
import planetSvg from "../../assets/planet.svg";

interface SafeAnimationRendererProps {
  containerWidth: number;
  containerHeight: number;
  loadingStage: number;
}

export const SafeAnimationRenderer: React.FC<SafeAnimationRendererProps> = ({
  containerWidth,
  containerHeight,
  loadingStage,
}) => {
  const [allPixels, setAllPixels] = useState<Pixel[]>([]);
  const [visiblePixels, setVisiblePixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const stageStartTimeRef = useRef<number>(0);
  const currentStageRef = useRef<number>(-1);

  // Load pixel data once
  useEffect(() => {
    const loadPixels = async () => {
      try {
        console.log("SafeAnimationRenderer: Loading pixels");
        const pixels = await svgToPixels(planetSvg, 80, 50, 1);
        console.log("SafeAnimationRenderer: Loaded", pixels.length, "pixels");
        setAllPixels(pixels);
        setIsLoading(false);
      } catch (error) {
        console.error("SafeAnimationRenderer: Error loading pixels:", error);
        setIsLoading(false);
      }
    };

    loadPixels();
  }, []);

  // Handle stage changes
  useEffect(() => {
    if (isLoading || allPixels.length === 0) return;

    console.log("SafeAnimationRenderer: Stage changed to", loadingStage);

    // Clear previous animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    // Reset stage tracking
    currentStageRef.current = loadingStage;
    stageStartTimeRef.current = Date.now();

    // Calculate visible pixels for this stage
    const updateVisiblePixels = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - stageStartTimeRef.current;

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
        `SafeAnimationRenderer: Stage ${loadingStage}, showing ${activePixels.length}/${currentStagePixels.length} active pixels, total: ${totalVisible.length}`
      );

      setVisiblePixels(totalVisible);

      // Stop animation when all pixels of current stage are visible
      if (pixelsToShow >= currentStagePixels.length) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        console.log(
          "SafeAnimationRenderer: Animation complete for stage",
          loadingStage
        );
      }
    };

    // Initial update
    updateVisiblePixels();

    // Start animation if there are pixels to animate
    const currentStagePixels = allPixels.filter(
      (p) => p.stage === loadingStage
    );
    if (currentStagePixels.length > 0) {
      animationRef.current = setInterval(updateVisiblePixels, 100);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [loadingStage, allPixels, isLoading]);

  if (isLoading) {
    return <div>Loading safe animation...</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        border: "1px solid #00ff00", // Green border to distinguish
        backgroundColor: "#BDBDBD", // Match modal background

        // 픽셀 퍼펙트 컨테이너 설정
        imageRendering: "pixelated",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        fontSmooth: "never" as any,
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        willChange: "transform",

        // 정확한 픽셀 렌더링
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: "10px", color: "#000" }}>
        Safe: {visiblePixels.length} pixels (Stage {loadingStage})
      </div>
      {visiblePixels.map((pixel) => (
        <div
          key={pixel.id}
          style={{
            position: "absolute",
            left: `${pixel.x}px`,
            top: `${pixel.y}px`,
            width: "1px",
            height: "1px",
            backgroundColor: pixel.color,
          }}
        />
      ))}
    </div>
  );
};
