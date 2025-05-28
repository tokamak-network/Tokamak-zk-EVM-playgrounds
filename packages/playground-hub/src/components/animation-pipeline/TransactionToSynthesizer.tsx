import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
// 파이프라인 섹션 정의
const TRANSACTION_TO_SYNTHESIZER_SECTION = {
  id: "transaction-to-synthesizer",
  segments: [
    {
      id: "segment1",
      startX: 788,
      startY: 0,
      endX: 788,
      endY: 100,
      direction: "vertical" as const,
      animationDuration: 1000,
    },
    {
      id: "segment2",
      startX: 795,
      startY: 110,
      endX: 600,
      endY: 110,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -500,
    },
    {
      id: "segment3",
      startX: 680,
      startY: 110,
      endX: 580,
      endY: 30,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -700,
    },
    {
      id: "segment4",
      startX: 680,
      startY: 42,
      endX: 500,
      endY: 42,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -450,
    },
    {
      id: "segment5",
      startX: 570,
      startY: 42,
      endX: 500,
      endY: 125,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -700,
    },
    {
      id: "segment6",
      startX: 600,
      startY: 130,
      endX: 450,
      endY: 130,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -600,
    },
    {
      id: "segment7",
      startX: 500,
      startY: 140,
      endX: 400,
      endY: 200,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -500,
    },
    {
      id: "segment8",
      startX: 495,
      startY: 190,
      endX: 880,
      endY: 203,
      direction: "horizontal" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment9",
      startX: 890,
      startY: 195,
      endX: 880,
      endY: 280,
      direction: "vertical" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment10",
      startX: 885,
      startY: 275,
      endX: 700,
      endY: 275,
      direction: "horizontal" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment11",
      startX: 737,
      startY: 275,
      endX: 735,
      endY: 400,
      direction: "vertical" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -300,
    },
    {
      id: "segment12",
      startX: 720,
      startY: 345,
      endX: 500,
      endY: 345,
      direction: "horizontal" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment13",
      startX: 545,
      startY: 345,
      endX: 500,
      endY: 250,
      direction: "vertical" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment14",
      startX: 550,
      startY: 280,
      endX: 415,
      endY: 280,
      direction: "horizontal" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
    {
      id: "segment15",
      startX: 425,
      startY: 250,
      endX: 425,
      endY: 350,
      direction: "vertical" as const,
      animationDuration: 1000,
      fillHeight: 60,
      delay: -500,
    },
  ],
};

export default function TransactionToSynthesizer({
  isActive = false,
  onComplete,
  onStart,
  // isPaused = false,
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
      />
    </div>
  );
}
