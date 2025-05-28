import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const BIKZG_TO_PROVE_SECTION = {
  id: "bikzg-to-prove",
  segments: [
    {
      id: "segment1",
      startX: 820,
      startY: 417,
      endX: 820,
      endY: 550,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 820,
      startY: 523,
      endX: 645,
      endY: 523,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -550,
    },
  ],
};

export default function BikzgToProve({
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
        id={BIKZG_TO_PROVE_SECTION.id}
        segments={BIKZG_TO_PROVE_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
        resetAnimation={resetAnimation}
      />
    </div>
  );
}
