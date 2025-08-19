import logo from "../assets/images/logo.svg";
import { useModals } from "../hooks/useModals";
import refreshIconActive from "../assets/buttons/refresh-active.svg";
import refreshIconInactive from "../assets/buttons/refresh-inactive.svg";
import { usePlaygroundStage } from "../hooks/usePlaygroundStage";
import { useMemo } from "react";

export default function Logo() {
  const { anyModalOpen } = useModals();
  const { qapStage } = usePlaygroundStage();
  const refreshIsAcitve = useMemo(() => {
    return qapStage.isReady;
  }, [qapStage]);

  return (
    <div
      className={`relative flex items-center justify-center w-[1050px] h-[88px] ${
        anyModalOpen ? "opacity-50" : ""
      }`}
    >
      <img src={logo} alt="logo" />
      <img
        src={refreshIsAcitve ? refreshIconActive : refreshIconInactive}
        alt="refreshIconActive"
        className={`absolute right-[0px] ${refreshIsAcitve ? "cursor-pointer" : "cursor-not-allowed"}`}
        onClick={() => {
          if (refreshIsAcitve) {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
