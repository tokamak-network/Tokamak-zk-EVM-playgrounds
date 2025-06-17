import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const PROVE_TO_VERIFY_SECTION = {
  id: "prove-to-verify",
  segments: [
    {
      id: "segment1",
      startX: 283,
      startY: 440,
      endX: 283,
      endY: 660,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 283,
      startY: 640,
      endX: 580,
      endY: 640,
      direction: "horizontal" as const,
      animationDuration: 1000,
    },
    {
      id: "segment3",
      startX: 580,
      startY: 650,
      endX: 580,
      endY: 580,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
  ],
};

export default function ProveToVerify({
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
        id={PROVE_TO_VERIFY_SECTION.id}
        segments={PROVE_TO_VERIFY_SECTION.segments}
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
