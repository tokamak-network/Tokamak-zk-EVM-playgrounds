import React, { useState } from "react";
import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.png";
// 다른 파이프라인 애니메이션 컴포넌트들 import...

export default function PipelineAnimations() {
  // 각 섹션의 활성화 상태 관리
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // 섹션 활성화 핸들러
  const activateSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // 섹션 완료 핸들러
  const handleEvmToQAPComplete = () => {
    console.log("EVM to QAP section completed");
    // 다음 섹션 활성화 또는 다른 작업 수행
  };

  return (
    <div className="relative w-full h-full top-[54px] left-[84px] animation-part">
      {/* EVM to QAP 파이프라인 */}
      <EvmToQAP
        isActive={activeSection === "evm-to-qap"}
        onComplete={handleEvmToQAPComplete}
      />
      {/* 기본 파이프라인 이미지 (배경) */}
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[150px] z-[-1]"
      />

      {/* 다른 파이프라인 섹션들... */}

      {/* 컨트롤 버튼 (개발 중 테스트용) */}
      <div className="absolute bottom-4 right-4 flex gap-2 ">
        <button
          className="bg-blue-500 z-1000 text-white px-4 py-2 rounded"
          onClick={() => activateSection("evm-to-qap")}
        >
          EVM → QAP
        </button>
        {/* 다른 섹션 버튼들... */}
      </div>
    </div>
  );
}
