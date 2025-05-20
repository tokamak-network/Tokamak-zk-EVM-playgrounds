import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.png";
import { useAtom } from "jotai";
import { Section, activeSectionAtom } from "../../atoms/pipelineAnimation";
import QAPToSetup from "./QAPToSetup";
import TransactionToSynthesizer from "./TransactionToSynthesizer";
import usePlaygroundStage from "../../hooks/usePlaygroundStage";
import { PlaygroundStage } from "../../atoms/playgroundStage";
import SynthesizerToVerifyBikzg from "./SynthesizerToVerifyBikzg";
import SetupToVerify from "./SetupToVerify";
import VerifyToProve from "./VerifyToProve";
import BikzgToProve from "./BikzgToProve";
import ProveToResult from "./ProveToResult";
import FillingTank from "./FillingTank";

export default function PipelineAnimations() {
  // 각 섹션의 활성화 상태 관리
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const { setStage } = usePlaygroundStage();
  // 섹션 활성화 핸들러
  const activateSection = (sectionId: Section) => {
    setActiveSection(sectionId);
  };

  // 섹션 완료 핸들러
  const handleEvmToQAPComplete = () => {
    console.log("EVM to QAP section completed");
    // 다음 섹션 활성화 또는 다른 작업 수행
  };

  const handleOnStart = ({
    section,
    value,
  }: {
    section: keyof PlaygroundStage;
    value: boolean;
  }) => {
    setStage(section, value);
  };

  return (
    <div className="relative w-full h-full top-[54px] left-[84px] animation-part">
      {/* EVM to QAP 파이프라인 */}
      <EvmToQAP
        isActive={activeSection === "evm-to-qap"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          handleOnStart({
            section: "evmSpec",
            value: true,
          });
          activateSection("evm-to-qap");
        }}
      />
      <QAPToSetup
        isActive={activeSection === "qap-to-setup-synthesizer"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          handleOnStart({
            section: "qap",
            value: true,
          });
          activateSection("qap-to-setup-synthesizer");
        }}
      />
      <TransactionToSynthesizer
        isActive={activeSection === "transaction-to-synthesizer"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          handleOnStart({
            section: "transactionHash",
            value: true,
          });
          activateSection("transaction-to-synthesizer");
        }}
      />
      <SynthesizerToVerifyBikzg
        isActive={activeSection === "synthesizer-to-verify-bikzg"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          handleOnStart({
            section: "synthesizer",
            value: true,
          });
          activateSection("synthesizer-to-verify-bikzg");
        }}
      />
      <SetupToVerify
        isActive={activeSection === "setup-to-verify"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          activateSection("setup-to-verify");
        }}
      />
      <VerifyToProve
        isActive={activeSection === "verify-to-prove"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          activateSection("verify-to-prove");
        }}
      />
      <BikzgToProve
        isActive={activeSection === "bikzg-to-prove"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          activateSection("bikzg-to-prove");
        }}
      />
      <ProveToResult
        isActive={activeSection === "prove-to-result"}
        onComplete={handleEvmToQAPComplete}
        onStart={() => {
          activateSection("prove-to-result");
        }}
      />
      <FillingTank />
      {/* 기본 파이프라인 이미지 (배경) */}
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[150px] z-[-1]"
      />
    </div>
  );
}
