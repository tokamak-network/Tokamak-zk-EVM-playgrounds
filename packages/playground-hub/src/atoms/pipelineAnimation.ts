import { atom } from "jotai";

export type Section =
  | "none"
  | "evm-to-qap"
  | "qap-to-setup-synthesizer"
  | "transaction-to-synthesizer"
  | "setup-to-prove"
  | "synthesizer-to-prove-bikzg"
  | "prove-to-verify"
  | "bikzg-to-verify"
  | "verify-to-result";

export const activeSectionAtom = atom<Section>("none");

export const provingIsDoneAtom = atom<boolean>(false);
export const provingResultAtom = atom<boolean>(false);
export const pendingAnimationAtom = atom<boolean>(false);
export const resetAnimationAtom = atom<boolean>(false);
export const resetAllAnimationAtom = atom<boolean>(false);
export const isAnimationRunningAtom = atom<boolean>(false);
