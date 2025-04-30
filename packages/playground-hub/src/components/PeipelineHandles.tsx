import { activeSectionAtom } from "../atoms/pipelineAnimation";
import Handle from "./Handle";
import { useAtom } from "jotai";
import { useState } from "react";
export default function PeipelineHandles() {
  const [, setActiveSection] = useAtom(activeSectionAtom);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandOutput, setCommandOutput] = useState("");

  const executeCommand = async (command: string) => {
    if (isExecuting) return;

    setIsExecuting(true);
    setCommandOutput("명령어 실행 중...");

    try {
      const result = await window.electronAPI.executeCommand(command);
      console.log("명령어 실행 결과:", result);
      setCommandOutput(result.stdout || "명령어가 실행되었습니다.");

      if (result.stderr) {
        console.warn("stderr:", result.stderr);
      }
    } catch (error) {
      console.error("명령어 실행 오류:", error);
      setCommandOutput(`오류: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full h-full absolute">
      <Handle
        type="orange"
        className="top-[395px] left-[70px]"
        onClick={() => {
          executeCommand("echo '핑크 핸들 클릭됨'");
          setActiveSection("qap-to-setup-synthesizer");
        }}
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
