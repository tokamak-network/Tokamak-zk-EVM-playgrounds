import React, { useMemo, useEffect, useRef, useCallback } from "react";
import ExitModalImage from "../../assets/modals/exit/exit-modal.svg";
import { useModals } from "../../hooks/useModals";

const ExitModal: React.FC = () => {
  const { activeModal, openModal } = useModals();
  const isOpen = useMemo(() => activeModal === "exit", [activeModal]);
  const openModalRef = useRef(openModal);

  // Keep the ref updated
  useEffect(() => {
    openModalRef.current = openModal;
  }, [openModal]);

  const handleShowExitModal = useCallback(() => {
    console.log("show-exit-modal event received");
    openModalRef.current("exit");
  }, []);

  useEffect(() => {
    window.electronAPI.on("show-exit-modal", handleShowExitModal); // 이벤트 리스너 등록

    return () => {
      window.electronAPI.removeListener("show-exit-modal", handleShowExitModal); // 이벤트 리스너 제거
    };
  }, [handleShowExitModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 overflow-y-auto w-full h-full flex justify-center items-center">
      <div className="relative">
        <img src={ExitModalImage} alt={"exit-modal"} />
      </div>
    </div>
  );
};

export default ExitModal;
