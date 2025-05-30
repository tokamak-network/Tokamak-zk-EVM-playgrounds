import { usePipelineAnimation } from "../../hooks/usePipelineAnimation";
import Spinner_1 from "../../assets/images/spinner/spinner-1.png";
import Spinner_2 from "../../assets/images/spinner/spinner-2.png";
import Spinner_3 from "../../assets/images/spinner/spinner-3.png";
import "../../styles/spinner.css"; // Import the CSS file for animations

export default function Spinner() {
  const { pendingAnimation } = usePipelineAnimation();
  console.log("pendingAnimation", pendingAnimation);

  return (
    <div className="absolute overflow-hidden bottom-[4px]">
      <div
        className={`flex flex-col w-[1073px] h-[6px] ${pendingAnimation ? "animate-spin" : "opacity-0"}`}
      >
        {" "}
        {/* Added overflow-hidden */}
        <img className="w-full h-[2px]" src={Spinner_1} alt="spinner-1" />
        <img className="w-full h-[2px]" src={Spinner_2} alt="spinner-2" />
        <img className="w-full h-[2px]" src={Spinner_3} alt="spinner-3" />
      </div>
    </div>
  );
}
