import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const QAP_TO_SETUP_SYNTHESIZER_SECTION = {
  id: "qap-to-setup-synthesizer",
  segments: [
    {
      id: "segment1",
      startX: 156,
      startY: 130,
      endX: 280,
      endY: 130,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -800,
    },
    {
      id: "segment2",
      startX: 156,
      startY: 130,
      endX: 0,
      endY: 130,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -800,
    },
    {
      id: "segment3",
      startX: 20,
      startY: 130,
      endX: 20,
      endY: 470,
      direction: "vertical" as const,
      animationDuration: 1300,
      delay: -450,
    },
    {
      id: "segment4",
      startX: 280,
      startY: 130,
      endX: 280,
      endY: 230,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -1200,
    },
    {
      id: "segment5",
      startX: 10,
      startY: 454,
      endX: 278,
      endY: 460,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -300,
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
