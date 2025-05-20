import { useAtom } from "jotai";
import { PlaygroundStage, playgroundStageAtom } from "../atoms/playgroundStage";

export default function usePlaygroundStage() {
  const [playgroundStage, setPlaygroundStage] = useAtom(playgroundStageAtom);

  const setStage = (stage: keyof PlaygroundStage, value: boolean) => {
    setPlaygroundStage({ ...playgroundStage, [stage]: value });
  };

  return { playgroundStage, setStage };
}
