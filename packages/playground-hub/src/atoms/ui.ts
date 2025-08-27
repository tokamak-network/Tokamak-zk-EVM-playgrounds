import { atom } from "jotai";

export const isStartedAtom = atom<boolean>(false);
export const isErrorAtom = atom<boolean>(false);
export const isFirstTimeAtom = atom<boolean>(true);
export const showProcessResultModalAtom = atom<boolean>(false);
export const loadingStageAtom = atom<number>(1); // Loading stage for binary execution progress
