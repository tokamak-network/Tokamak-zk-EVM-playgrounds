import { useState, useEffect, useCallback } from "react";
import { useDocker } from "./useDocker";

export type LogItem = {
  topics?: string[];
  valueDec?: string;
  valueHex: string;
};

export type LogEntry = {
  extDest: string;
  key: string;
  type: string;
  source: string;
  wireIndex: number;
  sourceSize: number;
  valueHex: string;
};

export type ProcessedLogCategory = {
  type: string;
  valueHex: string;
};

export type LogGroup = {
  key: string;
  categories: {
    [type: string]: ProcessedLogCategory;
  };
};

export type SynthesizerResultData = {
  logs: LogItem[];
  instanceData: Record<string, unknown> | null;
  logEntries: LogEntry[];
  logGroups: LogGroup[];
  isLoading: boolean;
  error: string | null;
};

export const useSynthesizerResult = (): SynthesizerResultData & {
  refetchInstance: () => Promise<void>;
} => {
  const { executeCommand, currentDockerContainer } = useDocker();

  const [data, setData] = useState<SynthesizerResultData>({
    logs: [],
    instanceData: null,
    logEntries: [],
    logGroups: [],
    isLoading: false,
    error: null,
  });

  const fetchInstanceData = useCallback(async () => {
    if (!currentDockerContainer?.ID) {
      console.log("❌ Docker container not found");
      setData((prev) => ({
        ...prev,
        error: "Docker container not found. Please start the container first.",
        isLoading: false,
      }));
      return;
    }

    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log("🔍 Fetching instance.json from Docker container...");

      // First, check the file structure in the container
      const lsResult = await executeCommand(currentDockerContainer.ID, [
        "bash",
        "-c",
        `ls -la packages/frontend/synthesizer/examples/outputs/`,
      ]);

      console.log("📁 Directory listing:", lsResult);

      // Execute command to read the instance.json file
      const result = await executeCommand(currentDockerContainer.ID, [
        "bash",
        "-c",
        `cat packages/frontend/synthesizer/examples/outputs/instance.json`,
      ]);

      console.log("📄 Instance.json content length:", result.length);
      console.log(
        "📄 Instance.json content preview:",
        result.substring(0, 200)
      );

      // Parse the JSON content
      let instanceData;
      try {
        instanceData = JSON.parse(result);
        console.log("✅ Successfully parsed instance.json");
      } catch (parseError) {
        console.error("❌ Failed to parse instance.json:", parseError);
        throw new Error("Invalid JSON format in instance.json");
      }

      // Extract log entries from privateOutputBuffer.outPts
      const logEntries: LogEntry[] = [];

      console.log("🔍 Checking instanceData structure:", {
        hasInstanceData: !!instanceData,
        hasPrivateOutputBuffer: !!instanceData?.privateOutputBuffer,
        hasOutPts: !!instanceData?.privateOutputBuffer?.outPts,
        outPtsLength: instanceData?.privateOutputBuffer?.outPts?.length || 0,
      });

      if (instanceData?.privateOutputBuffer?.outPts) {
        const outPts = instanceData.privateOutputBuffer.outPts;
        console.log("📊 Total outPts entries:", outPts.length);

        // Filter entries where extDest is "LOG"
        for (const entry of outPts) {
          console.log("🔍 Checking entry:", {
            extDest: entry.extDest,
            key: entry.key,
            type: entry.type,
            wireIndex: entry.wireIndex,
          });

          if (entry.extDest === "LOG") {
            logEntries.push({
              extDest: entry.extDest,
              key: entry.key,
              type: entry.type,
              source: entry.source,
              wireIndex: entry.wireIndex,
              sourceSize: entry.sourceSize,
              valueHex: entry.valueHex,
            });
          }
        }
      }

      console.log("✅ Filtered LOG entries count:", logEntries.length);
      console.log("📋 LOG entries:", logEntries);

      // Group log entries by key, then by type
      const logGroups: LogGroup[] = [];
      const keyGroups: { [key: string]: LogEntry[] } = {};

      // First, group by key
      for (const entry of logEntries) {
        if (!keyGroups[entry.key]) {
          keyGroups[entry.key] = [];
        }
        keyGroups[entry.key].push(entry);
      }

      console.log("🔑 Key groups:", Object.keys(keyGroups));

      // Then, group by type within each key group and process
      for (const [key, entries] of Object.entries(keyGroups)) {
        console.log(
          `🔍 Processing key group "${key}" with ${entries.length} entries`
        );

        const typeGroups: { [type: string]: LogEntry[] } = {};

        // Group by type
        for (const entry of entries) {
          if (!typeGroups[entry.type]) {
            typeGroups[entry.type] = [];
          }
          typeGroups[entry.type].push(entry);
        }

        console.log(
          `📊 Type groups for key "${key}":`,
          Object.keys(typeGroups)
        );

        // Process each type group
        const categories: { [type: string]: ProcessedLogCategory } = {};

        for (const [type, typeEntries] of Object.entries(typeGroups)) {
          console.log(
            `🔧 Processing type "${type}" with ${typeEntries.length} entries`
          );

          // Sort by wireIndex in descending order (1번이 앞으로, 0번이 뒤로)
          const sortedEntries = typeEntries.sort(
            (a, b) => b.wireIndex - a.wireIndex
          );

          console.log(
            `📋 Sorted entries for type "${type}":`,
            sortedEntries.map((e) => ({
              wireIndex: e.wireIndex,
              valueHex: e.valueHex,
            }))
          );

          // Concatenate valueHex values
          const concatenatedValueHex = sortedEntries
            .map((entry) => entry.valueHex.replace("0x", ""))
            .join("");

          console.log(
            `🔗 Concatenated valueHex for type "${type}":`,
            concatenatedValueHex
          );

          categories[type] = {
            type,
            valueHex: `0x${concatenatedValueHex}`,
          };
        }

        logGroups.push({
          key,
          categories,
        });
      }

      console.log("✅ Final processed log groups:", logGroups);
      console.log("📊 Log groups count:", logGroups.length);

      setData((prev) => ({
        ...prev,
        instanceData,
        logEntries,
        logGroups,
        isLoading: false,
      }));
    } catch (error) {
      console.error("❌ Error fetching instance data:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }));
    }
  }, [currentDockerContainer, executeCommand]);

  // Auto-fetch instance data when container is available
  useEffect(() => {
    if (currentDockerContainer?.ID) {
      fetchInstanceData();
    }
  }, [currentDockerContainer?.ID, fetchInstanceData]);

  return {
    ...data,
    // Expose refetch function for manual refresh
    refetchInstance: fetchInstanceData,
  } as SynthesizerResultData & {
    refetchInstance: () => Promise<void>;
  };
};
