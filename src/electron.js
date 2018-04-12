module.exports = function Electron(Streamr){
  const fs = require('fs');
  const common = require('./Common');
  const electron = require('electron');
  // Module to control application life.
  const app = electron.app;
  // Module to create native browser window.
  const BrowserWindow = electron.BrowserWindow;

  const path = require('path');
  const url = require('url');
  
  let updateTimer = null;

  let electronModule = common.object();
  electronModule.meta.class = 'electron';
  electronModule.mainWindow = null;

  electronModule.createWindow = function(){
    // Create the browser window.
    electronModule.emit('ready');
    let windowDimension = require(process.cwd() + "/window.json");
    electronModule.mainWindow = new BrowserWindow({width: windowDimension.width, height: windowDimension.height, x: windowDimension.x, y: windowDimension.y});

    // and load the index.html of the app.
    electronModule.mainWindow.loadURL(url.format({
      pathname: path.join(process.cwd(), 'web', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    electronModule.log("created window...");
    bind();

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    electronModule.mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      electronModule.mainWindow = null;
    });
    Streamr.window = electronModule.mainWindow;
  };

  electronModule.saveWindowDimension = function(x,y,w,h){
    let json = {x: x, y: y, width: w, height: h};
    let windowFilePath = path.join(process.cwd(), 'window.json');
    fs.writeFile(windowFilePath, JSON.stringify(json), electronModule.log.bind(electronModule, "writing preferences to file... error:"));
  };

  electronModule.onWindowMoveOrResize = function(event){
    updateTimer = clearTimeout(updateTimer);
    let window = event.sender;
    let size = window.getSize();
    let position = window.getPosition();
    updateTimer = setTimeout(electronModule.saveWindowDimension.bind(electronModule, position[0], position[1], size[0], size[1]), 1000);
  };

  let bind = function(){
    electronModule.mainWindow.on('move', electronModule.onWindowMoveOrResize);
    electronModule.mainWindow.on('resize', electronModule.onWindowMoveOrResize);
  };

  electronModule.windowsClosed = function(){
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  };

  electronModule.activate = function(){
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electronModule.mainWindow === null) {
      electronModule.createWindow();
    }
  };

  // electron app events;
  app.on('ready', electronModule.createWindow);
  app.on('window-all-closed', electronModule.windowsClosed);
  app.on('activate', electronModule.activate);

  return electronModule;
};