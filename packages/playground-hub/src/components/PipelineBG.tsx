import outlinePipeline from "../assets/images/outline-pipe.png";
import smallPipeline from "../assets/images/small-pipe.png";
import pipeline from "../assets/images/pipe.png";
import cloudBlue from "../assets/images/cloud-blue.svg";
import cloudSkyblue from "../assets/images/cloud-skyblue.svg";
import tank from "../assets/images/tank.png";

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
      <img
        src={cloudBlue}
        alt="cloudBlue"
        className="absolute max-w-full max-h-full object-contain top-[113px] left-[305px]"
      />
      <img
        src={cloudSkyblue}
        alt="cloudSkyblue"
        className="absolute max-w-full max-h-full object-contain top-[113px] right-[355px]"
      />
      <img
        src={tank}
        alt="tank"
        className="absolute max-w-full max-h-full object-contain bottom-[30px] right-[220px]"
      />
    </div>
  );
}
