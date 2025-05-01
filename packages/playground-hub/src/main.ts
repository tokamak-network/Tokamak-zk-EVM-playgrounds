import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { spawn } from "child_process";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
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
};

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

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Function to get all required paths
const getPaths = () => {
  // Distinguish between development and production mode
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    // In development mode, use relative paths from project root
    const appRoot = app.getAppPath();
    console.log("Application root:", appRoot);

    // Relative paths from project root to each directory
    const tokamakRoot = path.join("..", "Tokamak-zk-EVM");

    const backendPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "backend")
    );
    const qapCompilerPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "frontend", "qap-compiler")
    );
    const synthesizerPath = path.resolve(
      appRoot,
      path.join(tokamakRoot, "packages", "frontend", "synthesizer")
    );

    console.log("Development mode paths:");
    console.log("- Backend:", backendPath);
    console.log("- QAP Compiler:", qapCompilerPath);
    console.log("- Synthesizer:", synthesizerPath);

    return {
      backendPath,
      qapCompilerPath,
      synthesizerPath,
    };
  } else {
    // In production mode, use paths within the application resources directory
    const resourcesPath = process.resourcesPath;
    console.log("Resources path:", resourcesPath);

    // Paths within the resources directory
    const backendPath = path.join(resourcesPath, "backend");
    const qapCompilerPath = path.join(resourcesPath, "qap-compiler");
    const synthesizerPath = path.join(resourcesPath, "synthesizer");

    console.log("Production mode paths:");
    console.log("- Backend:", backendPath);
    console.log("- QAP Compiler:", qapCompilerPath);
    console.log("- Synthesizer:", synthesizerPath);

    return {
      backendPath,
      qapCompilerPath,
      synthesizerPath,
    };
  }
};

// Get paths
const { backendPath, qapCompilerPath, synthesizerPath } = getPaths();

// Check if path exists
const checkPath = (pathToCheck, name) => {
  if (fs.existsSync(pathToCheck)) {
    console.log(`${name} path exists: ${pathToCheck}`);
    return true;
  } else {
    console.error(`Warning: ${name} path does not exist: ${pathToCheck}`);
    return false;
  }
};

checkPath(backendPath, "Backend");
checkPath(qapCompilerPath, "QAP Compiler");
checkPath(synthesizerPath, "Synthesizer");

// Create path map (used when executing commands)
const pathMap = {
  backend: backendPath,
  "qap-compiler": qapCompilerPath,
  synthesizer: synthesizerPath,
};

// Set up IPC handler
ipcMain.handle("execute-command", async (event, command) => {
  console.log(`Executing command: ${command}`);
  console.log(`Execution path: ${backendPath}`);

  return new Promise((resolve, reject) => {
    // Split command and arguments
    const args = command.split(" ");
    const cmd = args.shift() || "";

    // Use spawn with 'inherit' stdio to inherit parent process stdio
    const process = spawn(cmd, args, {
      cwd: pathMap.backend,
      stdio: "inherit", // Inherit parent process stdio (direct output to terminal)
      shell: true, // Use shell
    });

    // Handle process close
    process.on("close", (code) => {
      console.log(`Process exit code: ${code}`);
      if (code !== 0) {
        reject(`Process exited with code ${code}`);
      } else {
        resolve({ success: true, code });
      }
    });

    // Handle process error
    process.on("error", (err) => {
      console.error(`Process error: ${err}`);
      reject(err.message);
    });
  });
});
