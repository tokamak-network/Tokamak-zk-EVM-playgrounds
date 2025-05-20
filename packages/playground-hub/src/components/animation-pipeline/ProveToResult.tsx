import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const PROVE_TO_RESULT_SECTION = {
  id: "prove-to-result",
  segments: [
    {
      id: "segment1",
      startX: 645,
      startY: 523,
      endX: 645,
      endY: 590,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment2",
      startX: 645,
      startY: 590,
      endX: 800,
      endY: 590,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment3",
      startX: 713,
      startY: 590,
      endX: 713,
      endY: 800,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment4",
      startX: 710,
      startY: 650,
      endX: 778,
      endY: 650,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
  ],
};

export default function ProveToResult({
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
        id={PROVE_TO_RESULT_SECTION.id}
        segments={PROVE_TO_RESULT_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
      />
    </div>
  );
}
