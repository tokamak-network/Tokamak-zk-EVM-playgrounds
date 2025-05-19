import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
export type ApiKey = string;
export type TransactionHash = string;

export const etherscanApiKeyAtom = atomWithStorage<ApiKey>(
  "etherscanApiKey",
  ""
);
export const transactionHashAtom = atom<TransactionHash>("");
