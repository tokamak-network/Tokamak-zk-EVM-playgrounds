declare module '@tokamak-zk-evm/synthesizer' {
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
    
    constructor();
    
    parseTransaction(params: ParseTransactionParams): Promise<ParseTransactionResult>;
    
  }
} 