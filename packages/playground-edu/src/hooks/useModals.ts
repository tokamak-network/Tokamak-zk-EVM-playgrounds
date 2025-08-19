import { useAtom } from "jotai";
import { activeModalAtom, Modal } from "../atoms/modals";
import { useMemo } from "react";

export const useModals = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);

  const openModal = (modal: Modal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal("none");
  };

  const anyModalOpen = useMemo(() => {
    return activeModal !== "none";
  }, [activeModal]);

  return { activeModal, openModal, closeModal, anyModalOpen };
};
