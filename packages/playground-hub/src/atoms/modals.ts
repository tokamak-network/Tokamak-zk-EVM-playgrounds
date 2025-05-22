import { atom } from "jotai";

export type Modal = "none" | "transaction-input" | "error" | "docker-select";

export const activeModalAtom = atom<Modal>("none");
