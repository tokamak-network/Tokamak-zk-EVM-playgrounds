import "dotenv/config";
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { SynthesizerAdapter } from "@tokamak-zk-evm/synthesizer";
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
        error: `Test data file not found: ${testDataPath}. Please provide executionResult, permutation, and placementInstance in the JSON file.`,
      });
    }

    console.log("Loading test data from:", testDataPath);
    const testData = JSON.parse(fs.readFileSync(testDataPath, "utf8"));

    // Validate test data structure
    if (
      !testData.executionResult ||
      !testData.permutation ||
      !testData.placementInstance
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Test data must contain executionResult, permutation, and placementInstance",
      });
    }

    // Extract data from test file
    const { executionResult, permutation, placementInstance } = testData;
    const {
      from = "0x1234567890123456789012345678901234567890",
      to = "0x0987654321098765432109876543210987654321",
    } = testData;

    console.log("Loaded test data:", {
      from,
      to,
      hasExecutionResult: !!executionResult,
      hasPermutation: !!permutation,
      hasPlacementInstance: !!placementInstance,
    });

    // Create SynthesizerAdapter to get placement indices
    const adapter = new SynthesizerAdapter();
    console.log("Created SynthesizerAdapter for placement indices...");

    // Check if executionResult has placements
    if (!executionResult.runState?.synthesizer?.placements) {
      throw new Error("No placements found in test data executionResult.");
    }

    // Convert placements array back to Map if needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let placementsMap: Map<number, any>;
    if (Array.isArray(executionResult.runState.synthesizer.placements)) {
      placementsMap = new Map(executionResult.runState.synthesizer.placements);
    } else {
      placementsMap = executionResult.runState.synthesizer.placements;
    }

    console.log("Placements map created with size:", placementsMap.size);

    // Get placement indices from the adapter
    const {
      storageIn,
      return: returnIndex,
      storageOut,
    } = adapter.placementIndices;

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
    let prevIdx = -1;
    for (const _logData of _logsData) {
      try {
        const idx = _logData.pairedInputWireIndices?.[0] ?? -1;
        if (idx !== prevIdx) {
          logs.push({
            topics: [],
            valueDec: _logData.value?.toString() || "0",
            valueHex: _logData.valueHex || "0x0",
          });
        } else if (idx >= 0 && logs[idx]) {
          logs[idx].topics.push(_logData.valueHex || "0x0");
        }
        prevIdx = idx;
      } catch (error) {
        console.error("Error processing log data:", error, _logData);
      }
    }

    // Helper function to safely convert BigInts to strings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertBigIntsToStrings = (obj: any): any => {
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

    const transformedData = {
      from,
      to,
      logs,
      storageLoad: convertBigIntsToStrings(storageLoad),
      storageStore: convertBigIntsToStrings(storageStore),
      permutation: convertBigIntsToStrings(permutation),
      placementInstance: convertBigIntsToStrings(placementInstance),
    };

    console.log("Final transformed data counts:", {
      logsCount: transformedData.logs.length,
      storageLoadCount: Array.isArray(transformedData.storageLoad)
        ? transformedData.storageLoad.length
        : 0,
      storageStoreCount: Array.isArray(transformedData.storageStore)
        ? transformedData.storageStore.length
        : 0,
    });

    // Return the final results
    res.json({
      ok: true,
      testMode: true,
      sourceFile: testDataPath,
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
