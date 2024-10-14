import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  shell,
  utilityProcess,
  UtilityProcess,
} from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initMenu } from "./helpers/menu";

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const schemaPath = isProd
  ? path.join(userDataPath, "schema.gql")
  : "graphql-server/schema.gql";
process.env.SCHEMA_PATH = schemaPath;
process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
process.env.NEXT_PUBLIC_USER_DATA_PATH = userDataPath;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let serverProcess: UtilityProcess | null;
let mainWindow: BrowserWindow;

function isExternalUrl(url: string) {
  return !url.includes("localhost:") && !url.includes("app://");
}

function createGraphqlSeverProcess() {
  const serverPath =
    process.env.NODE_ENV === "production"
      ? path.join(
          process.resourcesPath,
          "..",
          "graphql-server",
          "dist",
          "main.js",
        )
      : path.join("graphql-server", "dist", "main.js");
  serverProcess = utilityProcess.fork(serverPath, [], { stdio: "pipe" });

  serverProcess?.stdout?.on("data", (chunk: Buffer) => {
    console.log("server data", chunk.toString("utf8"));
    // Send the Server console.log messages to the main browser window
    mainWindow?.webContents.executeJavaScript(`
        console.info('Server Log:', ${JSON.stringify(chunk.toString("utf8"))})`);
  });

  serverProcess?.stderr?.on("data", (chunk: Buffer) => {
    console.error("server error", chunk.toString("utf8"));
    // Send the Server console.error messages out to the main browser window
    mainWindow?.webContents.executeJavaScript(`
        console.error('Server Log:', ${JSON.stringify(chunk.toString("utf8"))})`);
  });
}

async function isGraphQLServerReady(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
    });
    console.log(url, response);
    return response.ok;
  } catch (error) {
    console.error("GraphQL server is not ready:", error);
    return false;
  }
}

async function waitForGraphQLServer(
  url: string,
  timeout: number = 50000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await isGraphQLServerReady(url)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("GraphQL server did not become ready in time");
}

// Function to create the loading window
function createLoadingWindow() {
  mainWindow = createWindow("main", {
    width: 1280,
    height: 680,
    icon:
      process.platform === "darwin"
        ? "build/mac/AppIcon.icns"
        : path.join(process.resourcesPath, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (isProd) {
    mainWindow.loadURL(path.join(process.resourcesPath, "./loading.html"));
  } else {
    mainWindow.loadFile(path.join(__dirname, "../main/loading.html"));
  }
}

app.on("ready", async () => {
  createLoadingWindow();

  createGraphqlSeverProcess();

  Menu.setApplicationMenu(initMenu(mainWindow, isProd));

  await waitForGraphQLServer("http://localhost:9002/graphql");

  if (isProd) {
    await mainWindow.loadURL("app://./");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}`);
  }

  // hit when middle-clicking buttons or <a href/> with a target set to _blank
  // always deny, optionally redirect to browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  // hit when clicking <a href/> with no target
  // optionally redirect to browser
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
      event.preventDefault();
    }
  });
});

function updateMenu(databaseName?: string) {
  const hasChosenDatabase = !!databaseName;
  const menu = initMenu(mainWindow, isProd, hasChosenDatabase);

  Menu.setApplicationMenu(menu);
}

ipcMain.on("update-menu", (_event, databaseName?: string) => {
  updateMenu(databaseName);
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

// This does not work
// TODO: add a way to get headers
ipcMain.handle("get-headers", (event, arg) => {
  const headers = {
    ...arg,
  };
  return headers;
});

ipcMain.handle("api-config", async () => {
  const cfg = {
    graphqlApiUrl: process.env.GRAPHQLAPI_URL,
  };
  return cfg;
});
