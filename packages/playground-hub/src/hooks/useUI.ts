import { useAtomValue } from "jotai";
import {
  isErrorAtom,
  isFirstTimeAtom,
  isStartedAtom,
  showProcessResultModalAtom,
} from "../atoms/ui";
import { playgroundStageInProcessAtom } from "../atoms/playgroundStage";

import { useMemo } from "react";

export const useUI = () => {
  const isFirstTime = useAtomValue(isFirstTimeAtom);
  const showProcessResultModal = useAtomValue(showProcessResultModalAtom);
  const isInProcess = useAtomValue(playgroundStageInProcessAtom);
  const isError = useAtomValue(isErrorAtom);
  const isStarted = useAtomValue(isStartedAtom);

  const isHeroUp = useMemo(() => {
    return !isFirstTime;
  }, [isFirstTime]);

  return {
    isFirstTime,
    showProcessResultModal,
    isInProcess,
    isHeroUp,
    isError,
    isStarted,
  };
};
