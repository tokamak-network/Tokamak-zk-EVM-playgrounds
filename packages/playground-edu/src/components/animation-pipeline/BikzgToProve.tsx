import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const BIKZG_TO_PROVE_SECTION = {
  id: "bikzg-to-prove",
  segments: [
    {
      id: "segment1",
      startX: 740,
      startY: 325,
      endX: 900,
      endY: 325,
      direction: "horizontal" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 875,
      startY: 325,
      endX: 875,
      endY: 470,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -500,
    },
    {
      id: "segment3",
      startX: 875,
      startY: 465,
      endX: 570,
      endY: 465,
      direction: "horizontal" as const,
      animationDuration: 1000,
    },
    {
      id: "segment4",
      startX: 590,
      startY: 465,
      endX: 590,
      endY: 555,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
  ],
};

export default function BikzgToProve({
  isActive = false,
  onComplete,
  onStart,
  resetAnimation,
}: PipelineAnimationProps) {
  // 섹션 완료 핸들러
  const handleSectionComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };
  const { pendingAnimation } = usePipelineAnimation();

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={BIKZG_TO_PROVE_SECTION.id}
        segments={BIKZG_TO_PROVE_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
        isPaused={pendingAnimation}
        resetAnimation={resetAnimation}
      />
    </div>
  );
}
