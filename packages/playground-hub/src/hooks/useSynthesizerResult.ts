import { useState, useCallback, useEffect } from "react";
import { useAtomValue } from "jotai";
import { transactionHashAtom } from "../atoms/api";

// Types matching the SynthesizerResultModal requirements
export type StorageItem = {
  contractAddress?: string;
  key: string;
  valueDecimal?: string;
  valueHex: string;
};

export type LogItem = {
  topics?: string[];
  valueDec?: string;
  valueHex: string;
};

export type StorageStoreItem = {
  contractAddress?: string;
  key: string;
  value?: string;
  valueHex: string;
};

// Raw data types from synthesizer (before transformation)
type RawLogItem = {
  topics?: string[];
  valueDec?: string | number;
  valueHex?: string;
};

type RawStorageItem = {
  contractAddress?: string;
  key?: string;
  valueDecimal?: string | number;
  valueHex?: string;
};

type RawStorageStoreItem = {
  contractAddress?: string;
  key?: string;
  value?: string | number;
  valueHex?: string;
};

export type ServerData = {
  permutation?: string;
  placementInstance?: string;
};

export type SynthesizerResultData = {
  storageLoad: StorageItem[];
  placementLogs: LogItem[];
  storageStore: StorageStoreItem[];
  evmContractAddress: string;
  serverData: ServerData | null;
  isLoading: boolean;
  error: string | null;
};

export const useSynthesizerResult = (): SynthesizerResultData => {
  const transactionHash = useAtomValue(transactionHashAtom);

  const [data, setData] = useState<SynthesizerResultData>({
    storageLoad: [],
    placementLogs: [],
    storageStore: [],
    evmContractAddress: "",
    serverData: null,
    isLoading: false,
    error: null,
  });

  const fetchSynthesizerResult = useCallback(async () => {
    if (!transactionHash) {
      setData((prev) => ({
        ...prev,
        error: "Transaction hash not provided.",
        isLoading: false,
      }));
      return;
    }

    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log(
        "Fetching synthesizer result for transaction:",
        transactionHash
      );

      // Call synthesizer playground API to get analysis results
      console.log(
        "Calling synthesizer playground API for transaction:",
        transactionHash
      );

      const API_URL = "http://localhost:3002"; // synthesizer playground server
      const response = await fetch(`${API_URL}/api/parseTransaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId: transactionHash }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Server returned status ${response.status}`
        );
      }

      const apiResult = await response.json();
      console.log("API response:", apiResult);

      if (!apiResult.ok) {
        throw new Error(apiResult.error || "Unknown server error.");
      }

      console.log("Synthesizer playground API call completed successfully");

      // Use the data directly from the API response
      const {
        to,
        logs,
        storageLoad,
        storageStore,
        permutation,
        placementInstance,
      } = apiResult.data;

      console.log("API returned data:", {
        logsCount: logs?.length || 0,
        storageLoadCount: storageLoad?.length || 0,
        storageStoreCount: storageStore?.length || 0,
      });

      // The API already returns converted data, so we just need to apply our transformation logic
      const rawStorageLoad = storageLoad || [];
      const rawStorageStore = storageStore || [];
      const rawLogs = logs || [];

      // Apply the exact same transformation logic as PlaygroundClient.tsx
      // Transform logs data
      const transformedLogs =
        (rawLogs as RawLogItem[])?.map((log: RawLogItem) => {
          const topics = Array.isArray(log.topics) ? log.topics : [];
          return {
            topics: topics.map((topic: string) =>
              topic.startsWith("0x") ? topic : `0x${topic}`
            ),
            valueDec:
              typeof log.valueDec === "string"
                ? log.valueDec
                : String(log.valueDec || "0"),
            valueHex: log.valueHex?.startsWith("0x")
              ? log.valueHex
              : `0x${log.valueHex || "0"}`,
          };
        }) || [];

      // Transform storage load data
      const transformedStorageLoad =
        (rawStorageLoad as RawStorageItem[])?.map((item: RawStorageItem) => {
          const contractAddr = item.contractAddress || to || "";
          const key = item.key || "";
          const valueDecimal =
            typeof item.valueDecimal === "string"
              ? item.valueDecimal
              : String(item.valueDecimal || "0");
          const valueHex = item.valueHex || "";

          return {
            contractAddress: contractAddr.startsWith("0x")
              ? contractAddr
              : `0x${contractAddr}`,
            key: key.startsWith("0x") ? key : `0x${key}`,
            valueDecimal,
            valueHex: valueHex.startsWith("0x") ? valueHex : `0x${valueHex}`,
          };
        }) || [];

      // Transform storage store data
      const transformedStorageStore =
        (rawStorageStore as RawStorageStoreItem[])?.map(
          (item: RawStorageStoreItem) => {
            const contractAddr = item.contractAddress || to || "";
            const key = item.key || "";
            const value =
              typeof item.value === "string"
                ? item.value
                : String(item.value || "0");
            const valueHex = item.valueHex || "";

            return {
              contractAddress: contractAddr.startsWith("0x")
                ? contractAddr
                : `0x${contractAddr}`,
              key: key.startsWith("0x") ? key : `0x${key}`,
              value,
              valueHex: valueHex.startsWith("0x") ? valueHex : `0x${valueHex}`,
            };
          }
        ) || [];

      console.log("Transformed storageLoad:", transformedStorageLoad);
      console.log("Transformed logs:", transformedLogs);
      console.log("Transformed storageStore:", transformedStorageStore);

      // Set the transformed data to state exactly like PlaygroundClient.tsx
      const finalData: Omit<SynthesizerResultData, "isLoading" | "error"> = {
        storageLoad: transformedStorageLoad,
        placementLogs: transformedLogs,
        storageStore: transformedStorageStore,
        evmContractAddress: to ? (to.startsWith("0x") ? to : `0x${to}`) : "",
        serverData: {
          permutation: permutation ? JSON.stringify(permutation) : null,
          placementInstance: placementInstance
            ? JSON.stringify(placementInstance)
            : null,
        },
      };

      setData((prev) => ({
        ...prev,
        ...finalData,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching synthesizer result:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }, [transactionHash]);

  // Auto-fetch when transaction hash is available
  useEffect(() => {
    if (transactionHash) {
      fetchSynthesizerResult();
    }
  }, [transactionHash, fetchSynthesizerResult]);

  return {
    ...data,
    // Expose refetch function for manual refresh
    refetch: fetchSynthesizerResult,
  } as SynthesizerResultData & { refetch: () => Promise<void> };
};
