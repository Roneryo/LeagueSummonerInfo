const path = require("path");

const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const winDescription = {
    width: 550,
    height: 500,
    
    // webPreferences: {
    //   preload: path.join(__dirname, "./public/js/preload.js"),
    // },
    // frame: false,
    // titleBarStyle: 'hidden',
    // trafficLightPosition: { x: 10, y: 10 },
    // transparent: true
  };
  const win = new BrowserWindow(winDescription);
  win.isResizable=false;
  win.loadFile("./public/index.html");
  // win.setWindowButtonVisibility(false)
};

app.whenReady().then(async () => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

try {
  require("electron-reloader")(module);
} catch (_) {}
