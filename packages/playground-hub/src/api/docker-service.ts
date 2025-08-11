// src/docker-service.ts
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

// Updated DockerImage interface
export interface DockerImage {
  Repository: string;
  Tag: string;
  ID: string;
  Size: string;
  // Add any other fields you might get from `docker images --format "{{json .}}"`
}

// Updated DockerContainer interface
export interface DockerContainer {
  ID: string;
  Image: string; // Image name or ID the container was created from
  Names: string;
  Status: string;
  // Add any other fields you might get from `docker ps --format "{{json .}}"`
}

export interface DockerStatusResult {
  isInstalled: boolean;
  isRunning: boolean; // Docker Daemon running status
  imageExists: boolean;
  isContainerFromImageRunning: boolean;
}

// Docker 상태 체크 함수 (Enhanced)
export async function checkDockerStatus(
  imageNameToCheck?: string
): Promise<DockerStatusResult> {
  let isInstalled = false;
  let isDaemonRunning = false;
  let imageExists = false;
  let isContainerFromImageRunning = false;

  // Step 1: Check if Docker is installed (enhanced Windows support)
  try {
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // 윈도우에서 더 강력한 도커 탐지
      try {
        // 방법 1: 표준 PATH에서 찾기
        await execAsync("where docker", { timeout: 10000 });
        isInstalled = true;
      } catch (pathError) {
        console.log(
          "Docker not found in PATH, trying alternative locations..."
        );

        // 방법 2: 일반적인 Docker Desktop 설치 경로 확인
        const commonPaths = [
          "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe",
          "C:\\Program Files (x86)\\Docker\\Docker\\resources\\bin\\docker.exe",
          "%PROGRAMFILES%\\Docker\\Docker\\resources\\bin\\docker.exe",
          "%PROGRAMFILES(X86)%\\Docker\\Docker\\resources\\bin\\docker.exe",
        ];

        // Docker Desktop 주요 파일들도 확인
        const dockerDesktopPaths = [
          "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
          "C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe",
          "%PROGRAMFILES%\\Docker\\Docker\\Docker Desktop.exe",
          "%PROGRAMFILES(X86)%\\Docker\\Docker\\Docker Desktop.exe",
        ];

        // docker.exe 파일 확인
        for (const dockerPath of commonPaths) {
          try {
            // 환경변수 확장된 경로로 확인
            const expandedPath = dockerPath.replace(
              /%([^%]+)%/g,
              (_, env) => process.env[env] || ""
            );
            // 파일 존재 여부만 확인 (데몬 실행 상태와 무관)
            if (fs.existsSync(expandedPath)) {
              isInstalled = true;
              break;
            }
          } catch (pathCheckError) {
            // 이 경로에서는 찾지 못함, 다음 경로 시도
            continue;
          }
        }

        // docker.exe를 찾지 못했다면 Docker Desktop.exe 확인
        if (!isInstalled) {
          for (const desktopPath of dockerDesktopPaths) {
            try {
              const expandedPath = desktopPath.replace(
                /%([^%]+)%/g,
                (_, env) => process.env[env] || ""
              );
              if (fs.existsSync(expandedPath)) {
                isInstalled = true;
                break;
              }
            } catch (pathCheckError) {
              continue;
            }
          }
        }

        // 방법 3: Docker Desktop 서비스 확인
        if (!isInstalled) {
          try {
            const { stdout } = await execAsync(
              'sc query "com.docker.service"',
              { timeout: 5000 }
            );
            if (
              stdout.toLowerCase().includes("running") ||
              stdout.toLowerCase().includes("stopped")
            ) {
              isInstalled = true;
            }
          } catch (serviceError) {
            console.log("Docker Desktop service not found via sc query");
          }
        }

        // 방법 4: 레지스트리 확인 (Docker Desktop 설치 확인)
        if (!isInstalled) {
          try {
            await execAsync(
              'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Docker Inc." /s',
              { timeout: 5000 }
            );
            isInstalled = true;
          } catch (regError) {
            console.log("Docker not found in registry");
          }
        }

        if (!isInstalled) {
          throw new Error("Docker not found in any known location");
        }
      }
    } else {
      // 유닉스 계열에서는 기존 방식 사용
      await execAsync("which docker", { timeout: 10000 });
      isInstalled = true;
    }
  } catch (error) {
    // Only log on first check or when status changes
    return {
      isInstalled: false,
      isRunning: false,
      imageExists,
      isContainerFromImageRunning,
    };
  }

  // Step 2: Check if Docker daemon is running (enhanced with longer timeout and better error handling)
  try {
    // 윈도우에서 더 긴 타임아웃 적용
    const timeout = process.platform === "win32" ? 15000 : 10000;

    // 방법 1: docker version (가장 가벼운 명령어)
    await execAsync("docker version --format json", { timeout });
    isDaemonRunning = true;
  } catch (versionError) {
    // 방법 2: docker info 시도 (더 상세한 정보)
    try {
      await execAsync("docker info", {
        timeout: process.platform === "win32" ? 20000 : 15000,
      });
      isDaemonRunning = true;
    } catch (infoError) {
      // 방법 3: docker ps 시도 (가장 기본적인 명령어)
      try {
        await execAsync("docker ps", {
          timeout: process.platform === "win32" ? 15000 : 10000,
        });
        isDaemonRunning = true;
      } catch (psError) {
        // 윈도우에서 추가 진단 정보 제공
        if (process.platform === "win32") {
          try {
            // Docker Desktop 프로세스 확인
            const { stdout } = await execAsync(
              'tasklist /FI "IMAGENAME eq Docker Desktop.exe"',
              { timeout: 5000 }
            );
            if (stdout.includes("Docker Desktop.exe")) {
              console.log(
                "Docker Desktop process is running, but daemon may be starting up"
              );
              isDaemonRunning = false;
            } else {
              console.log("Docker Desktop process not found");
            }
          } catch (tasklistError) {
            console.log(
              "Could not check Docker Desktop process:",
              tasklistError.message
            );
          }
        }

        isDaemonRunning = false;
        return {
          isInstalled,
          isRunning: false,
          imageExists,
          isContainerFromImageRunning,
        };
      }
    }
  }

  // 나머지 이미지 존재 여부 확인 로직은 동일
  if (isDaemonRunning && imageNameToCheck) {
    try {
      const allImages = await getDockerImages();

      const trimmedImageNameToCheck = imageNameToCheck.trim();
      const [repo, tag = "latest"] = trimmedImageNameToCheck.includes(":")
        ? trimmedImageNameToCheck.split(":")
        : [trimmedImageNameToCheck, "latest"];

      // 정확한 레포지토리:태그 매치 확인
      imageExists = allImages.some((img) => {
        const repoMatch = img.Repository === repo;
        const tagMatch = img.Tag === tag;
        return repoMatch && tagMatch;
      });

      // 태그가 없는 이름으로 검색된 경우, 해당 레포지토리의 모든 태그 확인
      if (!imageExists && !trimmedImageNameToCheck.includes(":")) {
        imageExists = allImages.some((img) => img.Repository === repo);
      }

      // 이미지 ID로 검색 (백업 옵션)
      if (
        !imageExists &&
        !trimmedImageNameToCheck.includes("/") &&
        !trimmedImageNameToCheck.includes(":")
      ) {
        imageExists = allImages.some(
          (img) =>
            img.ID === trimmedImageNameToCheck ||
            img.ID.startsWith(trimmedImageNameToCheck) ||
            (img.ID.startsWith("sha256:") &&
              img.ID.substring("sha256:".length).startsWith(
                trimmedImageNameToCheck
              ))
        );
      }

      if (imageExists) {
        const runningContainers = await getDockerContainers();
        const targetImageDetails = allImages.find(
          (img) =>
            (img.Repository === repo && img.Tag === tag) ||
            img.ID.startsWith(trimmedImageNameToCheck)
        );

        if (targetImageDetails) {
          isContainerFromImageRunning = runningContainers.some((cont) => {
            const containerImageName = cont.Image;
            if (containerImageName === imageNameToCheck) return true;
            if (
              containerImageName === targetImageDetails.Repository &&
              targetImageDetails.Tag === "latest"
            )
              return true;
            if (
              containerImageName === targetImageDetails.Repository &&
              containerImageName === targetImageDetails.Tag
            )
              return true;
            if (containerImageName === targetImageDetails.ID) return true;
            if (
              targetImageDetails.ID &&
              targetImageDetails.ID.startsWith(containerImageName)
            )
              return true;
            if (
              targetImageDetails.ID &&
              containerImageName.startsWith(
                targetImageDetails.ID.substring(0, 12)
              )
            )
              return true;

            return false;
          });
        }
      }
    } catch (imageCheckError) {
      console.log("Error checking images:", imageCheckError.message);
      imageExists = false;
      isContainerFromImageRunning = false;
    }
  }

  return {
    isInstalled,
    isRunning: isDaemonRunning,
    imageExists,
    isContainerFromImageRunning,
  };
}

// Docker 이미지 목록 가져오기 (Updated)
export async function getDockerImages(): Promise<DockerImage[]> {
  try {
    const { stdout } = await execAsync('docker images --format "{{json .}}"');
    const images: DockerImage[] = stdout
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line) as DockerImage);
    return images;
  } catch (error) {
    console.error(`Error getting Docker images: ${error.message}`);
    throw error; // Re-throw to be handled by caller
  }
}

// Docker 컨테이너 실행 (Original - assuming it's fine, but note the interface change)
// Ensure this function works with the new DockerContainer interface if it creates one.
// For now, we assume it correctly fetches details after running.
export async function runDockerContainer(
  imageName: string,
  options: string[] = [],
  containerName?: string
): Promise<DockerContainer> {
  // Return type is now the updated DockerContainer
  return new Promise((resolve, reject) => {
    const args = ["run", "-d"];
    if (containerName) {
      args.push("--name", containerName);
    }
    args.push(...options, imageName);
    const dockerProcess = exec(`docker ${args.join(" ")}`); // Using exec for consistency, spawn is also fine

    let containerId = "";

    dockerProcess.stdout.on("data", (data) => {
      // `docker run -d` outputs the container ID
      containerId = data.toString().trim();
    });

    dockerProcess.stderr.on("data", (data) => {
      // Stderr from `docker run` might not always be a fatal error for getting ID
      console.warn(`Docker run stderr: ${data.toString()}`);
    });

    dockerProcess.on("close", async (code) => {
      if (containerId) {
        // If we got an ID, try to get its info
        try {
          // Fetch the specific container's details using the new getDockerContainers format logic
          const { stdout: psOutput } = await execAsync(
            `docker ps -f id=${containerId} --format "{{json .}}"`
          );
          const containerInfo = JSON.parse(psOutput.trim()) as DockerContainer; // Assuming single line JSON
          resolve(containerInfo);
        } catch (getInfoError) {
          console.error(
            `Failed to get container info for ${containerId}:`,
            getInfoError
          );
          // Even if getting full info fails, if run seemed to succeed (code 0 or we got an ID),
          // we might resolve with partial info or a specific state.
          // For now, rejecting if info fetch fails.
          reject(
            new Error(
              `Successfully ran container ${containerId} but failed to fetch its details: ${getInfoError.message}`
            )
          );
        }
      } else if (code !== 0) {
        reject(
          new Error(
            `Failed to run Docker container ${imageName}. Exit code: ${code}`
          )
        );
      } else {
        // This case (code 0 but no containerId) should be rare for `docker run -d`
        reject(
          new Error(
            `Docker run for ${imageName} completed with code 0 but no container ID was captured.`
          )
        );
      }
    });
  });
}

// 실행 중인 Docker 컨테이너 목록 가져오기 (Updated)
export async function getDockerContainers(): Promise<DockerContainer[]> {
  try {
    const { stdout } = await execAsync('docker ps --format "{{json .}}"');
    const containers: DockerContainer[] = stdout
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line) as DockerContainer);
    return containers;
  } catch (error) {
    console.error(`Error getting Docker containers: ${error.message}`);
    throw error; // Re-throw
  }
}

// 컨테이너 중지 (Updated with force option)
export async function stopDockerContainer(
  containerId: string,
  force: boolean = false
): Promise<boolean> {
  try {
    if (force) {
      // docker kill: 즉시 강제 종료 (SIGKILL)
      console.log(
        `🚀 Force killing container ${containerId} for faster shutdown`
      );
      await execAsync(`docker kill ${containerId}`);
    } else {
      // docker stop: 정상 종료 후 10초 후 강제 종료
      await execAsync(`docker stop ${containerId}`);
    }
    return true;
  } catch (error) {
    console.error(
      `Error ${force ? "killing" : "stopping"} container ${containerId}: ${error.message}`
    );
    throw error;
  }
}

// Docker 컨테이너에서 명령어 실행
export async function executeCommandInContainer(
  containerId: string,
  command: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["exec", containerId, ...command];

    const process = spawn("docker", args);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}

// Docker 컨테이너에서 명령어 실행 (실시간 스트리밍)
export async function executeCommandInContainerWithStreaming(
  containerId: string,
  command: string[],
  onData: (data: string, isError: boolean) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["exec", containerId, ...command];

    const process = spawn("docker", args);
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      const dataStr = data.toString();
      stdout += dataStr;
      onData(dataStr, false); // 실시간으로 데이터 전송
    });

    process.stderr.on("data", (data) => {
      const dataStr = data.toString();
      stderr += dataStr;
      onData(dataStr, true); // 에러 데이터도 실시간으로 전송
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    process.on("error", (error) => {
      reject(new Error(`Process error: ${error.message}`));
    });
  });
}

// Docker 컨테이너에서 대용량 파일 다운로드 (스트리밍)
export async function downloadLargeFileFromContainer(
  containerId: string,
  filePath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["exec", containerId, "cat", filePath];

    const process = spawn("docker", args);
    const chunks: Buffer[] = [];
    let stderr = "";

    process.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const content = Buffer.concat(chunks).toString("utf8");
          resolve(content);
        } catch (error) {
          reject(new Error(`Failed to process file content: ${error.message}`));
        }
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    process.on("error", (error) => {
      reject(new Error(`Process error: ${error.message}`));
    });
  });
}

// Docker 컨테이너에서 매우 큰 파일을 직접 로컬 파일로 스트리밍 다운로드
export async function streamLargeFileFromContainer(
  containerId: string,
  containerFilePath: string,
  localFilePath: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const args = ["exec", containerId, "cat", containerFilePath];

    const process = spawn("docker", args);
    const writeStream = fs.createWriteStream(localFilePath);
    let stderr = "";

    process.stdout.pipe(writeStream);

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("close", (code) => {
      writeStream.end();
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    process.on("error", (error) => {
      writeStream.destroy();
      reject(new Error(`Process error: ${error.message}`));
    });

    writeStream.on("error", (error: Error) => {
      reject(new Error(`Write stream error: ${error.message}`));
    });
  });
}
