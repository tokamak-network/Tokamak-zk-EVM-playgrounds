import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.png";
import { useAtom } from "jotai";
import { Section, activeSectionAtom } from "../../atoms/pipelineAnimation";
import QAPToSetup from "./QAPToSetup";
import TransactionToSynthesizer from "./TransactionToSynthesizer";

export default function PipelineAnimations() {
  // 각 섹션의 활성화 상태 관리
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);

  // 섹션 활성화 핸들러
  const activateSection = (sectionId: Section) => {
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
      <QAPToSetup
        isActive={activeSection === "qap-to-setup-synthesizer"}
        onComplete={handleEvmToQAPComplete}
      />
      <TransactionToSynthesizer
        isActive={activeSection === "transaction-to-synthesizer"}
        onComplete={handleEvmToQAPComplete}
      />
      {/* 기본 파이프라인 이미지 (배경) */}
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[150px] z-[-1]"
      />
    </div>
  );
}
