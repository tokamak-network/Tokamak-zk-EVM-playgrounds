import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import pipeline from "../assets/images/pipe.png";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";
import Handle from "./Handle";
import Bubbles from "./Bubble";
import "../styles/pipelineAnimation.css";
import PixelatedPipeline from "./PixelatedPipeline";
import PixelFlow from "./PixelFlow";

export default function PipelineBG() {
  const pipelinePath = [
    { x: 133, y: 150 }, // 시작점
  ];

  return (
    <div className="w-[1080px] h-[935px] flex items-center justify-center relative">
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

      {/* 물이 흐르는 애니메이션을 위한 SVG 오버레이 */}
      {/* <div className="absolute max-w-full max-h-full mt-[155px] pipeline-water-container">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          preserveAspectRatio="none"
          className="pipeline-svg"
        >
          <path
            d="M50,100 L300,100 C350,100 350,200 400,200 L700,200 C750,200 750,300 800,300 L950,300"
            className="pipeline-path"
            fill="none"
            stroke="transparent"
            strokeWidth="20"
          />
          <path
            d="M50,100 L300,100 C350,100 350,200 400,200 L700,200 C750,200 750,300 800,300 L950,300"
            className="water-animation"
            fill="none"
            stroke="#4FC3F7"
            strokeWidth="18"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          />
        </svg>
      </div> */}

      {/* 픽셀화된 파이프라인 애니메이션 */}
      {/* <PixelatedPipeline className="absolute max-w-full max-h-full mt-[155px]" /> */}

      {/* 픽셀 흐름 애니메이션 */}
      <div className="absolute max-w-full max-h-full mt-[155px] w-full h-full">
        <PixelFlow pipelinePath={pipelinePath} />
      </div>

      <img
        src={pipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
      />
      {/* <CloudWithRain
        position="top-[113px] left-[105px]"
        cloudType="blue"
        showRain={true}
      />
      <CloudWithRain
        position="top-[113px] right-[155px]"
        cloudType="skyblue"
        showRain={true}
      /> */}
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[10px] right-[25px]"
      />

      {/* 디버깅용 표시 - 개발 중에만 사용 */}
      {true && (
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
      )}

      <div className="w-full h-full absolute">
        <Handle type="orange" className="top-[400px] left-[70px]" />
        <Handle type="orange" className="top-[535px] left-[482px]" />
        <Handle type="green" className="top-[575px] left-[216px]" />
        <Handle type="green" className="top-[775px] left-[395px]" />
        <Handle type="green" className="top-[695px] left-[695px]" />
        <Handle type="pink" className="top-[588px] left-[875px]" />
      </div>
      <Bubbles />
    </div>
  );
}
