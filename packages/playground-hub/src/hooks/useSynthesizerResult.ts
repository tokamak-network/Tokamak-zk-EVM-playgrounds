import { useState, useEffect } from "react";

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
  const [data, setData] = useState<SynthesizerResultData>({
    storageLoad: [],
    placementLogs: [],
    storageStore: [],
    evmContractAddress: "",
    serverData: null,
    isLoading: true,
    error: null,
  });

  const fetchSynthesizerResult = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Replace with actual API calls to synthesizer backend
      // This simulates the data structure that would come from the synthesizer

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data that would come from synthesizer execution
      const mockResult: Omit<SynthesizerResultData, "isLoading" | "error"> = {
        storageLoad: [
          {
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            key: "abc123",
            valueDecimal: "1000",
            valueHex: "3e8",
          },
          {
            contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
            key: "def456",
            valueDecimal: "2000",
            valueHex: "7d0",
          },
        ],
        placementLogs: [
          {
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000a16e02e87b7454126e5e10d957a927a7f5b5d2be",
              "0x0000000000000000000000004b20993bc481177ec7e8f571cecae8a9e22c02db",
            ],
            valueDec: "1000000000000000000",
            valueHex: "de0b6b3a7640000",
          },
          {
            topics: [
              "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
              "0x000000000000000000000000a16e02e87b7454126e5e10d957a927a7f5b5d2be",
              "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
            ],
            valueDec:
              "115792089237316195423570985008687907853269984665640564039457584007913129639935",
            valueHex:
              "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          },
          {
            topics: [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d",
              "0x000000000000000000000000a16e02e87b7454126e5e10d957a927a7f5b5d2be",
            ],
            valueDec: "500000000000000000",
            valueHex: "6f05b59d3b20000",
          },
        ],
        storageStore: [
          {
            contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
            key: "ghi789",
            value: "3000",
            valueHex: "bb8",
          },
          {
            contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
            key: "jkl012",
            value: "4000",
            valueHex: "fa0",
          },
        ],
        evmContractAddress: "0x1234567890abcdef1234567890abcdef12345678",
        serverData: {
          permutation: JSON.stringify(
            {
              circuit: "synthesizer_circuit",
              constraints: 1000000,
              variables: 500000,
              publicInputs: ["0x123", "0x456"],
              proof: "0xabcdef...",
            },
            null,
            2
          ),
          placementInstance: JSON.stringify(
            {
              instance: "placement_data",
              storageAccesses: 150,
              logEvents: 25,
              contractCalls: 8,
              gasUsed: "21000",
            },
            null,
            2
          ),
        },
      };

      setData((prev) => ({
        ...prev,
        ...mockResult,
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
  };

  useEffect(() => {
    fetchSynthesizerResult();
  }, []);

  return data;
};
