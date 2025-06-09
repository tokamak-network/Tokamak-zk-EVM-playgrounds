import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.svg";

import QAPToSetup from "./QAPToSetup";
import TransactionToSynthesizer from "./TransactionToSynthesizer";
import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "../../hooks/usePlaygroundStage";
import { PlaygroundStage } from "../../atoms/playgroundStage";
import SynthesizerToVerifyBikzg from "./SynthesizerToVerifyBikzg";
import SetupToVerify from "./SetupToVerify";
import VerifyToProve from "./VerifyToProve";
import BikzgToProve from "./BikzgToProve";
import ProveToResult from "./ProveToResult";
import FillingTank from "./FillingTank";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";

export default function PipelineAnimations() {
  const { setStage } = usePlaygroundStage();
  const { setStartStage } = usePlaygroundStartStage();
  const { activeSection, updateActiveSection } = usePipelineAnimation();

  const handleOnStart = ({
    section,
    value,
  }: {
    section: keyof PlaygroundStage;
    value: boolean;
  }) => {
    setStage(section, value);
  };
  const { resetAnimation } = usePipelineAnimation();

  return (
    <div className="relative w-full h-full top-[54px] left-[84px] animation-part">
      {/* EVM to QAP 파이프라인 */}
      <EvmToQAP
        isActive={activeSection === "evm-to-qap"}
        onComplete={() => {
          handleOnStart({
            section: "evmSpec",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("evmSpec", true);
          updateActiveSection("evm-to-qap");
        }}
      />
      <QAPToSetup
        isActive={activeSection === "qap-to-setup-synthesizer"}
        onComplete={() => {
          handleOnStart({
            section: "qap",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("qap-to-setup-synthesizer");
        }}
      />
      <TransactionToSynthesizer
        isActive={activeSection === "transaction-to-synthesizer"}
        onComplete={() => {
          handleOnStart({
            section: "transactionHash",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("transactionHash", true);
          updateActiveSection("transaction-to-synthesizer");
        }}
        resetAnimation={resetAnimation}
      />
      <SynthesizerToVerifyBikzg
        isActive={activeSection === "synthesizer-to-verify-bikzg"}
        onComplete={() => {
          handleOnStart({
            section: "synthesizer",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("synthesizer-to-verify-bikzg");
        }}
        resetAnimation={resetAnimation}
      />
      <SetupToVerify
        isActive={activeSection === "setup-to-verify"}
        onComplete={() => {
          handleOnStart({
            section: "setup",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("setup-to-verify");
        }}
        resetAnimation={resetAnimation}
      />
      <VerifyToProve
        isActive={activeSection === "verify-to-prove"}
        onComplete={() => {
          handleOnStart({
            section: "prove",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("verify-to-prove");
        }}
        resetAnimation={resetAnimation}
      />
      <BikzgToProve
        isActive={activeSection === "bikzg-to-prove"}
        onComplete={() => {
          handleOnStart({
            section: "bikzg",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("bikzg-to-prove");
        }}
        resetAnimation={resetAnimation}
      />
      <ProveToResult
        isActive={activeSection === "prove-to-result"}
        onComplete={() => {
          handleOnStart({
            section: "verify",
            value: true,
          });
        }}
        onStart={() => {
          updateActiveSection("prove-to-result");
        }}
        resetAnimation={resetAnimation}
      />
      <FillingTank />
      {/* 기본 파이프라인 이미지 (배경) */}
      <img
        src={pipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[150px] left-[-10px] z-[-1]"
      />
    </div>
  );
}
