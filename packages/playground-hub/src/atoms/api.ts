import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
export type ApiKey = string;
export type TransactionHash = string;
export type TransactionBytecode = {
  bytecode: string;
  from: string;
  to: string;
};

export const etherscanApiKeyAtom = atomWithStorage<ApiKey>(
  "etherscanApiKey",
  ""
);
export const transactionHashAtom = atom<TransactionHash>("");
export const transactionBytecodeAtom = atom<TransactionBytecode>({
  bytecode: "",
  from: "",
  to: "",
});
