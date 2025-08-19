import MainBannerImage from "@/assets/main-banner.svg";
import FingerImage from "@/assets/finger.svg";
import { useSetAtom } from "jotai";
import { isStartedAtom } from "../atoms/ui";

export default function MainBanner() {
  const setIsStarted = useSetAtom(isStartedAtom);

  const handleClick = () => {
    setIsStarted(true);
  };

  return (
    <div
      className="relative cursor-pointer"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <img src={MainBannerImage} alt="Main Banner" />
      <img
        src={FingerImage}
        alt="Finger"
        className="absolute top-[45px] right-[-60px]"
      />
    </div>
  );
}
