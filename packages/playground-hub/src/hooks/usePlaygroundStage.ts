import { useAtom } from "jotai";
import {
  PlaygroundStage,
  playgroundStageAtom,
  PlaygroundStartStage,
  playgroundStartStageAtom,
} from "../atoms/playgroundStage";
import { useMemo } from "react";

export default function usePlaygroundStage() {
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

  return { playgroundStartStage, setStartStage };
}
