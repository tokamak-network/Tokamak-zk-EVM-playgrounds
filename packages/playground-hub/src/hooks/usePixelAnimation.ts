import { useState, useEffect, useCallback, useRef } from "react";
import { Pixel, generatePixelGrid } from "../utils/imageToPixels";

export enum AnimationState {
  IDLE = "idle",
  STAGE_1 = "stage_1",
  STAGE_2 = "stage_2",
  STAGE_3 = "stage_3",
  STAGE_4 = "stage_4",
  COMPLETE = "complete",
}

interface UsePixelAnimationProps {
  svgUrl: string;
  loadingStage: number; // 0-4 (0 is waiting, 1-4 are each stage)
  onComplete?: () => void;
}

interface UsePixelAnimationReturn {
  stages: LoadingStage[];
  animationState: AnimationState;
  visiblePixels: Pixel[];
  isLoading: boolean;
  error: string | null;
}

export const usePixelAnimation = ({
  svgUrl,
  loadingStage,
  onComplete,
}: UsePixelAnimationProps): UsePixelAnimationReturn => {
  const [stages, setStages] = useState<LoadingStage[]>([]);
  const [animationState, setAnimationState] = useState<AnimationState>(
    AnimationState.IDLE
  );
  const [visiblePixels, setVisiblePixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial pixel data loading
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate pixel grid instead of loading from SVG
      const pixelData = generatePixelGrid(76, 48, 2);

      // Convert to stages format
      const pixelStages = [
        {
          stage: 0,
          pixels: pixelData.filter((p) => p.stage === 0),
          isComplete: false,
        },
        {
          stage: 1,
          pixels: pixelData.filter((p) => p.stage === 1),
          isComplete: false,
        },
        {
          stage: 2,
          pixels: pixelData.filter((p) => p.stage === 2),
          isComplete: false,
        },
        {
          stage: 3,
          pixels: pixelData.filter((p) => p.stage === 3),
          isComplete: false,
        },
        {
          stage: 4,
          pixels: pixelData.filter((p) => p.stage === 4),
          isComplete: false,
        },
      ];

      setStages(pixelStages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate pixel grid"
      );
    } finally {
      setIsLoading(false);
    }
  }, [svgUrl]);

  // Update animation state according to loading stage changes
  useEffect(() => {
    if (stages.length === 0) return;

    // Only update state, do not directly modify stages
    setStages((prevStages) => {
      const newStages = prevStages.map((stage) => ({
        ...stage,
        isActive: false,
        isComplete: false,
      }));

      // Process completion up to current stage
      for (let i = 0; i < 4; i++) {
        if (loadingStage >= 4) {
          // When animation is complete, mark all stages as complete
          newStages[i].isComplete = true;
          newStages[i].isActive = false;
        } else if (i < loadingStage - 1) {
          newStages[i].isComplete = true;
          newStages[i].isActive = false;
        } else if (i === loadingStage - 1 && loadingStage > 0) {
          newStages[i].isActive = true;
          newStages[i].isComplete = false;
        }
      }

      return newStages;
    });

    // Update animation state
    switch (loadingStage) {
      case 0:
        setAnimationState(AnimationState.IDLE);
        break;
      case 1:
        setAnimationState(AnimationState.STAGE_1);
        break;
      case 2:
        setAnimationState(AnimationState.STAGE_2);
        break;
      case 3:
        setAnimationState(AnimationState.STAGE_3);
        break;
      case 4:
        setAnimationState(AnimationState.STAGE_4);
        break;
      default:
        if (loadingStage >= 4) {
          setAnimationState(AnimationState.COMPLETE);
          onComplete?.();
        }
    }
  }, [loadingStage, stages.length]); // Remove onComplete dependency

  // Calculate currently visible pixels - reference latest stages with useRef
  const stagesRef = useRef<LoadingStage[]>([]);

  // Update ref whenever stages change
  useEffect(() => {
    stagesRef.current = stages;
  }, [stages]);

  const updateVisiblePixels = useCallback(() => {
    const visible: Pixel[] = [];
    const currentStages = stagesRef.current;

    currentStages.forEach((stage) => {
      if (stage.isComplete) {
        // Show all pixels of completed stage
        visible.push(...stage.pixels);
      } else if (stage.isActive) {
        // Show pixels of active stage progressively over time
        const currentTime = Date.now();
        const stageStartTime = currentTime - 2000; // Assume started 2 seconds ago (doubled for half speed)

        stage.pixels.forEach((pixel) => {
          const pixelShowTime = stageStartTime + pixel.delay;
          if (currentTime >= pixelShowTime) {
            visible.push(pixel);
          }
        });
      }
    });

    setVisiblePixels(visible);
  }, []); // Empty dependency array

  // Animation frame update
  useEffect(() => {
    if (animationState === AnimationState.IDLE) {
      updateVisiblePixels(); // Update for idle state
      return;
    }

    if (animationState === AnimationState.COMPLETE) {
      updateVisiblePixels(); // Update for complete state - keep all pixels visible
      return;
    }

    let animationId: number;

    const animate = () => {
      updateVisiblePixels();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationState, updateVisiblePixels]); // Add updateVisiblePixels dependency (but safe since empty array)

  return {
    stages,
    animationState,
    visiblePixels,
    isLoading,
    error,
  };
};
