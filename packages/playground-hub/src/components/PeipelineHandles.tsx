import Handle from "./Handle";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";

export default function PeipelineHandles() {
  const { updateActiveSection } = usePipelineAnimation();
  const { runSynthesizer, runProve, runPreProcess, runVerify } =
    useTokamakZkEVMActions();
  const {
    qapStage,
    synthesizerStage,
    setupStage,
    proveStage,
    verifyStage,
    bikzgStage,
  } = usePlaygroundStage();

  return (
    <div className="w-full h-full absolute">
      <Handle
        type="orange"
        className="top-[395px] left-[70px]"
        onClick={() => {
          updateActiveSection("qap-to-setup-synthesizer");
        }}
        isActive={qapStage.isReady}
      />
      <Handle
        type="orange"
        className="top-[535px] left-[482px]"
        onClick={() => {
          runSynthesizer();
          updateActiveSection("synthesizer-to-verify-bikzg");
        }}
        isActive={synthesizerStage.isReady}
      />
      <Handle
        type="green"
        className="top-[575px] left-[216px]"
        onClick={() => {
          updateActiveSection("setup-to-verify");
        }}
        isActive={setupStage.isReady}
      />
      <Handle
        type="green"
        className="top-[775px] left-[395px]"
        onClick={() => {
          runProve();
          updateActiveSection("verify-to-prove");
        }}
        isActive={proveStage.isReady}
      />
      <Handle
        type="green"
        className="top-[695px] left-[695px]"
        onClick={() => {
          runVerify();
          updateActiveSection("prove-to-result");
        }}
        isActive={verifyStage.isReady}
      />
      <Handle
        type="pink"
        className="top-[588px] left-[875px]"
        onClick={() => {
          runPreProcess();
          updateActiveSection("bikzg-to-prove");
        }}
        isActive={bikzgStage.isReady}
      />
    </div>
  );
}
