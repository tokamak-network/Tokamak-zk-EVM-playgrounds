import { atom } from "jotai";

export type Modal = "none" | "transaction-input" | "error";

export const activeModalAtom = atom<Modal>("none");
