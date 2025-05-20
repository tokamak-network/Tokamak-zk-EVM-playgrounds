import { useDocker } from "../hooks/useDocker";
import Handle from "./Handle";
import { useSynthesizer } from "../hooks/useSynthesizer";
import { usePipelineAnimation } from "../hooks/usePipelineAnimation";
export default function PeipelineHandles() {
  const { setActiveSection } = usePipelineAnimation();
  const { runContainer, executeCommand } = useDocker();
  const { parseTONTransfer } = useSynthesizer();

  // 다양한 디렉토리 탐색
  // const exploreDirectories = async () => {
  //   try {
  //     // 1단계: 스크립트 실행하고 결과를 파일에 저장
  //     await executeCommand(
  //       "9d8b979e8b2edabfe5e56bb7bb121f9c62203116b016db4e858dfd9dad33d541",
  //       [
  //         "bash",
  //         "-c",
  //         `cd /app/frontend/qap-compiler &&
  //        bash ./scripts/compile_fixed.sh > /tmp/compile_results.txt 2>&1`,
  //       ]
  //     );

  //     // 2단계: 결과 파일 읽기
  //     const result = await executeCommand("8fc1f017fb83", [
  //       "bash",
  //       "-c",
  //       "cat /tmp/compile_results.txt",
  //     ]);

  //     console.log("스크립트 실행 결과:");
  //     console.log(result);
  //   } catch (err) {
  //     console.error("스크립트 실행 오류:", err);
  //   }
  // };

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
          // runContainer("tokamak-zk-evm-demo");
          // loadContainers();
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
