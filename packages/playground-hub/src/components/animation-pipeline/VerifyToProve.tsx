import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const VERIFY_TO_PROVE_SECTION = {
  id: "verify-to-prove",
  segments: [
    {
      id: "segment1",
      startX: 340,
      startY: 600,
      endX: 500,
      endY: 600,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment2",
      startX: 465,
      startY: 600,
      endX: 465,
      endY: 680,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment3",
      startX: 465,
      startY: 662,
      endX: 543,
      endY: 662,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment4",
      startX: 543,
      startY: 662,
      endX: 543,
      endY: 500,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment5",
      startX: 543,
      startY: 525,
      endX: 645,
      endY: 525,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
  ],
};

export default function VerifyToProve({
  isActive = false,
  onComplete,
  onStart,
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
        id={VERIFY_TO_PROVE_SECTION.id}
        segments={VERIFY_TO_PROVE_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
      />
    </div>
  );
}
