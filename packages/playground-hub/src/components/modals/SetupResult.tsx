import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SetupResultImage from "../../assets/modals/setup/setup-result.svg";

const SetupResult: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "setup-result", [activeModal]);

  const onClose = () => {
    setActiveModal("none");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img src={SetupResultImage} alt={"error-modal"}></img>
        <div
          className="absolute w-[18px] h-[18px] top-[20px] right-[20px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default SetupResult;
