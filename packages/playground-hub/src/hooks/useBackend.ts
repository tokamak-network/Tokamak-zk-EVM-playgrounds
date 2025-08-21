import { useCallback } from "react";
import { useCuda } from "./useCuda";

export const useBackendCommand = () => {
  const { cudaStatus } = useCuda();

  const setup = useCallback(async () => {
    try {
      console.log("Backend setup initiated");

      // CUDA를 지원하지 않는 환경이면 성공으로 처리
      if (!cudaStatus.isFullySupported) {
        console.log("CUDA not available, skipping CUDA-dependent setup");
        return Promise.resolve(true);
      }

      // Binary service를 통해 setup 실행
      const result = await window.binaryService.executeSystemCommand([
        "bash",
        "-c",
        "cd packages/backend && cargo run -p trusted-setup",
      ]);
      console.log("Setup result:", result);
      return result;
    } catch (error) {
      throw new Error("Failed to execute setup command: " + error);
    }
  }, [cudaStatus.isFullySupported]);

  const preProcess = useCallback(async () => {
    try {
      console.log("Backend preProcess initiated");
      const result = await window.binaryService.executeSystemCommand([
        "bash",
        "-c",
        "cd packages/backend && cargo run -p preprocess",
      ]);
      console.log("PreProcess result:", result);
      return result;
    } catch (error) {
      console.log("PreProcess error:", error);
      throw new Error("Failed to execute preprocess command: " + error);
    }
  }, []);

  const prove = useCallback(async () => {
    try {
      console.log("Backend prove initiated");
      const result = await window.binaryService.executeSystemCommand([
        "bash",
        "-c",
        "cd packages/backend && cargo run -p prove",
      ]);
      console.log("Prove result:", result);
      return result;
    } catch (error) {
      console.log("Prove error:", error);
      throw new Error("Failed to execute prove command: " + error);
    }
  }, []);

  const synthesize = useCallback(async () => {
    try {
      console.log("Backend synthesize initiated");
      const result = await window.binaryService.executeSystemCommand([
        "bash",
        "-c",
        "cd packages/backend && cargo run -p synthesize",
      ]);
      console.log("Synthesize result:", result);
      return result;
    } catch (error) {
      console.log("Synthesize error:", error);
      throw new Error("Failed to execute synthesize command: " + error);
    }
  }, []);

  return {
    setup,
    preProcess,
    prove,
    synthesize,
  };
};
