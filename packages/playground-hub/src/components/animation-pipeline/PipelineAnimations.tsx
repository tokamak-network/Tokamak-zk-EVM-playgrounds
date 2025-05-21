import EvmToQAP from "./EvmToQAP";
import pipeline from "../../assets/images/pipe.png";
import { useAtom } from "jotai";
import { Section, activeSectionAtom } from "../../atoms/pipelineAnimation";
import QAPToSetup from "./QAPToSetup";
import TransactionToSynthesizer from "./TransactionToSynthesizer";
import usePlaygroundStage, {
  usePlaygroundStartStage,
} from "../../hooks/usePlaygroundStage";
import { PlaygroundStage } from "../../atoms/playgroundStage";
import SynthesizerToVerifyBikzg from "./SynthesizerToVerifyBikzg";
import SetupToVerify from "./SetupToVerify";
import VerifyToProve from "./VerifyToProve";
import BikzgToProve from "./BikzgToProve";
import ProveToResult from "./ProveToResult";
import FillingTank from "./FillingTank";
import { useEffect, useState } from "react";

export default function PipelineAnimations() {
  // 각 섹션의 활성화 상태 관리
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const { setStage } = usePlaygroundStage();
  const { setStartStage } = usePlaygroundStartStage();
  // 섹션 활성화 핸들러
  const activateSection = (sectionId: Section) => {
    setActiveSection(sectionId);
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
        onComplete={() => {
          handleOnStart({
            section: "evmSpec",
            value: true,
          });
        }}
        onStart={() => {
          setStartStage("evmSpec", true);
          activateSection("evm-to-qap");
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
          activateSection("qap-to-setup-synthesizer");
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
          activateSection("transaction-to-synthesizer");
        }}
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
          activateSection("synthesizer-to-verify-bikzg");
        }}
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
          activateSection("setup-to-verify");
        }}
      />
      <VerifyToProve
        isActive={activeSection === "verify-to-prove"}
        onComplete={() => {
          handleOnStart({
            section: "verify",
            value: true,
          });
        }}
        onStart={() => {
          activateSection("verify-to-prove");
        }}
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
          activateSection("bikzg-to-prove");
        }}
      />
      <ProveToResult
        isActive={activeSection === "prove-to-result"}
        onComplete={() => {
          handleOnStart({
            section: "prove",
            value: true,
          });
        }}
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
