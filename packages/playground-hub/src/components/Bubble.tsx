import bubbleBikzg from "../assets/images/bubble-bikzg.png";
import bubbleCompiler from "../assets/images/bubble-compiler.png";
import bubbleEvm from "../assets/images/bubble-evm.png";
import bubbleProve from "../assets/images/bubble-prove.png";
import bubbleSynthesizer from "../assets/images/bubble-synthesizer.png";
import bubbleTransaction from "../assets/images/bubble-transaction.png";
import bubbleVerify from "../assets/images/bubble-verify.png";
import bubbleSetup from "../assets/images/bubble-setup.png";
import bubbleBikzgInactive from "../assets/images/bubbles/bubble-bikzg-inactive.png";
import bubbleQapInactive from "../assets/images/bubbles/bubble-qap-inactive.png";
import bubbleSetupInactive from "../assets/images/bubbles/bubble-setup-inactive.png";
import bubbleSynthesizerInactive from "../assets/images/bubbles/bubble-synthesizer-inactive.png";
import bubbleVerifyInactive from "../assets/images/bubbles/bubble-verify-inactive.png";
import bubbleProveInactive from "../assets/images/bubbles/bubble-prove-inactive.png";
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
    evm: bubbleEvm,
    prove: isActive ? bubbleProve : bubbleProveInactive,
    synthesizer: isActive ? bubbleSynthesizer : bubbleSynthesizerInactive,
    transaction: bubbleTransaction,
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
  return (
    <div className="w-full h-full absolute">
      <Bubble
        type="evm"
        className="absolute top-[60px] left-[140px]"
        isActive={true}
      />
      <Bubble
        type="transaction"
        className="absolute top-[60px] left-[855px]"
        isActive={true}
      />
      <Bubble
        type="compiler"
        className="absolute top-[340px] left-[85px]"
        isActive={false}
      />
      <Bubble
        type="synthesizer"
        className="absolute top-[480px] left-[497px]"
        isActive={false}
      />
      <Bubble
        type="verify"
        className="absolute top-[720px] left-[410px]"
        isActive={false}
      />
      <Bubble
        type="prove"
        className="absolute top-[640px] left-[710px]"
        isActive={false}
      />
      <Bubble
        type="setup"
        className="absolute top-[520px] left-[233px]"
        isActive={false}
      />
      <Bubble
        type="bikzg"
        className="absolute top-[533px] left-[890px]"
        isActive={false}
      />
    </div>
  );
}
