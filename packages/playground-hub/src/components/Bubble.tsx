//done
import bubbleBikzg from "../assets/images/bubble-bikzg.png";
import bubbleCompiler from "../assets/images/bubble-compiler.png";
import bubbleEvm from "../assets/images/bubble-evm.png";
import bubbleProve from "../assets/images/bubble-prove.png";
import bubbleSynthesizer from "../assets/images/bubble-synthesizer.png";
import bubbleTransaction from "../assets/images/bubble-transaction.png";
import bubbleVerify from "../assets/images/bubble-verify.png";
import bubbleSetup from "../assets/images/bubble-setup.png";

//inactive
import bubbleBikzgInactive from "../assets/images/bubbles/bubble-bikzg-inactive.svg";
import bubbleQapInactive from "../assets/images/bubbles/bubble-qap-inactive.svg";
import bubbleSetupInactive from "../assets/images/bubbles/bubble-setup-inactive.svg";
import bubbleSynthesizerInactive from "../assets/images/bubbles/bubble-synthesizer-inactive.svg";
import bubbleVerifyInactive from "../assets/images/bubbles/bubble-verify-inactive.svg";
import bubbleProveInactive from "../assets/images/bubbles/bubble-prove-inactive.svg";

//active
import bubbleBikzgActive from "../assets/images/bubbles/bubble-bikzg-active.svg";
import bubbleQapActive from "../assets/images/bubbles/bubble-qap-active.svg";
import bubbleSetupActive from "../assets/images/bubbles/bubble-setup-active.svg";
import bubbleSynthesizerActive from "../assets/images/bubbles/bubble-synthesizer-active.svg";
import bubbleVerifyActive from "../assets/images/bubbles/bubble-verify-active.svg";
import bubbleProveActive from "../assets/images/bubbles/bubble-prove-active.svg";

import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "../hooks/usePlaygroundStage";
import bubbleEvmInactive from "../assets/images/bubbles/bubble-evm-inactive.svg";
import bubbleTransactionInactive from "../assets/images/bubbles/bubble-transaction-inactive.svg";

interface BubbleProps {
  type:
    | "bikzg"
    | "compiler"
    | "evm"
    | "prove"
    | "synthesizer"
    | "transaction"
    | "verify"
    | "setup";
  className?: string;
  isActive: boolean;
  isDone?: boolean;
}

export function Bubble({ type, className, isActive, isDone }: BubbleProps) {
  const bubbleImage = {
    bikzg: isDone
      ? bubbleBikzg
      : isActive
        ? bubbleBikzgActive
        : bubbleBikzgInactive,
    compiler: isDone
      ? bubbleCompiler
      : isActive
        ? bubbleQapActive
        : bubbleQapInactive,
    evm: isActive ? bubbleEvm : bubbleEvmInactive,
    prove: isDone
      ? bubbleProve
      : isActive
        ? bubbleProveActive
        : bubbleProveInactive,
    synthesizer: isDone
      ? bubbleSynthesizer
      : isActive
        ? bubbleSynthesizerActive
        : bubbleSynthesizerInactive,
    setup: isDone
      ? bubbleSetup
      : isActive
        ? bubbleSetupActive
        : bubbleSetupInactive,
    transaction: isActive ? bubbleTransaction : bubbleTransactionInactive,
    verify: isDone
      ? bubbleVerify
      : isActive
        ? bubbleVerifyActive
        : bubbleVerifyInactive,
  }[type];

  return (
    <img
      src={bubbleImage}
      alt={`bubble-${type}`}
      className={`absolute ${className}`}
    />
  );
}

export default function Bubbles() {
  const {
    qapStage,
    synthesizerStage,
    setupStage,
    proveStage,
    bikzgStage,
    verifyStage,
  } = usePlaygroundStage();
  const { playgroundStartStage } = usePlaygroundStartStage();

  return (
    <div className="w-full h-full absolute">
      <Bubble
        type="evm"
        className="absolute top-[60px] left-[208px]"
        isActive={playgroundStartStage.evmSpec}
      />
      <Bubble
        type="transaction"
        className="absolute top-[55px] left-[830px]"
        isActive={playgroundStartStage.transactionHash}
      />
      <Bubble
        type="compiler"
        className="absolute top-[245px] left-[210px]"
        isActive={qapStage.isReady}
        isDone={qapStage.isDone}
      />
      <Bubble
        type="synthesizer"
        className="absolute top-[255px] left-[661px]"
        isActive={synthesizerStage.isReady}
        isDone={synthesizerStage.isDone}
      />
      <Bubble
        type="prove"
        className="absolute top-[578px] left-[339px]"
        isActive={proveStage.isReady}
        isDone={proveStage.isDone}
      />
      <Bubble
        type="verify"
        className="absolute top-[690px] left-[642px]"
        isActive={verifyStage.isReady}
        isDone={verifyStage.isDone}
      />
      <Bubble
        type="setup"
        className="absolute top-[370px] left-[339px]"
        isActive={setupStage.isReady}
        isDone={setupStage.isDone}
      />
      <Bubble
        type="bikzg"
        className="absolute top-[452px] left-[795px]"
        isActive={bikzgStage.isReady}
        isDone={bikzgStage.isDone}
      />
    </div>
  );
}
