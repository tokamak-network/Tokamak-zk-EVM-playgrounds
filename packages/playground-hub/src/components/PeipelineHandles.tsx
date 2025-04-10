import { activeSectionAtom } from "../atoms/pipelineAnimation";
import Handle from "./Handle";
import { useAtom } from "jotai";

export default function PeipelineHandles() {
  const [, setActiveSection] = useAtom(activeSectionAtom);

  return (
    <div className="w-full h-full absolute">
      <Handle
        type="orange"
        className="top-[400px] left-[70px]"
        onClick={() => setActiveSection("qap-to-setup-synthesizer")}
      />
      <Handle
        type="orange"
        className="top-[535px] left-[482px]"
        onClick={() => setActiveSection("qap-to-setup-synthesizer")}
      />
      <Handle type="green" className="top-[575px] left-[216px]" />
      <Handle type="green" className="top-[775px] left-[395px]" />
      <Handle type="green" className="top-[695px] left-[695px]" />
      <Handle type="pink" className="top-[588px] left-[875px]" />
    </div>
  );
}
