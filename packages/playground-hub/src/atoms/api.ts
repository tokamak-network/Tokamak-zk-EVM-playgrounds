import { atom } from "jotai";

export type TransactionHash = string;
export const transactionHashAtom = atom<TransactionHash>("");
