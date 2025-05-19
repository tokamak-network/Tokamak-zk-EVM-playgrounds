import { atom } from "jotai";

export type ApiKey = string;
export type TransactionHash = string;

export const etherscanApiKeyAtom = atom<ApiKey>("");
export const transactionHashAtom = atom<TransactionHash>("");
