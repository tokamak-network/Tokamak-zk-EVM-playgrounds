import { atom } from "jotai";

export type Section =
  | "none"
  | "evm-to-qap"
  | "qap-to-setup-synthesizer"
  | "transaction-to-synthesizer"
  | "setup-to-verify"
  | "synthesizer-to-verify-bikzg"
  | "verify-to-prove"
  | "bikzg-to-prove"
  | "prove-to-result";

export const activeSectionAtom = atom<Section>("none");

export const provingIsDoneAtom = atom<boolean>(false);
export const provingResultAtom = atom<boolean>(false);
export const pendingAnimationAtom = atom<boolean>(false);
export const resetAnimationAtom = atom<boolean>(false);
