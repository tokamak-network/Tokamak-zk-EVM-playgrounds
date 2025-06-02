import { atom } from "jotai";

export type Modal =
  | "none"
  | "transaction-input"
  | "error"
  | "docker-select"
  | "exit"
  | "loading";

export const activeModalAtom = atom<Modal>("none");
