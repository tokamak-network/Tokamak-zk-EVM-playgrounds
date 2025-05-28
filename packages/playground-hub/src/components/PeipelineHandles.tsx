import Handle from "./Handle";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";
export default function PeipelineHandles() {
  const { updateActiveSection } = usePipelineAnimation();
  const { runSynthesizer, proveTransaction } = useTokamakZkEVMActions();

  return (
    <div className="w-full h-full absolute">
      <Handle
        type="orange"
        className="top-[395px] left-[70px]"
        onClick={() => {
          updateActiveSection("qap-to-setup-synthesizer");
        }}
      />
      <Handle
        type="orange"
        className="top-[535px] left-[482px]"
        onClick={() => {
          runSynthesizer();
          updateActiveSection("synthesizer-to-verify-bikzg");
        }}
      />
      <Handle
        type="green"
        className="top-[575px] left-[216px]"
        onClick={() => {
          updateActiveSection("setup-to-verify");
        }}
      />
      <Handle
        type="green"
        className="top-[775px] left-[395px]"
        onClick={() => {
          updateActiveSection("verify-to-prove");
        }}
      />
      <Handle
        type="green"
        className="top-[695px] left-[695px]"
        onClick={() => {
          proveTransaction();
          updateActiveSection("prove-to-result");
        }}
      />
      <Handle
        type="pink"
        className="top-[588px] left-[875px]"
        onClick={() => {
          updateActiveSection("bikzg-to-prove");
        }}
      />
    </div>
  );
}
