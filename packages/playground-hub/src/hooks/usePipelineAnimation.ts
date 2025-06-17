import { useAtom } from "jotai";
import {
  activeSectionAtom,
  pendingAnimationAtom,
  resetAnimationAtom,
  resetAllAnimationAtom,
  Section,
  isAnimationRunningAtom,
} from "../atoms/pipelineAnimation";

export const usePipelineAnimation = () => {
  const [activeSection, setActiveSection] = useAtom(activeSectionAtom);
  const [pendingAnimation, setPendingAnimation] = useAtom(pendingAnimationAtom);
  const [resetAnimation, setResetAnimation] = useAtom(resetAnimationAtom);
  const [resetAllAnimation, setResetAllAnimation] = useAtom(
    resetAllAnimationAtom
  );
  const [isAnimationRunning, setIsAnimationRunning] = useAtom(
    isAnimationRunningAtom
  );

  const updateActiveSection = (section: Section) => {
    setActiveSection(section);
  };

  const resetAnimationWithNewTransactionHandler = () => {
    setResetAnimation(true);
  };

  const resetAllAnimationHandler = () => {
    setResetAllAnimation(true);
  };

  return {
    activeSection,
    updateActiveSection,
    pendingAnimation,
    setPendingAnimation,
    resetAnimation,
    setResetAnimation,
    setResetAllAnimation,
    resetAllAnimation,
    resetAnimationWithNewTransactionHandler,
    resetAllAnimationHandler,
    isAnimationRunning,
    setIsAnimationRunning,
  };
};
