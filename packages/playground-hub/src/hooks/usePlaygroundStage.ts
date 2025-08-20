import { useAtom } from "jotai";
import {
  PlaygroundStage,
  playgroundStageAtom,
  PlaygroundStartStage,
  playgroundStartStageAtom,
  playgroundStageInProcessAtom,
} from "@/atoms/playgroundStage";
import { useMemo } from "react";

export function usePlaygroundStage() {
  const [playgroundStage, setPlaygroundStage] = useAtom(playgroundStageAtom);
  const [playgroundStageInProcess, setPlaygroundStageInProcess] = useAtom(
    playgroundStageInProcessAtom
  );

  const setStage = (stage: keyof PlaygroundStage, value: boolean) => {
    setPlaygroundStage({ ...playgroundStage, [stage]: value });
  };

  // const evmSpecStage = useMemo(() => {
  //   return {
  //     isReady: playgroundStage.evmSpec,
  //     isDone: playgroundStage.qapStage,
  //   };
  // }, [playgroundStage]);

  const qapStage = useMemo(() => {
    return {
      isReady: playgroundStage.evmSpec,
      isDone: playgroundStage.qap,
    };
  }, [playgroundStage]);

  const synthesizerStage = useMemo(() => {
    return {
      isReady: playgroundStage.transactionHash,
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
      isReady: playgroundStage.synthesizer && playgroundStage.setup,
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

  const resetPlaygroundStageWithNewTransaction = () => {
    setPlaygroundStage({
      ...playgroundStage,
      transactionHash: false,
      synthesizer: false,
      prove: false,
      verify: false,
      bikzg: false,
      result: false,
    });
  };

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
    resetPlaygroundStageWithNewTransaction,
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
      // 유지되어야 할 상태들
      evmSpec: playgroundStartStage.evmSpec,
      qap: playgroundStartStage.qap,
      setup: playgroundStartStage.setup,
      preprocess: playgroundStartStage.preprocess,
      // 초기화되어야 할 상태들
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
      preprocess: false,
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
      !playgroundStartStage.verify &&
      !playgroundStartStage.preprocess
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
