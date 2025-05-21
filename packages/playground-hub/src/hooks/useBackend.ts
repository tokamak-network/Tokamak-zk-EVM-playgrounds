import { useCallback } from "react";
import { useDocker } from "./useDocker";
export const useProve = () => {
  const { executeCommand } = useDocker();

  const prove = useCallback(
    async (containerId: string) => {
      try {
        console.log("prove", containerId);
        const result = await executeCommand(containerId, [
          "bash",
          "-c",
          `cd /app/backend && 
        cargo run -p protocol-script`,
        ]);
        console.log("result", result);
        return result;
      } catch (error) {
        console.error("도커 명령 실행 실패:", error);
        return null;
      }
    },
    [executeCommand]
  );

  return { prove };
};
