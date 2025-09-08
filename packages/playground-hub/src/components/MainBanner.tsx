import MainBannerImage from "@/assets/main-banner.svg";
import MainBannerImageSmall from "@/assets/main-banner-small.svg";
import FingerImage from "@/assets/finger.svg";
import { useSetAtom } from "jotai";
import { isStartedAtom } from "../atoms/ui";
import { useViewport } from "../hooks/useMediaView";

export default function MainBanner() {
  const setIsStarted = useSetAtom(isStartedAtom);
  const { isOverBreakpoint } = useViewport();

  const handleClick = () => {
    setIsStarted(true);
  };

  return (
    <div
      className="relative cursor-pointer"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        marginTop: isOverBreakpoint ? "0px" : "-160px",
      }}
    >
      <img
        src={isOverBreakpoint ? MainBannerImage : MainBannerImageSmall}
        alt="Main Banner"
      />
      <img
        src={FingerImage}
        alt="Finger"
        className="absolute top-[43px] right-[-66px]"
      />
    </div>
  );
}
