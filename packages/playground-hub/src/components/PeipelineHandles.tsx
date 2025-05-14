import { useDocker } from "../hooks/useDocker";
import { activeSectionAtom } from "../atoms/pipelineAnimation";
import Handle from "./Handle";
import { useAtom } from "jotai";

export default function PeipelineHandles() {
  const [, setActiveSection] = useAtom(activeSectionAtom);
  const {
    loadImages,
    loadContainers,
    runContainer,
    stopContainer,
    executeCommand,
  } = useDocker();

  // 다양한 디렉토리 탐색
  const exploreDirectories = async () => {
    try {
      // 1단계: 스크립트 실행하고 결과를 파일에 저장
      await executeCommand("8fc1f017fb83", [
        "bash",
        "-c",
        `cd /app/frontend/qap-compiler && 
         bash ./scripts/compile_fixed.sh > /tmp/compile_results.txt 2>&1`,
      ]);

      // 2단계: 결과 파일 읽기
      const result = await executeCommand("8fc1f017fb83", [
        "bash",
        "-c",
        "cat /tmp/compile_results.txt",
      ]);

      console.log("스크립트 실행 결과:");
      console.log(result);
    } catch (err) {
      console.error("스크립트 실행 오류:", err);
    }
  };

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
        onClick={() => setActiveSection("qap-to-setup-synthesizer")}
      />
      <Handle
        type="green"
        className="top-[575px] left-[216px]"
        onClick={() => {
          runContainer("tokamak-zk-evm-3");
          // loadContainers();
        }}
      />
      <Handle type="green" className="top-[775px] left-[395px]" />
      <Handle
        type="green"
        className="top-[695px] left-[695px]"
        onClick={() => {
          exploreDirectories();
        }}
      />
      <Handle type="pink" className="top-[588px] left-[875px]" />
    </div>
  );
}
