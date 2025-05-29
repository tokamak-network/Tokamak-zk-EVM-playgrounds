import { PipelineAnimationProps } from "src/types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const SETUP_TO_VERIFY_SECTION = {
  id: "setup-to-verify",
  segments: [
    {
      id: "segment1",
      startX: 163,
      startY: 390,
      endX: 163,
      endY: 600,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment2",
      startX: 160,
      startY: 600,
      endX: 340,
      endY: 600,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
  ],
};

export default function SetupToVerify({
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

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={SETUP_TO_VERIFY_SECTION.id}
        segments={SETUP_TO_VERIFY_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
        resetAnimation={resetAnimation}
      />
    </div>
  );
}
