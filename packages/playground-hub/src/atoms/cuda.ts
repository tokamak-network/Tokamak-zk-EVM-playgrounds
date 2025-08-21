import { atom } from "jotai";

export interface CudaStatus {
  isLoading: boolean;
  isFullySupported: boolean;
  gpu: {
    isAvailable: boolean;
    gpuInfo?: string;
    error?: string;
  };
  compiler: {
    isAvailable: boolean;
    version?: string;
    error?: string;
  };
  error?: string;
}

const initialCudaStatus: CudaStatus = {
  isLoading: true,
  isFullySupported: false,
  gpu: { isAvailable: false },
  compiler: { isAvailable: false },
};

// Global CUDA status atom
export const cudaStatusAtom = atom<CudaStatus>(initialCudaStatus);

// Atom for tracking if CUDA check has been initialized
export const cudaInitializedAtom = atom<boolean>(false);
