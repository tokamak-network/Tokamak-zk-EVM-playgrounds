import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
// 파이프라인 섹션 정의
const TRANSACTION_TO_SYNTHESIZER_SECTION = {
  id: "transaction-to-synthesizer",
  segments: [
    {
      id: "segment1",
      startX: 782,
      startY: 0,
      endX: 782,
      endY: 118,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 800,
      startY: 130,
      endX: 610,
      endY: 130,
      direction: "horizontal" as const,
      animationDuration: 1000,
    },
    // {
    //   id: "segment2",
    //   startX: 795,
    //   startY: 110,
    //   endX: 600,
    //   endY: 110,
    //   direction: "horizontal" as const,
    //   animationDuration: 1000,
    //   delay: -500,
    // },
  ],
};

export default function TransactionToSynthesizer({
  isActive = false,
  onComplete,
  onStart,
  resetAnimation,
}: PipelineAnimationProps) {
  // 섹션 완료 핸들러
  const handleSectionComplete = () => {
    console.log("EVM to QAP animation completed");
    if (onComplete) {
      onComplete();
    }
  };
  const { pendingAnimation } = usePipelineAnimation();

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={TRANSACTION_TO_SYNTHESIZER_SECTION.id}
        segments={TRANSACTION_TO_SYNTHESIZER_SECTION.segments}
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
