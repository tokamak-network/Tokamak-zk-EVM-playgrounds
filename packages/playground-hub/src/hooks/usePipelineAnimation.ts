import { useAtom } from "jotai";
import {
  activeSectionAtom,
  pendingAnimationAtom,
  resetAnimationAtom,
  Section,
} from "../atoms/pipelineAnimation";

export const usePipelineAnimation = () => {
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const [pendingAnimation, setPendingAnimation] = useAtom(pendingAnimationAtom);
  const [resetAnimation, setResetAnimation] = useAtom(resetAnimationAtom);

  const updateActiveSection = (section: Section) => {
    setActiveSection(section);
  };

  const resetAnimationHandler = () => {
    setResetAnimation(true);
  };

  return {
    activeSection,
    updateActiveSection,
    pendingAnimation,
    setPendingAnimation,
    resetAnimation,
    setResetAnimation,
    resetAnimationHandler,
  };
};
