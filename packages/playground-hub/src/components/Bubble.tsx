import bubbleBikzg from "../assets/images/bubble-bikzg.png";
import bubbleCompiler from "../assets/images/bubble-compiler.png";
import bubbleEvm from "../assets/images/bubble-evm.png";
import bubbleProve from "../assets/images/bubble-prove.png";
import bubbleSynthesizer from "../assets/images/bubble-synthesizer.png";
import bubbleTransaction from "../assets/images/bubble-transaction.png";
import bubbleVerify from "../assets/images/bubble-verify.png";
import bubbleSetup from "../assets/images/bubble-setup.png";

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
}

export function Bubble({ type, className }: BubbleProps) {
  const bubbleImage = {
    bikzg: bubbleBikzg,
    compiler: bubbleCompiler,
    evm: bubbleEvm,
    prove: bubbleProve,
    synthesizer: bubbleSynthesizer,
    transaction: bubbleTransaction,
    verify: bubbleVerify,
    setup: bubbleSetup,
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
      <Bubble type="evm" className="absolute top-[60px] left-[140px]" />
      <Bubble type="transaction" className="absolute top-[60px] left-[855px]" />
      <Bubble type="compiler" className="absolute top-[345px] left-[85px]" />
      <Bubble
        type="synthesizer"
        className="absolute top-[480px] left-[497px]"
      />
      <Bubble type="verify" className="absolute top-[720px] left-[410px]" />
      <Bubble type="prove" className="absolute top-[640px] left-[710px]" />
      <Bubble type="setup" className="absolute top-[520px] left-[233px]" />
      <Bubble type="bikzg" className="absolute top-[533px] left-[890px]" />
    </div>
  );
}
