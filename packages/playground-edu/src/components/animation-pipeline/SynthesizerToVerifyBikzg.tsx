import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";

// 파이프라인 섹션 정의
const SYNTHESIZER_TO_PROVE_BIKZG_SECTION = {
  id: "synthesizer-to-prove-bikzg",
  segments: [
    //To bikzg
    {
      id: "segment1",
      startX: 613,
      startY: 120,
      endX: 613,
      endY: 200,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment4",
      startX: 613,
      startY: 130,
      endX: 515,
      endY: 130,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -2000,
    },
    {
      id: "segment2",
      startX: 610,
      startY: 210,
      endX: 750,
      endY: 210,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: 500,
    },
    {
      id: "segment3",
      startX: 740,
      startY: 210,
      endX: 740,
      endY: 317,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    //to prove
    {
      id: "segment5",
      startX: 527,
      startY: 130,
      endX: 527,
      endY: 318,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -1600,
    },
    {
      id: "segment6",
      startX: 527,
      startY: 348,
      endX: 527,
      endY: 460,
      direction: "vertical" as const,
      animationDuration: 700,
    },
    {
      id: "segment7",
      startX: 527,
      startY: 450,
      endX: 280,
      endY: 450,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -300,
    },
  ],
};

export default function SynthesizerToVerifyBikzg({
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
        id={SYNTHESIZER_TO_PROVE_BIKZG_SECTION.id}
        segments={SYNTHESIZER_TO_PROVE_BIKZG_SECTION.segments}
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
