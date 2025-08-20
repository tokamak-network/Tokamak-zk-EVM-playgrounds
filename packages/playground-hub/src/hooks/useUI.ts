import { useAtomValue } from "jotai";
import { isFirstTimeAtom, showProcessResultModalAtom } from "../atoms/ui";
import { playgroundStageInProcessAtom } from "../atoms/playgroundStage";
import { useMemo } from "react";

export const useUI = () => {
  const isFirstTime = useAtomValue(isFirstTimeAtom);
  const showProcessResultModal = useAtomValue(showProcessResultModalAtom);
  const isInProcess = useAtomValue(playgroundStageInProcessAtom);

  const isHeroUp = useMemo(() => {
    return !isFirstTime;
  }, []);

  return { isFirstTime, showProcessResultModal, isInProcess, isHeroUp };
};
