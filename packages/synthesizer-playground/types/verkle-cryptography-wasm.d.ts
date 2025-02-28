declare module 'verkle-cryptography-wasm' {
  export interface VerkleWasm {
    init(module?: WebAssembly.Module): Promise<void>;
    
    computeCommitment(input: Uint8Array): Uint8Array;
    verifyProof(proof: Uint8Array, commitment: Uint8Array): boolean;
    
  }
  
  const verkleWasm: VerkleWasm;
  export default verkleWasm;
}

declare module 'rust-verkle-wasm-bg.wasm' {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
} 