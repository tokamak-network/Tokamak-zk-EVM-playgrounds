/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@tokamak-zk-evm/synthesizer" {
  export interface PlacementIndices {
    storageIn: number;
    storageOut: number;
    return: number;
  }

  export interface Placement {
    name: string;
    usage: string;
    inPts: any[];
    outPts: any[];
  }

  export interface ExecutionResult {
    runState?: {
      synthesizer?: {
        placements?: Map<number, Placement>;
      };
    };
  }

  export interface ParseTransactionParams {
    txHash: string;
    contractAddr: string;
    calldata: string;
    sender: string;
  }

  export interface ParseTransactionResult {
    executionResult: ExecutionResult;
    permutation: any;
    placementInstance: any;
  }

  export class SynthesizerAdapter {
    placementIndices: PlacementIndices;

    constructor(rpcUrl?: string, enableLogs?: boolean);

    parseTransaction(
      params: ParseTransactionParams
    ): Promise<ParseTransactionResult>;
  }
}
