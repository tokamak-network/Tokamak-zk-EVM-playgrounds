import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { activeModalAtom } from "../../atoms/modals";
import ErrorModalImage from "../../assets/modals/submit/submit-modal.png";
import { useResetStage } from "../../hooks/useResetStage";

const SubmitModal: React.FC = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);
  const isOpen = useMemo(() => activeModal === "submit", [activeModal]);
  const { initializeWithNewTransaction } = useResetStage();

  const onClose = () => {
    initializeWithNewTransaction();
    setActiveModal("none");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img
          src={ErrorModalImage}
          alt={"error-modal"}
          style={{
            width: "460px",
            marginTop: "10px",
          }}
        ></img>
        <div
          className="absolute w-[188px] h-[48px] top-[241px] left-[30px] cursor-pointer"
          onClick={onClose}
        ></div>
        <div
          className="absolute w-[188px] h-[48px] top-[241px] right-[30px] cursor-pointer"
          onClick={onClose}
        ></div>
      </div>
    </div>
  );
};

export default SubmitModal;
