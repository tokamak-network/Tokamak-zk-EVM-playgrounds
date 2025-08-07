import Handle from "./Handle";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";
import { useTokamakZkEVMActions } from "../hooks/useTokamakZkEVMActions";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";

export default function PeipelineHandles() {
  const { updateActiveSection } = usePipelineAnimation();
  const {
    runSynthesizer,
    runProve,
    runPreProcess,
    runVerify,
    runSetupTrustedSetup,
  } = useTokamakZkEVMActions();
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
        className="top-[298px] left-[199px]"
        onClick={() => {
          updateActiveSection("qap-to-setup-synthesizer");
        }}
        isActive={qapStage.isReady}
      />
      <Handle
        type="orange"
        className="top-[308px] left-[650px]"
        onClick={() => {
          runSynthesizer();
          // updateActiveSection("synthesizer-to-prove-bikzg");
        }}
        isActive={synthesizerStage.isReady}
      />
      <Handle
        type="green"
        className="top-[417px] left-[325px]"
        onClick={() => {
          runSetupTrustedSetup();
          // updateActiveSection("setup-to-prove");
        }}
        isActive={setupStage.isReady}
      />
      <Handle
        type="green"
        className="top-[630px] left-[325px]"
        onClick={() => {
          runProve();
          // updateActiveSection("prove-to-verify");
        }}
        isActive={proveStage.isReady}
        // isActive={true}
      />
      <Handle
        type="green"
        className="top-[740px] left-[628px]"
        onClick={() => {
          runVerify();
          // updateActiveSection("verify-to-result");
        }}
        isActive={verifyStage.isReady}
        // isActive={true}
      />
      <Handle
        type="green"
        className="top-[503px] left-[780px]"
        onClick={() => {
          runPreProcess();
          // updateActiveSection("bikzg-to-verify");
        }}
        isActive={bikzgStage.isReady}
        // isActive={true}
      />
    </div>
  );
}
