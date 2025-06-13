import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import SynthesizerErrorImage from "../../assets/modals/synthesizer/synthesizer-error.svg";

const SynthesizerError: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(
    () => activeModal === "synthesizer-error",
    [activeModal]
  );

  const onClose = () => {
    setActiveModal("none");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img src={SynthesizerErrorImage} alt={"error-modal"}></img>
        <div
          className="absolute w-[18px] h-[18px] top-[20px] left-[260px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default SynthesizerError;
