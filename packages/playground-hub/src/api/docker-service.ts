// src/docker-service.ts
import { exec, spawn } from "child_process";
import { promisify } from "util";

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

  try {
    const { stdout: dockerPath } = await execAsync("which docker");
    await execAsync("docker info");
    isInstalled = true;
    isDaemonRunning = true;
  } catch (error) {
    // Check if it's a "command not found" type of error for isInstalled
    // This is a basic check; more robust checks might be needed for different OS/shells
    if (
      error.message &&
      (error.message.includes("command not found") ||
        error.message.includes("not recognized"))
    ) {
      isInstalled = false;
    } else {
      // Assume installed, but daemon not running or other error
      isInstalled = true; // Or false if 'docker info' failing always means not installed in your context
    }
    isDaemonRunning = false;

    // If daemon isn't running or Docker isn't installed, no need to check image/container
    return {
      isInstalled,
      isRunning: isDaemonRunning,
      imageExists,
      isContainerFromImageRunning,
    };
  }

  if (isDaemonRunning && imageNameToCheck) {
    try {
      const allImages = await getDockerImages();

      const trimmedImageNameToCheck = imageNameToCheck.trim(); // Trim input

      const [repo, tag = "latest"] = trimmedImageNameToCheck.includes(":")
        ? trimmedImageNameToCheck.split(":")
        : [trimmedImageNameToCheck, "latest"];

      // Check if the image exists by name:tag
      imageExists = allImages.some((img) => {
        const repoMatch = img.Repository === repo;
        const tagMatch = img.Tag === tag;
        return repoMatch && tagMatch;
      });

      // If not found by name:tag, and imageNameToCheck does not contain '/', try checking if it's an ID
      if (
        !imageExists &&
        !trimmedImageNameToCheck.includes("/") &&
        !trimmedImageNameToCheck.includes(":")
      ) {
        // Assuming if no '/' and no ':', it *could* be an ID or a simple name (already checked for simpleName:latest)
        // This ID check is more for when currentDockerContainer.Image is an ID during polling

        imageExists = allImages.some(
          (img) =>
            img.ID === trimmedImageNameToCheck || // Exact full ID match (e.g., "sha256:...")
            img.ID.startsWith(trimmedImageNameToCheck) || // Starts with short ID (if trimmedImageNameToCheck is short)
            (img.ID.startsWith("sha256:") &&
              img.ID.substring("sha256:".length).startsWith(
                trimmedImageNameToCheck
              )) // Handle if trimmedImageNameToCheck is short ID without sha256: prefix
        );
      }

      if (imageExists) {
        const runningContainers = await getDockerContainers();
        const targetImageDetails = allImages.find(
          (img) =>
            (img.Repository === repo && img.Tag === tag) ||
            img.ID.startsWith(trimmedImageNameToCheck)
        ); // Find the image again for its details

        if (targetImageDetails) {
          isContainerFromImageRunning = runningContainers.some((cont) => {
            const containerImageName = cont.Image;
            if (containerImageName === imageNameToCheck) return true; // Exact original name passed
            if (
              containerImageName === targetImageDetails.Repository &&
              targetImageDetails.Tag === "latest"
            )
              return true;
            if (
              containerImageName === targetImageDetails.Repository &&
              containerImageName === targetImageDetails.Tag
            )
              return true; // if image is "foo:foo"
            if (containerImageName === targetImageDetails.ID) return true;
            if (
              targetImageDetails.ID &&
              targetImageDetails.ID.startsWith(containerImageName)
            )
              return true; // cont.Image is short ID
            if (
              targetImageDetails.ID &&
              containerImageName.startsWith(
                targetImageDetails.ID.substring(0, 12)
              )
            )
              return true;

            // If targetImageDetails were found by ID, repo/tag might not be set from imageNameToCheck directly
            // if (
            //   img.Repository === targetImageDetails.Repository &&
            //   img.Tag === targetImageDetails.Tag
            // ) {
            //   // Check against actual repo/tag of found image
            //   if (containerImageName === img.Repository) return true; // e.g. image is ubuntu:latest, container shows 'ubuntu'
            // }
            return false;
          });
        }
      }
    } catch {
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

// 컨테이너 중지 (Original)
export async function stopDockerContainer(
  containerId: string
): Promise<boolean> {
  try {
    await execAsync(`docker stop ${containerId}`);
    return true;
  } catch (error) {
    console.error(`Error stopping container ${containerId}: ${error.message}`);
    throw error;
  }
}

// Docker 컨테이너 내에서 명령어 실행
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
