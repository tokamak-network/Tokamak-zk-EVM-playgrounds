import { useState, useEffect, useCallback, useRef } from "react";
import { Pixel, svgToPixels } from "../utils/imageToPixels";

export enum AnimationState {
  IDLE = "idle",
  STAGE_1 = "stage_1",
  STAGE_2 = "stage_2",
  STAGE_3 = "stage_3",
  STAGE_4 = "stage_4",
  COMPLETE = "complete",
}

export interface LoadingStage {
  stage: number;
  pixels: Pixel[];
  isComplete: boolean;
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
    const loadPixelData = async () => {
      try {
        // console.log("Starting pixel data loading for SVG:", svgUrl);
        setIsLoading(true);
        setError(null);

        // Extract actual pixel colors from SVG with background replacement
        const pixelData = await svgToPixels(svgUrl, 76, 48, 2);
        // console.log("Loaded pixel data:", pixelData.length, "pixels");

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

        // console.log(
        //   "Pixel stages created:",
        //   pixelStages.map((s) => ({
        //     stage: s.stage,
        //     pixelCount: s.pixels.length,
        //   }))
        // );
        setStages(pixelStages);
      } catch (err) {
        console.error("Error loading pixel data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load pixel data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPixelData();
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
      for (let i = 0; i < 5; i++) {
        if (loadingStage >= 5) {
          // When animation is complete, mark all stages as complete
          newStages[i].isComplete = true;
          newStages[i].isActive = false;
        } else if (i < loadingStage) {
          newStages[i].isComplete = true;
          newStages[i].isActive = false;
        } else if (i === loadingStage) {
          newStages[i].isActive = true;
          newStages[i].isComplete = false;
          // Reset start time when stage becomes active
          delete (newStages[i] as any).startTime;
        }
      }

      console.log(
        `LoadingStage: ${loadingStage}, Stages:`,
        newStages.map((s) => ({
          stage: s.stage,
          active: s.isActive,
          complete: s.isComplete,
          pixelCount: s.pixels.length,
        }))
      );
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

    console.log(
      "Updating visible pixels, stages:",
      currentStages.map((s) => ({
        stage: s.stage,
        active: s.isActive,
        complete: s.isComplete,
        pixelCount: s.pixels.length,
      }))
    );

    currentStages.forEach((stage, index) => {
      if (stage.isComplete) {
        // Show all pixels of completed stage immediately
        console.log(
          `Stage ${stage.stage} is complete, adding ${stage.pixels.length} pixels`
        );
        visible.push(...stage.pixels);
      } else if (stage.isActive) {
        // For active stage, show pixels progressively with simplified timing
        const currentTime = Date.now();

        // Use a stage-specific start time that gets set when stage becomes active
        if (!(stage as any).startTime) {
          (stage as any).startTime = currentTime;
        }

        const stageStartTime = (stage as any).startTime;
        const elapsed = currentTime - stageStartTime;

        // Show pixels based on elapsed time, ignoring original delay calculation
        const pixelsToShow = Math.min(
          stage.pixels.length,
          Math.floor(elapsed / 50) // Show 1 pixel every 50ms
        );

        for (let i = 0; i < pixelsToShow; i++) {
          visible.push(stage.pixels[i]);
        }

        console.log(
          `Stage ${stage.stage} is active, showing ${pixelsToShow}/${stage.pixels.length} pixels progressively (elapsed: ${elapsed}ms)`
        );
      }
    });

    console.log("Total visible pixels:", visible.length);
    setVisiblePixels(visible);
  }, []); // Empty dependency array

  // Animation update using setInterval instead of requestAnimationFrame
  useEffect(() => {
    console.log("Animation update, current state:", animationState);

    if (
      animationState === AnimationState.IDLE ||
      animationState === AnimationState.COMPLETE
    ) {
      console.log(
        "Animation state is IDLE or COMPLETE, updating visible pixels once"
      );
      updateVisiblePixels();
      return;
    }

    // For active animation states, use setInterval instead of requestAnimationFrame
    console.log("Starting interval animation for state:", animationState);

    const intervalId = setInterval(() => {
      updateVisiblePixels();
    }, 100); // Update every 100ms

    return () => {
      console.log("Cleaning up interval for state:", animationState);
      clearInterval(intervalId);
    };
  }, [animationState]); // Only depend on animationState

  return {
    stages,
    animationState,
    visiblePixels,
    isLoading,
    error,
  };
};
