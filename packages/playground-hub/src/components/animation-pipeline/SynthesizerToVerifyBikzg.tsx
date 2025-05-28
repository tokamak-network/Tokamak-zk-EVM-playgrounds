import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const SYNTHESIZER_TO_VERIFY_BIKZG_SECTION = {
  id: "synthesizer-to-verify-bikzg",
  segments: [
    {
      id: "segment1",
      startX: 425,
      startY: 350,
      endX: 425,
      endY: 455,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    //To bikzg
    {
      id: "segment2",
      startX: 425,
      startY: 412,
      endX: 810,
      endY: 412,
      direction: "horizontal" as const,
      animationDuration: 2500,
      delay: -750,
      fillHeight: 70,
    },
    //to verify
    {
      id: "segment3",
      startX: 425,
      startY: 450,
      endX: 225,
      endY: 450,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -2000,
    },
    {
      id: "segment4",
      startX: 248,
      startY: 450,
      endX: 248,
      endY: 510,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -500,
    },
    {
      id: "segment5",
      startX: 240,
      startY: 517,
      endX: 350,
      endY: 517,
      direction: "horizontal" as const,
      animationDuration: 1800,
      delay: -600,
    },
    {
      id: "segment6",
      startX: 340,
      startY: 517,
      endX: 340,
      endY: 590,
      direction: "vertical" as const,
      animationDuration: 1800,
      delay: -800,
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
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={SYNTHESIZER_TO_VERIFY_BIKZG_SECTION.id}
        segments={SYNTHESIZER_TO_VERIFY_BIKZG_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
      />
    </div>
  );
}
