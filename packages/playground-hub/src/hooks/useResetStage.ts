import { useCallback } from "react";
import {
  usePlaygroundStage,
  usePlaygroundStartStage,
} from "./usePlaygroundStage";

export const useResetStage = () => {
  const { resetAllStartStage, resetStartStageWithNewTransaction } =
    usePlaygroundStartStage();
  const { resetPlaygroundStageWithNewTransaction } = usePlaygroundStage();

  const initializeWhenCatchError = useCallback(() => {
    resetAllStartStage();
  }, [resetAllStartStage]);

  const initializeWithNewTransaction = useCallback(() => {
    resetStartStageWithNewTransaction();
    resetPlaygroundStageWithNewTransaction();
  }, [
    resetStartStageWithNewTransaction,
    resetPlaygroundStageWithNewTransaction,
  ]);

  return {
    initializeWhenCatchError,
    initializeWithNewTransaction,
  };
};
