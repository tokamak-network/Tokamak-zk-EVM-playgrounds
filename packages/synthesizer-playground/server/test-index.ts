import "dotenv/config";
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as fs from "fs";
import * as path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/parseTransaction", async (req: Request, res: Response) => {
  try {
    const { txId, testDataFile } = req.body;
    if (!txId) {
      return res
        .status(400)
        .json({ ok: false, error: "No transaction ID provided" });
    }

    console.log("Processing transaction (TEST MODE):", txId);

    // Read test data from JSON file
    const testDataPath =
      testDataFile || path.join(__dirname, "test-data", `${txId}.json`);
    if (!fs.existsSync(testDataPath)) {
      return res.status(400).json({
        ok: false,
        error: `Test data file not found: ${testDataPath}. Please provide placements, permutation, placementInstance, and placementIndices in the JSON file.`,
      });
    }

    console.log("Loading test data from:", testDataPath);
    const testData = JSON.parse(fs.readFileSync(testDataPath, "utf8"));

    // Validate test data structure
    if (
      !testData.placements ||
      !testData.permutation ||
      testData.placementInstance === undefined ||
      !testData.placementIndices
    ) {
      console.log("Validation failed:", {
        hasPlacements: !!testData.placements,
        hasPermutation: !!testData.permutation,
        hasPlacementInstance: testData.placementInstance !== undefined,
        hasPlacementIndices: !!testData.placementIndices,
        placementInstanceType: typeof testData.placementInstance,
        placementInstanceValue: testData.placementInstance,
      });
      return res.status(400).json({
        ok: false,
        error:
          "Test data must contain placements, permutation, placementInstance, and placementIndices",
      });
    }

    // Extract data from test file
    const { placements, permutation, placementInstance, placementIndices } =
      testData;
    const {
      from = "0x1234567890123456789012345678901234567890",
      to = "0x0987654321098765432109876543210987654321",
    } = testData;

    console.log("Loaded test data:", {
      from,
      to,
      hasPlacements: !!placements,
      hasPermutation: !!permutation,
      hasPlacementInstance: !!placementInstance,
    });

    console.log("Created SynthesizerAdapter for placement indices...");

    // Convert placements to Map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let placementsMap: Map<number, any>;
    if (Array.isArray(placements)) {
      // If it's an array of [key, value] pairs
      placementsMap = new Map(placements);
    } else if (typeof placements === "object" && placements !== null) {
      // If it's an object, convert to Map
      placementsMap = new Map();
      Object.entries(placements).forEach(([key, value]) => {
        placementsMap.set(parseInt(key), value);
      });
    } else {
      placementsMap = new Map();
    }

    console.log("Placements map created with size:", placementsMap.size);

    const { storageIn, returnIndex, storageOut } = placementIndices;

    console.log("Placement indices:", {
      storageIn,
      returnIndex,
      storageOut,
    });

    const storageLoadPlacement = placementsMap.get(storageIn);
    const logsPlacement = placementsMap.get(returnIndex);
    const storageStorePlacement = placementsMap.get(storageOut);

    console.log("Placement data found:", {
      hasStorageLoad: !!storageLoadPlacement,
      hasLogs: !!logsPlacement,
      hasStorageStore: !!storageStorePlacement,
    });

    const storageLoad = storageLoadPlacement?.inPts || [];
    const storageStore = storageStorePlacement?.outPts || [];
    const _logsData = logsPlacement?.outPts || [];

    console.log("Raw data counts:", {
      storageLoadCount: storageLoad.length,
      storageStoreCount: storageStore.length,
      logsDataCount: _logsData.length,
    });

    // Parse logs with detailed error handling
    const logs: Array<{
      topics: string[];
      valueDec: string;
      valueHex: string;
    }> = [];

    // Filter LOG entries from _logsData

    const logEntries = _logsData.filter(
      (item: any) => item.extDest === "LOG" || item.dest === "LOG"
    );

    console.log("Found log entries:", logEntries.length);

    if (logEntries.length > 0) {
      // Group by type (topic0, topic1, topic2, value0, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topicEntries = logEntries.filter((item: any) =>
        item.type?.startsWith("topic")
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valueEntries = logEntries.filter((item: any) =>
        item.type?.startsWith("value")
      );

      console.log(
        "Topic entries:",
        topicEntries.length,
        "Value entries:",
        valueEntries.length
      );

      if (valueEntries.length > 0) {
        // Create a log entry with topics and value
        // Group entries by type and take only the first occurrence of each type
        const typeGroups = new Map();

        // Process topic entries
        topicEntries.forEach((item: any) => {
          if (!typeGroups.has(item.type)) {
            typeGroups.set(item.type, item);
          }
        });

        // Process value entries
        valueEntries.forEach((item: any) => {
          if (!typeGroups.has(item.type)) {
            typeGroups.set(item.type, item);
          }
        });

        // Extract topics in order (topic0, topic1, topic2, etc.)
        const topics = [];
        for (let i = 0; i < 10; i++) {
          // Support up to topic9
          const topicKey = `topic${i}`;
          if (typeGroups.has(topicKey)) {
            const item = typeGroups.get(topicKey);
            // Remove 0x prefix if present and ensure proper format
            let hex = item.valueHex || "0x0";
            if (hex.startsWith("0x")) {
              hex = hex.slice(2);
            }
            topics.push(hex);
          }
        }

        // Get the first value0 entry
        const mainValue = typeGroups.get("value0") || valueEntries[0];

        logs.push({
          topics,
          valueDec: mainValue.value?.toString() || "0",
          valueHex: mainValue.valueHex || "0x0",
        });

        console.log("Created log entry:", {
          topicsCount: topics.length,
          valueDec: mainValue.value?.toString() || "0",
          valueHex: mainValue.valueHex || "0x0",
        });
      }
    }

    // Helper function to safely convert BigInts to strings
    const convertBigIntsToStrings = (obj: unknown): unknown => {
      try {
        return JSON.parse(
          JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );
      } catch (error) {
        console.error("Error converting BigInts to strings:", error);
        return [];
      }
    };

    // Save test results to JSON file
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `test_result_${txId}_${timestamp}.json`;

      const dataToSave = {
        timestamp: new Date().toISOString(),
        transactionId: txId,
        testMode: true,
        sourceFile: testDataPath,
        executionResult: {
          runState: {
            synthesizer: {
              placements: placementsMap
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (Array.from(placementsMap.entries()) as any).map(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ([key, value]: [any, any]) => [
                      key,
                      convertBigIntsToStrings(value),
                    ]
                  )
                : [],
            },
          },
        },
        permutation: convertBigIntsToStrings(permutation),
        placementInstance: convertBigIntsToStrings(placementInstance),
        placementIndices: {
          storageIn,
          return: returnIndex,
          storageOut,
        },
        processedResults: {
          logsCount: logs.length,
          storageLoadCount: storageLoad.length,
          storageStoreCount: storageStore.length,
        },
      };

      fs.writeFileSync(fileName, JSON.stringify(dataToSave, null, 2));
      console.log(`✅ Test results saved to ${fileName}`);
    } catch (error) {
      console.error("❌ Failed to save test results to JSON file:", error);
    }

    const transformedData = {
      from,
      to,
      logs,
      storageLoad: convertBigIntsToStrings(storageLoad),
      storageStore: convertBigIntsToStrings(storageStore),
      permutation: convertBigIntsToStrings(permutation),
      placementInstance: convertBigIntsToStrings(placementInstance),
    };

    console.log("Transformed data counts:", {
      logsCount: transformedData.logs.length,
      storageLoadCount: Array.isArray(transformedData.storageLoad)
        ? transformedData.storageLoad.length
        : 0,
      storageStoreCount: Array.isArray(transformedData.storageStore)
        ? transformedData.storageStore.length
        : 0,
    });

    // Return the same format as the original server
    res.json({
      ok: true,
      data: transformedData,
    });
  } catch (error: unknown) {
    console.error("Error in test /api/parseTransaction:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    res.status(500).json({
      ok: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    ok: true,
    mode: "test",
    message: "Test server is running",
    timestamp: new Date().toISOString(),
  });
});

// List available test data files
app.get("/api/test-data", (req: Request, res: Response) => {
  try {
    const testDataDir = path.join(__dirname, "test-data");
    if (!fs.existsSync(testDataDir)) {
      return res.json({
        ok: true,
        files: [],
        message:
          "No test-data directory found. Please create test-data folder and add JSON files.",
      });
    }

    const files = fs
      .readdirSync(testDataDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        name: file,
        path: path.join(testDataDir, file),
        size: fs.statSync(path.join(testDataDir, file)).size,
      }));

    res.json({
      ok: true,
      files,
      directory: testDataDir,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      ok: false,
      error: errorMessage,
    });
  }
});

const PORT = process.env.TEST_PORT || 3003;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(
    `📁 Place your test JSON files in: ${path.join(__dirname, "test-data")}`
  );
  console.log(`🔍 Available endpoints:`);
  console.log(
    `   POST /api/parseTransaction - Process transaction with test data`
  );
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /api/test-data - List available test files`);
});
