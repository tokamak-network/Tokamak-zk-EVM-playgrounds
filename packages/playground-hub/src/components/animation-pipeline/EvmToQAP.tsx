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
      startX: 156,
      startY: 0,
      endX: 156,
      endY: 115,
      direction: "vertical" as const,
      animationDuration: 1000,
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
