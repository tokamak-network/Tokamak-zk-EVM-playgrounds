import { useAtom } from "jotai";
import {
  PlaygroundStage,
  playgroundStageAtom,
  PlaygroundStartStage,
  playgroundStartStageAtom,
  playgroundStageInProcessAtom,
} from "../atoms/playgroundStage";
import { useMemo } from "react";

export function usePlaygroundStage() {
  const [playgroundStage, setPlaygroundStage] = useAtom(playgroundStageAtom);
  const [playgroundStageInProcess, setPlaygroundStageInProcess] = useAtom(
    playgroundStageInProcessAtom
  );

  const setStage = (stage: keyof PlaygroundStage, value: boolean) => {
    setPlaygroundStage({ ...playgroundStage, [stage]: value });
  };

  const isReadyForResult = useMemo(() => {
    return (
      playgroundStage.evmSpec &&
      playgroundStage.transactionHash &&
      playgroundStage.qap &&
      playgroundStage.setup &&
      playgroundStage.synthesizer &&
      playgroundStage.verify &&
      playgroundStage.prove &&
      playgroundStage.bikzg
    );
  }, [playgroundStage]);

  const allStagesAreDone = useMemo(() => {
    return (
      playgroundStage.evmSpec &&
      playgroundStage.transactionHash &&
      playgroundStage.qap &&
      playgroundStage.setup &&
      playgroundStage.synthesizer &&
      playgroundStage.prove &&
      playgroundStage.verify
    );
  }, [playgroundStage]);

  return {
    playgroundStage,
    setStage,
    isReadyForResult,
    allStagesAreDone,
    playgroundStageInProcess,
    setPlaygroundStageInProcess,
  };
}

export function usePlaygroundStartStage() {
  const [playgroundStartStage, setPlaygroundStartStage] = useAtom(
    playgroundStartStageAtom
  );

  const setStartStage = (stage: keyof PlaygroundStartStage, value: boolean) => {
    setPlaygroundStartStage({ ...playgroundStartStage, [stage]: value });
  };

  const resetStartStageWithNewTransaction = () => {
    setPlaygroundStartStage({
      ...playgroundStartStage,
      transactionHash: false,
      synthesizer: false,
      prove: false,
      verify: false,
    });
  };

  const resetAllStartStage = () => {
    setPlaygroundStartStage({
      evmSpec: false,
      transactionHash: false,
      qap: false,
      setup: false,
      synthesizer: false,
      prove: false,
      verify: false,
    });
  };

  const isNotStarted = useMemo(() => {
    return (
      !playgroundStartStage.evmSpec &&
      !playgroundStartStage.transactionHash &&
      !playgroundStartStage.qap &&
      !playgroundStartStage.setup &&
      !playgroundStartStage.synthesizer &&
      !playgroundStartStage.prove &&
      !playgroundStartStage.verify
    );
  }, [playgroundStartStage]);

  return {
    playgroundStartStage,
    setStartStage,
    resetStartStageWithNewTransaction,
    resetAllStartStage,
    isNotStarted,
  };
}
