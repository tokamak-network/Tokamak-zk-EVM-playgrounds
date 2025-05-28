import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";
import { useEffect } from "react";

// 파이프라인 섹션 정의
const EVM_TO_QAP_SECTION = {
  id: "evm-to-qap",
  segments: [
    {
      id: "segment1",
      startX: 65,
      startY: 0,
      endX: 75,
      endY: 90,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 60,
      startY: 92,
      endX: 400,
      endY: 92,
      direction: "horizontal" as const,
      animationDuration: 1800,
      delay: -600,
    },
    {
      id: "segment3",
      startX: 363,
      startY: 88,
      endX: 360,
      endY: 210,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -800,
    },
    {
      id: "segment4",
      startX: 368,
      startY: 215,
      endX: 150,
      endY: 215,
      direction: "horizontal" as const,
      animationDuration: 1300,
      delay: -450,
    },
    {
      id: "segment5",
      startX: 190,
      startY: 215,
      endX: 190,
      endY: 100,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -700,
    },
    {
      id: "segment6",
      startX: 180,
      startY: 160,
      endX: 100,
      endY: 160,
      direction: "horizontal" as const,
      animationDuration: 800,
      delay: -600,
    },
    {
      id: "segment7",
      startX: 120,
      startY: 175,
      endX: 120,
      endY: 215,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -500,
    },
    {
      id: "segment8",
      startX: 120,
      startY: 218,
      endX: 30,
      endY: 218,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -600,
    },
  ],
};

export default function EvmToQAP({
  isActive = false,
  onComplete,
  onStart,
}: PipelineAnimationProps) {
  // 섹션 완료 핸들러
  const handleSectionComplete = () => {
    console.log("EVM to QAP animation completed");
    if (onComplete) {
      onComplete();
    }
  };
  const { pendingAnimation, setPendingAnimation } = usePipelineAnimation();

  useEffect(() => {
    setTimeout(() => {
      setPendingAnimation(true);
    }, 3000);
    setTimeout(() => {
      setPendingAnimation(false);
    }, 5000);
  }, []);

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={EVM_TO_QAP_SECTION.id}
        segments={EVM_TO_QAP_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
        isPaused={pendingAnimation}
      />

      {/* {EVM_TO_QAP_SECTION.segments.map((segment, index) => (
        <PipelinePixelAnimation
          key={`pixel-${segment.id}`}
          startX={segment.startX}
          startY={segment.startY}
          endX={segment.endX}
          endY={segment.endY}
          direction={segment.direction}
          isActive={isActive}
          animationDuration={segment.animationDuration * 0.5} // PipelineSection보다 10% 짧게
          delay={500}
          pixelSize={4}
          pixelDensity={1.5}
          colors={[
            "#365969",
            "#159CFC",
            "#7AC8FF",
            "#159CFC",
            "#0079D0",
            "#365969",
          ]}
        />
      ))} */}
    </div>
  );
}
