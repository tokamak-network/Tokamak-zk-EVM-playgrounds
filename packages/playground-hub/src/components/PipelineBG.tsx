import outlinePipeline from "../assets/images/outline-pipe.svg";
import smallPipeline from "../assets/images/small-pipe.svg";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";
import Bubbles from "./Bubble";
import "../styles/pipelineAnimation.css";
import PipelineAnimations from "./animation-pipeline/PipelineAnimations";
import PeipelineHandles from "./PeipelineHandles";
import Spinner from "./animation-pipeline/Spinner";
import { useModals } from "../hooks/useModals";

export default function PipelineBG() {
  const { anyModalOpen } = useModals();
  return (
    <div
      className={`w-[1080px] h-[935px] flex items-center justify-center relative overflow-hidden ${
        anyModalOpen ? "opacity-50" : ""
      }`}
    >
      <img
        src={outlinePipeline}
        alt="pipeline-bg"
        className="absolute max-w-full h-[920px] bottom-[0px] object-contain"
      />
      <img
        src={smallPipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain top-[573px] mr-[27px] z-[-1]"
      />
      <PipelineAnimations />
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[10px] right-[25px] z-[1]"
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

      <CloudWithRain position="top-[113px] left-[180px]" cloudType="blue" />
      <CloudWithRain position="top-[113px] right-[173px]" cloudType="skyblue" />
      <PeipelineHandles />
      <Bubbles />
    </div>
  );
}
