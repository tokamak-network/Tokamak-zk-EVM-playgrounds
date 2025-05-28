import { useAtom } from "jotai";
import { activeModalAtom, Modal } from "../atoms/modals";

export const useModals = () => {
  const [activeModal, setActiveModal] = useAtom(activeModalAtom);

  const openModal = (modal: Modal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal("none");
  };

  return { activeModal, openModal, closeModal };
};
