import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import pipeline from "../assets/images/pipe.png";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";
import Handle from "./Handle";

export default function PipelineBG() {
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
      <img
        src={pipeline}
        alt="smallPipeline-bg"
        className="absolute max-w-full max-h-full object-contain mt-[155px]"
      />

      <CloudWithRain
        position="top-[113px] left-[105px]"
        cloudType="blue"
        showRain={true}
      />

      <CloudWithRain
        position="top-[113px] right-[155px]"
        cloudType="skyblue"
        showRain={true}
      />
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[10px] right-[25px]"
      />

      <div className="w-full h-full relative">
        <Handle type="orange" className="top-[400px] left-[70px]" />
        <Handle type="orange" className="top-[535px] left-[482px]" />
        <Handle type="green" className="top-[575px] left-[216px]" />
        <Handle type="green" className="top-[775px] left-[395px]" />
        <Handle type="green" className="top-[695px] left-[695px]" />
        <Handle type="pink" className="top-[588px] left-[875px]" />
      </div>
    </div>
  );
}
