import { atom } from "jotai";

type ApiKey = string | null;
type TransactionHash = string | null;

export const etherscanApiKeyAtom = atom<ApiKey>(null);
export const transactionHashAtom = atom<TransactionHash>(null);
