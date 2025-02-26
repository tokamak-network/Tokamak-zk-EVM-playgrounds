import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { SynthesizerAdapter } from '@tokamak-zk-evm/synthesizer';

// Define placement indices based on @tokamak-zk-evm/synthesizer/src/tokamak/constant/constants.ts
const STORAGE_IN_PLACEMENT_INDEX = 0;    // Storage load operations
const STORAGE_OUT_PLACEMENT_INDEX = 1;   // Storage store operations
const RETURN_PLACEMENT_INDEX = 3;        // Log operations

// Adjust the import path if needed—here we assume your utils are compiled from your Next.js app
import { fetchTransactionBytecode } from '../app/utils/etherscanApi.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/parseTransaction', async (req: Request, res: Response) => {
  try {
    const { txId } = req.body;
    if (!txId) {
      return res.status(400).json({ ok: false, error: 'No transaction ID provided' });
    }

    console.log('Processing transaction:', txId);

    // 1) Fetch bytecode, "from", and "to" from Etherscan
    const { bytecode, from, to } = await fetchTransactionBytecode(txId);
    console.log('Fetched transaction data:', { bytecode: bytecode.slice(0, 50) + '...', from, to });

    if (!bytecode || !from || !to) {
      throw new Error('Invalid transaction data from Etherscan');
    }

    // 2) Create SynthesizerAdapter & parse the transaction
    const adapter = new SynthesizerAdapter();
    console.log('Created SynthesizerAdapter, parsing transaction...');
    
    const { executionResult, permutation, placementInstance } = await adapter.parseTransaction({
      contractAddr: to,    // Must be TON, USDT, or USDC
      calldata: bytecode,  // The transaction input ("input" field)
      sender: from,
    });

    console.log('Transaction parsed, checking placements...');
    console.log('ExecutionResult:', {
      hasRunState: !!executionResult.runState,
      hasSynthesizer: !!executionResult.runState?.synthesizer,
      hasPlacements: !!executionResult.runState?.synthesizer?.placements,
    });

    if (!executionResult.runState?.synthesizer?.placements) {
      throw new Error('No placements generated by the synthesizer.');
    }

    // 3) Extract logs/storage from the synthesizer placements
    const placementsMap = executionResult.runState.synthesizer.placements;
    console.log('Placements map size:', placementsMap.size);
    console.log('Available placement indices:', Array.from(placementsMap.keys()));

    // Log the actual values of the placement indices
    console.log('Placement indices:', {
      STORAGE_IN_PLACEMENT_INDEX,
      RETURN_PLACEMENT_INDEX,
      STORAGE_OUT_PLACEMENT_INDEX
    });

    const storageLoadPlacement = placementsMap.get(STORAGE_IN_PLACEMENT_INDEX);
    const logsPlacement = placementsMap.get(RETURN_PLACEMENT_INDEX);
    const storageStorePlacement = placementsMap.get(STORAGE_OUT_PLACEMENT_INDEX);

    console.log('Placement data found:', {
      hasStorageLoad: !!storageLoadPlacement,
      hasLogs: !!logsPlacement,
      hasStorageStore: !!storageStorePlacement
    });

    const storageLoad = storageLoadPlacement?.inPts || [];
    const storageStore = storageStorePlacement?.outPts || [];
    const _logsData = logsPlacement?.outPts || [];

    console.log('Raw data counts:', {
      storageLoadCount: storageLoad.length,
      storageStoreCount: storageStore.length,
      logsDataCount: _logsData.length
    });

    // Parse logs with more detailed error handling
    const logs: Array<{ topics: string[]; valueDec: string; valueHex: string }> = [];
    let prevIdx = -1;
    for (const _logData of _logsData) {
      try {
        const idx = _logData.pairedInputWireIndices?.[0] ?? -1;
        if (idx !== prevIdx) {
          logs.push({ 
            topics: [], 
            valueDec: (_logData.value?.toString() || '0'), 
            valueHex: _logData.valueHex || '0x0'
          });
        } else if (idx >= 0 && logs[idx]) {
          logs[idx].topics.push(_logData.valueHex || '0x0');
        }
        prevIdx = idx;
      } catch (error) {
        console.error('Error processing log data:', error, _logData);
      }
    }

    // Helper function to safely convert BigInts to strings
    const convertBigIntsToStrings = (obj: any) => {
      try {
        return JSON.parse(JSON.stringify(obj, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
      } catch (error) {
        console.error('Error converting BigInts to strings:', error);
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

    console.log('Transformed data counts:', {
      logsCount: transformedData.logs.length,
      storageLoadCount: transformedData.storageLoad.length,
      storageStoreCount: transformedData.storageStore.length,
    });

    // 4) Return the final results
    res.json({
      ok: true,
      data: transformedData
    });
  } catch (error: any) {
    console.error('Error in /api/parseTransaction:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(3002, () => {
  console.log('Server running on port 3002');
});
