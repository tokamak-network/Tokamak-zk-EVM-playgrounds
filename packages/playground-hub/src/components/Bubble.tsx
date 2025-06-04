import bubbleBikzg from "../assets/images/bubble-bikzg.png";
import bubbleCompiler from "../assets/images/bubble-compiler.png";
import bubbleEvm from "../assets/images/bubble-evm.png";
import bubbleProve from "../assets/images/bubble-prove.png";
import bubbleSynthesizer from "../assets/images/bubble-synthesizer.png";
import bubbleTransaction from "../assets/images/bubble-transaction.png";
import bubbleVerify from "../assets/images/bubble-verify.png";
import bubbleSetup from "../assets/images/bubble-setup.png";

import bubbleBikzgInactive from "../assets/images/bubbles/bubble-bikzg-inactive.svg";
import bubbleQapInactive from "../assets/images/bubbles/bubble-qap-inactive.svg";
import bubbleSetupInactive from "../assets/images/bubbles/bubble-setup-inactive.svg";
import bubbleSynthesizerInactive from "../assets/images/bubbles/bubble-synthesizer-inactive.svg";
import bubbleVerifyInactive from "../assets/images/bubbles/bubble-verify-inactive.svg";
import bubbleProveInactive from "../assets/images/bubbles/bubble-prove-inactive.svg";

import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "../hooks/usePlaygroundStage";
import bubbleEvmInactive from "../assets/images/bubbles/bubble-evm-inactive.png";
import bubbleTransactionInactive from "../assets/images/bubbles/bubble-transaction-inactive.png";

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
}

export function Bubble({ type, className, isActive }: BubbleProps) {
  const bubbleImage = {
    bikzg: isActive ? bubbleBikzg : bubbleBikzgInactive,
    compiler: isActive ? bubbleCompiler : bubbleQapInactive,
    evm: isActive ? bubbleEvm : bubbleEvmInactive,
    prove: isActive ? bubbleProve : bubbleProveInactive,
    synthesizer: isActive ? bubbleSynthesizer : bubbleSynthesizerInactive,
    transaction: isActive ? bubbleTransaction : bubbleTransactionInactive,
    verify: isActive ? bubbleVerify : bubbleVerifyInactive,
    setup: isActive ? bubbleSetup : bubbleSetupInactive,
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
  const { playgroundStage } = usePlaygroundStage();
  const { playgroundStartStage } = usePlaygroundStartStage();

  return (
    <div className="w-full h-full absolute">
      <Bubble
        type="evm"
        className="absolute top-[60px] left-[140px]"
        isActive={playgroundStartStage.evmSpec}
      />
      <Bubble
        type="transaction"
        className="absolute top-[60px] left-[855px]"
        isActive={playgroundStartStage.transactionHash}
      />
      <Bubble
        type="compiler"
        className="absolute top-[340px] left-[85px]"
        isActive={playgroundStage.evmSpec}
      />
      <Bubble
        type="synthesizer"
        className="absolute top-[480px] left-[497px]"
        isActive={playgroundStage.qap && playgroundStage.transactionHash}
      />
      <Bubble
        type="prove"
        className="absolute top-[720px] left-[410px]"
        isActive={playgroundStage.setup && playgroundStage.synthesizer}
      />
      <Bubble
        type="verify"
        className="absolute top-[640px] left-[710px]"
        isActive={playgroundStage.verify && playgroundStage.bikzg}
      />
      <Bubble
        type="setup"
        className="absolute top-[520px] left-[233px]"
        isActive={playgroundStage.qap}
      />
      <Bubble
        type="bikzg"
        className="absolute top-[533px] left-[890px]"
        isActive={playgroundStage.synthesizer}
      />
    </div>
  );
}
