import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  session,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import started from "electron-squirrel-startup";
import {
  getDockerImages,
  runDockerContainer,
  getDockerContainers,
  stopDockerContainer,
  executeCommandInContainer,
  checkDockerStatus,
} from "./api/docker-service";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // devTools: false,
    },
  });
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // 메뉴 생성
  createMenu();
};

// 메뉴 생성 함수
function createMenu(): void {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    // macOS에서는 첫 번째 메뉴가 앱 이름
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ] as MenuItemConstructorOptions[],
          },
        ]
      : []),
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "delete" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Settings",
      submenu: [
        {
          label: "Etherscan API Key",
          click: openSettingsWindow,
        },
        { type: "separator" },
        {
          label: "Reset Paths",
          click: resetSettings,
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function resetSettings(): void {
  dialog.showMessageBox({
    type: "question",
    buttons: ["Yes", "No"],
    title: "Reset Paths",
    message: "경로 설정을 초기화하시겠습니까?",
  });
  // .then((result) => {
  //   if (result.response === 0) {
  //     store.store = {}; // 모든 설정 초기화
  //     // 또는 개별 속성 제거
  //     store.store.backendPath = undefined;
  //     store.store.qapCompilerPath = undefined;
  //     store.store.synthesizerPath = undefined;
  //   }
  // });
}

function openSettingsWindow(): void {
  const settingsWindow = new BrowserWindow({
    width: 430,
    height: 210,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#/settings`);
  } else {
    settingsWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      { hash: "settings" }
    );
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const result = await dialog.showMessageBox({
    type: "question",
    buttons: ["Allow", "Deny"],
    title: "Permission Request",
    message: "This application needs access to Docker. Do you allow it?",
  });

  if (result.response === 0) {
    // 사용자가 허용한 경우
    console.log("Permission granted.");
    createWindow();
  } else {
    // 사용자가 거부한 경우
    console.log("Permission denied.");
    // 필요한 경우 앱 종료 또는 기능 비활성화
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC 핸들러 등록
function setupIpcHandlers() {
  ipcMain.handle("get-docker-images", async () => {
    return await getDockerImages();
  });

  ipcMain.handle(
    "run-docker-container",
    async (event, imageName: string, options: string[] = []) => {
      return await runDockerContainer(imageName, options);
    }
  );

  ipcMain.handle("get-docker-containers", async () => {
    return await getDockerContainers();
  });

  ipcMain.handle(
    "stop-docker-container",
    async (event, containerId: string) => {
      return await stopDockerContainer(containerId);
    }
  );

  ipcMain.handle(
    "execute-command-in-container",
    async (event, containerId: string, command: string[]) => {
      return await executeCommandInContainer(containerId, command);
    }
  );

  let isShowingDialog = false;

  ipcMain.handle(
    "check-docker-status",
    async (event, imageNameToCheck?: string) => {
      const status = await checkDockerStatus(imageNameToCheck);

      if (!status.isInstalled && !isShowingDialog) {
        isShowingDialog = true;
        dialog
          .showMessageBox({
            type: "warning",
            title: "Docker Not Installed",
            message: "Docker is not installed on your system.",
            detail: "Please install Docker Desktop to use this application.",
            buttons: ["OK"],
            noLink: true,
            defaultId: 0,
            cancelId: 0,
          })
          .finally(() => {
            isShowingDialog = false;
          });
      } else if (status.isInstalled && !status.isRunning && !isShowingDialog) {
        isShowingDialog = true;
        const checkDockerRunning = async () => {
          const currentStatus = await checkDockerStatus();
          if (currentStatus.isInstalled && !currentStatus.isRunning) {
            dialog
              .showMessageBox({
                type: "warning",
                title: "Docker Not Running",
                message: "Docker is not running.",
                detail: "Please start Docker Desktop to use this application.",
                buttons: ["OK"],
                noLink: true,
                defaultId: 0,
                cancelId: 0,
              })
              .then(async () => {
                const updatedStatus = await checkDockerStatus();
                if (!updatedStatus.isRunning) {
                  if (isShowingDialog) checkDockerRunning();
                } else {
                  isShowingDialog = false;
                }
              })
              .catch(() => {
                isShowingDialog = false;
              });
          } else {
            isShowingDialog = false;
          }
        };
        checkDockerRunning();
      }

      return status;
    }
  );

  ipcMain.handle("close-settings-window", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  // --- 파일 다운로드 및 Docker 이미지 로드 핸들러 시작 ---
  ipcMain.handle(
    "download-and-load-docker-image",
    async (event, args: { url: string; filename?: string }) => {
      const { url, filename } = args;
      const webContents = event.sender;

      const dockerStatus = await checkDockerStatus();
      if (!dockerStatus.isInstalled || !dockerStatus.isRunning) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message:
            "Docker is not installed or not running. Please check Docker Desktop.",
          error: "Docker not ready",
        });
        return {
          success: false,
          error: "Docker is not installed or not running.",
        };
      }

      const defaultSavePath = path.join(
        app.getPath("downloads"),
        filename || "downloaded-image.tar"
      );
      const dialogResult = await dialog.showSaveDialog({
        title: "Save Docker Image TAR",
        defaultPath: defaultSavePath,
        filters: [{ name: "TAR Archives", extensions: ["tar"] }],
      });

      if (dialogResult.canceled || !dialogResult.filePath) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message: "Download canceled by user.",
        });
        return { success: false, error: "Download canceled by user." };
      }
      const filePath = dialogResult.filePath;

      try {
        webContents.send("docker-load-status", {
          stage: "downloading",
          message: "Starting download...",
        });
        await new Promise<void>((resolve, reject) => {
          session.defaultSession.removeAllListeners("will-download");

          session.defaultSession.once("will-download", (_e, item) => {
            item.setSavePath(filePath);

            item.on("updated", (_evt, state) => {
              if (state === "progressing") {
                if (item.getReceivedBytes() && item.getTotalBytes()) {
                  const progressData = {
                    percentage: Math.round(
                      (item.getReceivedBytes() / item.getTotalBytes()) * 100
                    ),
                    downloadedSize: item.getReceivedBytes(),
                    totalSize: item.getTotalBytes(),
                  };
                  webContents.send("download-progress", progressData);
                }
              }
            });

            item.on("done", (_evt, state) => {
              if (state === "completed") {
                webContents.send("download-progress", {
                  percentage: 100,
                  downloadedSize: item.getTotalBytes(),
                  totalSize: item.getTotalBytes(),
                });
                resolve();
              } else {
                reject(new Error(`Download failed: ${state}`));
              }
            });
          });
          session.defaultSession.downloadURL(url);
        });

        webContents.send("docker-load-status", {
          stage: "loading",
          message: "Download complete. Loading into Docker...",
        });

        return new Promise((resolveCmd, rejectCmd) => {
          const command = `docker load -i "${filePath}"`;
          exec(command, (error, stdout, stderr) => {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr)
                console.error(
                  `Failed to delete tar file: ${filePath}`,
                  unlinkErr
                );
            });

            if (error) {
              const errorMessage = `Docker load failed: ${error.message} (stderr: ${stderr || "N/A"})`;
              webContents.send("docker-load-status", {
                stage: "failed",
                message: errorMessage,
                error: error.message,
              });
              rejectCmd({ success: false, error: errorMessage });
              return;
            }
            const successMessage =
              stdout || "Docker image loaded successfully.";
            if (stderr && !stdout.includes(stderr.trim().split("\n")[0])) {
              console.warn(`Docker load stderr (may be warnings): ${stderr}`);
            }
            webContents.send("docker-load-status", {
              stage: "completed",
              message: successMessage,
            });
            resolveCmd({ success: true, message: successMessage });
          });
        });
      } catch (err) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message: err.message || "An unknown error occurred during download.",
          error: err.message,
        });
        return {
          success: false,
          error: err.message || "An unknown error occurred.",
        };
      }
    }
  );
  // --- 파일 다운로드 및 Docker 이미지 로드 핸들러 끝 ---

  ipcMain.on("request-exit-modal", () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const webContents = windows[0].webContents; // 첫 번째 창의 webContents를 가져옵니다.
      webContents.send("show-exit-modal"); // 렌더러 프로세스에 메시지 전송
    }
  });
}

app.whenReady().then(() => {
  // macOS에서만 dock 아이콘 설정
  if (process.platform === "darwin") {
    try {
      // 실제 소스 코드의 아이콘 파일 경로 (개발 모드 고려)
      const iconPath = path.resolve(
        process.cwd(),
        "src/assets/icons/app-icon.icns"
      );
      console.log("Setting dock icon:", iconPath);
      app.dock.setIcon(iconPath);
    } catch (error) {
      console.error("Failed to set dock icon:", error);
    }
  }
  setupIpcHandlers();
  process.env.PATH = `/usr/local/bin:${process.env.PATH}`;
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let isQuitting = false; // 애플리케이션 종료 진행 중 플래그

app.on("before-quit", async (event) => {
  if (isQuitting) {
    console.log(
      "[WARN] 'before-quit' 이벤트가 이미 처리 중이거나 완료되었습니다. 중복 호출을 무시합니다."
    );
    return; // 이미 종료 프로세스가 진행 중이면 아무것도 하지 않음
  }
  isQuitting = true; // 종료 프로세스 시작 플래그 설정
  console.log(
    "[INFO] 'before-quit' 이벤트 발생. 애플리케이션 종료를 준비합니다."
  );

  event.preventDefault(); // 애플리케이션이 즉시 종료되는 것을 방지

  ipcMain.emit("request-exit-modal");

  try {
    const containers = await getDockerContainers();
    console.log("[INFO] 현재 실행 중인 Docker 컨테이너 목록:", containers);

    if (containers && containers.length > 0) {
      const stopPromises = containers.map((container) => {
        console.log(`[INFO] Docker 컨테이너 중지 시도: ${container.ID}`);
        return stopDockerContainer(container.ID)
          .then(() =>
            console.log(`[SUCCESS] Docker 컨테이너 중지 완료: ${container.ID}`)
          )
          .catch((err) =>
            console.error(
              `[ERROR] Docker 컨테이너 ${container.ID} 중지 중 오류:`,
              err
            )
          );
      });

      await Promise.all(stopPromises);
      console.log(
        "[INFO] 모든 확인된 Docker 컨테이너의 중지 작업이 완료되었습니다."
      );
    } else {
      console.log("[INFO] 중지할 실행 중인 Docker 컨테이너가 없습니다.");
    }
  } catch (error) {
    console.error("[ERROR] Docker 컨테이너 중지 과정 중 예외 발생:", error);
  } finally {
    console.log(
      "[INFO] 모든 정리 작업 완료. 모든 창을 닫고 애플리케이션 실제 종료를 시도합니다."
    );
    BrowserWindow.getAllWindows().forEach((window) => {
      console.log(`[INFO] 창 강제 닫기 시도: ID ${window.id}`);
      window.destroy(); // 창을 강제로 닫음
    });

    // isQuitting 플래그가 true인 상태에서 app.quit()가 호출되어야 합니다.
    // 이 시점에서 추가적인 before-quit 이벤트가 발생해도 isQuitting 체크로 인해 무시됩니다.
    console.log("[INFO] app.quit() 호출 직전 (isQuitting: true).");
    app.quit();
  }
});
