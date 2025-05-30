import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";
import Bubbles from "./Bubble";
import "../styles/pipelineAnimation.css";
import PipelineAnimations from "./animation-pipeline/PipelineAnimations";
import PeipelineHandles from "./PeipelineHandles";
import Spinner from "./animation-pipeline/Spinner";

// 이미지에 맞게 X축 기준 색상 배열 (열별)
// const colors = [
//   "#365969", // 첫번째 열 - 진한 파란색
//   "#159CFC", // 두번째 열 - 진한 회청색
//   "#7AC8FF", // 세번째 열 - 밝은 파란색
//   "#159CFC", // 네번째 열 - 하늘색
//   "#0079D0", // 다섯번째 열 - 밝은 파란색
//   "#365969", // 여섯번째 열 - 진한 파란색
// ];

export default function PipelineBG() {
  return (
    <div className="w-[1080px] h-[935px] flex items-center justify-center relative overflow-hidden">
      <img
        src={outlinePipeline}
        alt="pipeline-bg"
        className="absolute max-w-full max-h-full object-contain"
      />
      <img
        src={smallPipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain mr-[27px]"
      />

      {/* 픽셀 흐름 애니메이션 */}
      {/* <div className="absolute max-w-full max-h-full mt-[155px] w-full h-full">
        <PixelFlow pipelinePath={pipelinePath} />
      </div>
      <img
        src={pipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
      ></img> */}

      <PipelineAnimations />
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[10px] right-[25px] z-[-1]"
      />
      <Spinner />

      {/* 디버깅용 표시 - 개발 중에만 사용 */}
      {/* {true && (
        <div
          style={{
            position: "absolute",
            left: pipelinePath[0].x,
            top: pipelinePath[0].y,
            width: "10px",
            height: "10px",
            backgroundColor: "red",
            borderRadius: "50%",
            zIndex: 20,
          }}
        />
      )} */}

      <CloudWithRain position="top-[113px] left-[105px]" cloudType="blue" />
      <CloudWithRain position="top-[113px] right-[155px]" cloudType="skyblue" />
      <PeipelineHandles />
      <Bubbles />
    </div>
  );
}
