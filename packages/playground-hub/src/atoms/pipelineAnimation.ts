import { atom } from "jotai";

export type Section =
  | "none"
  | "evm-to-qap"
  | "qap-to-setup-synthesizer"
  | "transaction-to-synthesizer";
export const activeSectionAtom = atom<Section>("none");
