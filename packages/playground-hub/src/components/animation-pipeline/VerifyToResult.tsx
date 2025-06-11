import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const VERIFY_TO_RESULT_SECTION = {
  id: "verify-to-result",
  segments: [
    {
      id: "segment1",
      startX: 590,
      startY: 560,
      endX: 715,
      endY: 560,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment2",
      startX: 715,
      startY: 560,
      endX: 715,
      endY: 650,
    },
  ],
};

export default function VerifyToResult({
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
        id={VERIFY_TO_RESULT_SECTION.id}
        segments={VERIFY_TO_RESULT_SECTION.segments}
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
