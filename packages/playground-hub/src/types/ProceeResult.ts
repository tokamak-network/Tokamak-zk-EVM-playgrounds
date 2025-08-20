// Type definitions for the API data structures

export interface StorageItem {
  contractAddress: string;
  key: string;
  valueDecimal: string;
  valueHex: string;
}

export interface StorageStoreItem {
  contractAddress: string;
  key: string;
  value: string;
  valueHex: string;
}

export interface LogItem {
  topics: string[];
  valueDec: string;
  valueHex: string;
}

export interface ServerData {
  permutation: string | null;
  placementInstance: string | null;
}
