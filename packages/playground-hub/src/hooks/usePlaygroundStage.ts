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

  const qapStage = useMemo(() => {
    return {
      isReady: playgroundStage.evmSpec,
      isDone: playgroundStage.qap,
    };
  }, [playgroundStage]);

  const synthesizerStage = useMemo(() => {
    return {
      isReady: playgroundStage.qap && playgroundStage.transactionHash,
      isDone: playgroundStage.synthesizer,
    };
  }, [playgroundStage]);

  const setupStage = useMemo(() => {
    return {
      isReady: playgroundStage.qap,
      isDone: playgroundStage.setup,
    };
  }, [playgroundStage]);

  const proveStage = useMemo(() => {
    return {
      isReady: playgroundStage.setup && playgroundStage.synthesizer,
      isDone: playgroundStage.prove,
    };
  }, [playgroundStage]);

  const bikzgStage = useMemo(() => {
    return {
      isReady: playgroundStage.synthesizer,
      isDone: playgroundStage.bikzg,
    };
  }, [playgroundStage]);

  const verifyStage = useMemo(() => {
    return {
      isReady: playgroundStage.prove && playgroundStage.bikzg,
      isDone: playgroundStage.verify,
    };
  }, [playgroundStage]);

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
    qapStage,
    synthesizerStage,
    setupStage,
    proveStage,
    bikzgStage,
    verifyStage,
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
