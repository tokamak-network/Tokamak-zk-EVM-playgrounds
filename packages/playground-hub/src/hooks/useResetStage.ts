import { useCallback } from "react";
import { usePipelineAnimation } from "./usePipelineAnimation";
import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "./usePlaygroundStage";
import { useModals } from "./useModals";
import {
  provingIsDoneAtom,
  provingResultAtom,
} from "../atoms/pipelineAnimation";
import { useSetAtom } from "jotai";

export const useResetStage = () => {
  const setProvingIsDone = useSetAtom(provingIsDoneAtom);
  const setProvingResult = useSetAtom(provingResultAtom);
  const { setPendingAnimation } = usePipelineAnimation();
  const {
    updateActiveSection,
    resetAllAnimationHandler,
    resetAnimationWithNewTransactionHandler,
  } = usePipelineAnimation();
  const { resetAllStartStage, resetStartStageWithNewTransaction } =
    usePlaygroundStartStage();
  const { resetPlaygroundStageWithNewTransaction } = usePlaygroundStage();
  const { openModal } = useModals();

  const initializeWhenCatchError = useCallback(() => {
    setPendingAnimation(true);
    updateActiveSection("none");
    resetAllAnimationHandler();
    setProvingIsDone(false);
    setProvingResult(false);
    openModal("error");
    resetAllStartStage();
  }, [
    setPendingAnimation,
    updateActiveSection,
    resetAllAnimationHandler,
    setProvingIsDone,
    setProvingResult,
    resetAllStartStage,
  ]);

  const initializeWithNewTransaction = useCallback(() => {
    updateActiveSection("none");
    resetAnimationWithNewTransactionHandler();
    setProvingIsDone(false);
    setProvingResult(false);
    resetStartStageWithNewTransaction();
    resetPlaygroundStageWithNewTransaction();
  }, [
    resetAnimationWithNewTransactionHandler,
    resetStartStageWithNewTransaction,
    resetPlaygroundStageWithNewTransaction,
  ]);

  return {
    initializeWhenCatchError,
    initializeWithNewTransaction,
  };
};
