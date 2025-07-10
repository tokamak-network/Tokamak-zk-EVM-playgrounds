import { atom } from "jotai";

export type Modal =
  | "none"
  | "transaction-input"
  | "error"
  | "docker-select"
  | "exit"
  | "loading"
  | "synthesizer-error"
  | "synthesizer-result"
  | "setup-result"
  | "submit";

export const activeModalAtom = atom<Modal>("none");
