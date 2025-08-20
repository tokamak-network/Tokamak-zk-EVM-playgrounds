import { useAtomValue } from "jotai";
import { isFirstTimeAtom, showProcessResultModalAtom } from "../atoms/ui";
import { playgroundStageInProcessAtom } from "../atoms/playgroundStage";

export const useUI = () => {
  const isFirstTime = useAtomValue(isFirstTimeAtom);
  const showProcessResultModal = useAtomValue(showProcessResultModalAtom);
  const isInProcess = useAtomValue(playgroundStageInProcessAtom);

  return { isFirstTime, showProcessResultModal, isInProcess };
};
