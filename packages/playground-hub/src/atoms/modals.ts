import { atom } from "jotai";

export type Modal = "none" | "transaction-input";

export const activeModalAtom = atom<Modal>("none");
