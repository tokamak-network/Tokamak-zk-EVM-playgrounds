import { atom } from "jotai";

export type PlaygroundStage = {
  evmSpec: boolean;
  transactionHash: boolean;
  qap: boolean;
  setup: boolean;
  synthesizer: boolean;
  verify: boolean;
  prove: boolean;
  bikzg: boolean;
  result: boolean;
};

export const playgroundStageAtom = atom<PlaygroundStage>({
  evmSpec: false,
  transactionHash: false,
  qap: false,
  setup: false,
  synthesizer: false,
  verify: false,
  prove: false,
  bikzg: false,
  result: false,
});
