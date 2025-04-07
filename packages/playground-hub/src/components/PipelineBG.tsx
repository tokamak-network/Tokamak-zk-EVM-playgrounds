import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import pipeline from "../assets/images/pipe.png";
import tank from "../assets/images/tank.png";
import CloudWithRain from "./CloudWithRain";

export default function PipelineBG() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
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
        position="top-[113px] left-[300px]"
        cloudType="blue"
        showRain={true}
      />

      <CloudWithRain
        position="top-[113px] right-[355px]"
        cloudType="skyblue"
        showRain={true}
      />

      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[30px] right-[220px]"
      />
    </div>
  );
}
