import { useAtom } from "jotai";
import {
  PlaygroundStage,
  playgroundStageAtom,
  PlaygroundStartStage,
  playgroundStartStageAtom,
} from "../atoms/playgroundStage";
import { useMemo } from "react";

export function usePlaygroundStage() {
  const [playgroundStage, setPlaygroundStage] = useAtom(playgroundStageAtom);

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

  return { playgroundStage, setStage, isReadyForResult };
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

  return {
    playgroundStartStage,
    setStartStage,
    resetStartStageWithNewTransaction,
    resetAllStartStage,
  };
}
