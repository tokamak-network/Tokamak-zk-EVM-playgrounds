import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.png";

import QAPToSetup from "./QAPToSetup";
import TransactionToSynthesizer from "./TransactionToSynthesizer";
import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "../../hooks/usePlaygroundStage";
import { PlaygroundStage } from "../../atoms/playgroundStage";
import SynthesizerToVerifyBikzg from "./SynthesizerToVerifyBikzg";
import SetupToProve from "./SetupToProve";
import ProveToVerify from "./ProveToVerify";
import BikzgToProve from "./BikzgToProve";
import VerifyToResult from "./VerifyToResult";
import FillingTank from "./FillingTank";
import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import { useEffect } from "react";

export default function PipelineAnimations() {
  const { setStage } = usePlaygroundStage();
  const { setStartStage } = usePlaygroundStartStage();
  const {
    activeSection,
    updateActiveSection,
    resetAnimation,
    setResetAnimation,
    setIsAnimationRunning,
  } = usePipelineAnimation();

  const handleOnComplete = ({
    section,
    value,
  }: {
    section: keyof PlaygroundStage;
    value: boolean;
  }) => {
    setStage(section, value);
    setIsAnimationRunning(false);
  };

  useEffect(() => {
    if (resetAnimation) {
      const timer = setTimeout(() => {
        setResetAnimation(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [resetAnimation, setResetAnimation]);

  return (
    <div className="relative w-full h-full top-[54px] left-[84px] animation-part">
      {/* EVM to QAP 파이프라인 */}
      <EvmToQAP
        isActive={activeSection === "evm-to-qap"}
        onComplete={() => {
          handleOnComplete({
            section: "evmSpec",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("evmSpec", true);
          updateActiveSection("evm-to-qap");
          setIsAnimationRunning(true);
        }}
      />
      <QAPToSetup
        isActive={activeSection === "qap-to-setup-synthesizer"}
        onComplete={() => {
          handleOnComplete({
            section: "qap",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("qap", true);
          updateActiveSection("qap-to-setup-synthesizer");
          setIsAnimationRunning(true);
        }}
      />
      <TransactionToSynthesizer
        isActive={activeSection === "transaction-to-synthesizer"}
        onComplete={() => {
          handleOnComplete({
            section: "transactionHash",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("transactionHash", true);
          updateActiveSection("transaction-to-synthesizer");
          setIsAnimationRunning(true);
        }}
        resetAnimation={resetAnimation}
      />
      <SynthesizerToVerifyBikzg
        isActive={activeSection === "synthesizer-to-prove-bikzg"}
        onComplete={() => {
          handleOnComplete({
            section: "synthesizer",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("synthesizer", true);
          updateActiveSection("synthesizer-to-prove-bikzg");
          setIsAnimationRunning(true);
        }}
        resetAnimation={resetAnimation}
      />
      <SetupToProve
        isActive={activeSection === "setup-to-prove"}
        onComplete={() => {
          handleOnComplete({
            section: "setup",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("setup", true);
          updateActiveSection("setup-to-prove");
          setIsAnimationRunning(true);
        }}
      />
      <ProveToVerify
        isActive={activeSection === "prove-to-verify"}
        onComplete={() => {
          handleOnComplete({
            section: "prove",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("prove", true);
          updateActiveSection("prove-to-verify");
          setIsAnimationRunning(true);
        }}
        resetAnimation={resetAnimation}
      />
      <BikzgToProve
        isActive={activeSection === "bikzg-to-verify"}
        onComplete={() => {
          handleOnComplete({
            section: "bikzg",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("preprocess", true);
          updateActiveSection("bikzg-to-verify");
        }}
        resetAnimation={resetAnimation}
      />
      <VerifyToResult
        isActive={activeSection === "verify-to-result"}
        onComplete={() => {
          handleOnComplete({
            section: "verify",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("verify", true);
          updateActiveSection("verify-to-result");
          setIsAnimationRunning(true);
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
