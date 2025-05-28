import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const QAP_TO_SETUP_SYNTHESIZER_SECTION = {
  id: "qap-to-setup-synthesizer",
  segments: [
    {
      id: "segment1",
      startX: 15,
      startY: 210,
      endX: 15,
      endY: 500,
      direction: "vertical" as const,
      animationDuration: 1800,
      delay: -1000,
    },
    {
      id: "segment2",
      startX: 30,
      startY: 255,
      endX: 250,
      endY: 255,
      direction: "horizontal" as const,
      animationDuration: 1800,
      delay: -1255,
      fillHeight: 70,
    },
    {
      id: "segment3",
      startX: 15,
      startY: 399,
      endX: 200,
      endY: 550,
      direction: "horizontal" as const,
      animationDuration: 1200,
      delay: -1555,
    },
    {
      id: "segment4",
      startX: 260,
      startY: 260,
      endX: 270,
      endY: 370,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -400,
    },
    {
      id: "segment5",
      startX: 260,
      startY: 369,
      endX: 418,
      endY: 369,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
  ],
};

interface EvmToQAPProps {
  isActive?: boolean; // 외부에서 전달되는 활성화 트리거
  onComplete?: () => void; // 애니메이션 완료 콜백
  onStart?: () => void; // 애니메이션 시작 콜백
}

export default function EvmToQAP({
  isActive = false,
  onComplete,
  onStart,
}: EvmToQAPProps) {
  // 섹션 완료 핸들러
  const handleSectionComplete = () => {
    console.log("EVM to QAP animation completed");
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="absolute w-full h-full bottom-[5px]">
      {/* 파이프라인 섹션 */}
      <PipelineSection
        id={QAP_TO_SETUP_SYNTHESIZER_SECTION.id}
        segments={QAP_TO_SETUP_SYNTHESIZER_SECTION.segments}
        isActive={isActive}
        onComplete={handleSectionComplete}
        baseDelay={0}
        onStart={onStart}
      />
    </div>
  );
}
