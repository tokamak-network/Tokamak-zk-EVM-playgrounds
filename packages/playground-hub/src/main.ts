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
          label: "Environment Paths",
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
app.on("ready", createWindow);

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

  let isShowingDialog = false; // 전역 플래그 추가

  ipcMain.handle("check-docker-status", async () => {
    const status = await checkDockerStatus();

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
    }
    if (!status.isRunning && !isShowingDialog) {
      isShowingDialog = true;
      const checkDockerRunning = async () => {
        const currentStatus = await checkDockerStatus();
        if (!currentStatus.isRunning) {
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
            .then(() => {
              if (!currentStatus.isRunning) {
                checkDockerRunning();
              } else {
                isShowingDialog = false;
              }
            });
        } else {
          isShowingDialog = false;
        }
      };

      checkDockerRunning();
    }

    return status;
  });

  ipcMain.on("close-settings-window", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  // --- 파일 다운로드 및 Docker 이미지 로드 핸들러 시작 ---
  ipcMain.handle(
    "download-and-load-docker-image",
    async (event, args: { url: string; filename?: string }) => {
      const { url, filename } = args;
      const webContents = event.sender; // 진행률 및 상태 업데이트를 보낼 렌더러

      // 1. Docker 실행 상태 확인 (선택 사항이지만 권장)
      const dockerStatus = await checkDockerStatus();
      if (!dockerStatus.isInstalled || !dockerStatus.isRunning) {
        webContents.send("docker-load-status", {
          stage: "failed",
          message:
            "Docker is not installed or not running. Please check Docker Desktop.",
          error: "Docker not ready",
        });
        // checkDockerStatus 함수 내부에서 이미 dialog를 띄우므로, 여기서는 메시지만 전송
        return {
          success: false,
          error: "Docker is not installed or not running.",
        };
      }

      // 2. 사용자에게 저장 위치 물어보기 (또는 기본 경로 사용)
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

      // 3. Electron의 session.downloadURL을 사용하여 파일 다운로드
      try {
        webContents.send("docker-load-status", {
          stage: "downloading",
          message: "Starting download...",
        });
        await new Promise<void>((resolve, reject) => {
          // 이전 'will-download' 리스너가 있다면 제거 (중복 방지)
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
                  // 최종 진행률
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

        // 4. 다운로드 완료 후 Docker 이미지 로드
        webContents.send("docker-load-status", {
          stage: "loading",
          message: "Download complete. Loading into Docker...",
        });

        return new Promise((resolveCmd, rejectCmd) => {
          const command = `docker load -i "${filePath}"`;
          exec(command, (error, stdout, stderr) => {
            // 선택 사항: 로드 성공/실패 후 tar 파일 삭제
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
            // stderr에 내용이 있지만, 그것이 실제 에러가 아닌 경고나 정보일 수 있음.
            // stdout에 유의미한 성공 메시지가 있다면 성공으로 간주.
            const successMessage =
              stdout || "Docker image loaded successfully.";
            if (stderr && !stdout.includes(stderr.trim().split("\n")[0])) {
              // stderr가 있고, stdout에 포함된 내용이 아니라면 경고로 로깅
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
        // 다운로드 중 발생한 에러
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
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
