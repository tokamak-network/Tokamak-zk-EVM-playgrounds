import { PipelineAnimationProps } from "../../types/animation-pipeline";
import PipelineSection from "./PipelineSection";

// 파이프라인 섹션 정의
const SETUP_TO_VERIFY_SECTION = {
  id: "setup-to-verify",
  segments: [
    //to prove
    {
      id: "segment1",
      startX: 283,
      startY: 230,
      endX: 278,
      endY: 440,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    //to verify
    {
      id: "segment2",
      startX: 270,
      startY: 240,
      endX: 130,
      endY: 240,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -2000,
    },
    {
      id: "segment3",
      startX: 139,
      startY: 240,
      endX: 139,
      endY: 440,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment4",
      startX: 139,
      startY: 470,
      endX: 139,
      endY: 580,
      direction: "vertical" as const,
      animationDuration: 500,
      delay: -200,
    },
    {
      id: "segment5",
      startX: 139,
      startY: 565,
      endX: 270,
      endY: 565,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment6",
      startX: 300,
      startY: 565,
      endX: 570,
      endY: 565,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
    //to preprocess
    {
      id: "segment7",
      startX: 270,
      startY: 240,
      endX: 400,
      endY: 240,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -5000,
    },
    {
      id: "segment8",
      startX: 390,
      startY: 240,
      endX: 390,
      endY: 350,
      direction: "vertical" as const,
      animationDuration: 1000,
      delay: -200,
    },
    {
      id: "segment9",
      startX: 390,
      startY: 330,
      endX: 730,
      endY: 330,
      direction: "horizontal" as const,
      animationDuration: 1000,
      delay: -200,
    },
  ],
};

export default function SetupToProve({
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
