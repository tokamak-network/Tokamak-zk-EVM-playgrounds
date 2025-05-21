import { useAtom } from "jotai";
import {
  activeSectionAtom,
  pendingAnimationAtom,
} from "../atoms/pipelineAnimation";

export const usePipelineAnimation = () => {
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const [pendingAnimation, setPendingAnimation] = useAtom(pendingAnimationAtom);

  return {
    activeSection,
    setActiveSection,
    pendingAnimation,
    setPendingAnimation,
  };
};
