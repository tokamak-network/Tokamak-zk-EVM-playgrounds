import Handle from "./Handle";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";
export default function PeipelineHandles() {
  const { setActiveSection } = usePipelineAnimation();

  return (
    <div className="w-full h-full absolute">
      <Handle
        type="orange"
        className="top-[395px] left-[70px]"
        onClick={() => {
          setActiveSection("qap-to-setup-synthesizer");
        }}
      />
      <Handle
        type="orange"
        className="top-[535px] left-[482px]"
        onClick={() => setActiveSection("synthesizer-to-verify-bikzg")}
      />
      <Handle
        type="green"
        className="top-[575px] left-[216px]"
        onClick={() => {
          setActiveSection("setup-to-verify");
        }}
      />
      <Handle
        type="green"
        className="top-[775px] left-[395px]"
        onClick={() => {
          setActiveSection("verify-to-prove");
        }}
      />
      <Handle
        type="green"
        className="top-[695px] left-[695px]"
        onClick={() => {
          setActiveSection("prove-to-result");
          // parseTONTransfer("e61933487ab0");
        }}
      />
      <Handle
        type="pink"
        className="top-[588px] left-[875px]"
        onClick={() => {
          setActiveSection("bikzg-to-prove");
        }}
      />
    </div>
  );
}
