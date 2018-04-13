module.exports = function Camera(Streamr){
  const common = require('./Common');
  const ipc = require('electron').ipcMain;
  const app = require('electron').app;
  const BrowserWindow = require('electron').BrowserWindow;
  const debug = require('debug')('camera');
  const path = require('path');
  const fs = require('fs');

  let capturePath = path.join(process.cwd(), 'capture.jpg');

  let camera = common.object();
  camera.meta.class = 'camera';
  camera.meta.mind = 'node';
  camera.timer = null;
  camera.window = null;
  camera.recordingWindow = null;
  camera.frameRate = 600;

  camera.startRecording = function(){
    return;
    const url = require('url');
    let feedurl = path.join(process.cwd(), 'web', 'feed.html');
    camera.recordingWindow = new BrowserWindow({
      webPreferences: {
        offscreen: true
      },
      width: 1920,
      height: 1080,
      show: false
    });
    camera.recordingWindow.loadURL(url.format({
      pathname: feedurl,
      protocol: 'file:',
      slashes: true
    }));
    camera.recordingWindow.webContents.on('paint', camera.captureFeed);
    camera.recordingWindow.webContents.setFrameRate(camera.frameRate);
  };

  camera.pipeDevelopmentFeed = function(){
    
    const url = require('url');
    let feedurl = path.join(process.cwd(), 'web', 'feed.html');
    camera.developmentFeed = new BrowserWindow({
      webPreferences: {
        offscreen: true
      },
      width: 1920,
      height: 1080,
      show: false
    });
    camera.developmentFeed.loadURL(url.format({
      pathname: feedurl,
      protocol: 'file:',
      slashes: true
    }));
    camera.developmentFeed.webContents.on('paint', Streamr.pipeDevelopmentFeed);
    camera.developmentFeed.webContents.setFrameRate(camera.frameRate);
  };

  camera.pipeProductionFeed = function(){
    const url = require('url');
    let feedurl = path.join(process.cwd(), 'web', 'feed.html');
    camera.productionFeed = new BrowserWindow({
      webPreferences: {
        offscreen: true
      },
      width: 1920,
      height: 1080,
      show: false
    });
    camera.productionFeed.loadURL(url.format({
      pathname: feedurl,
      protocol: 'file:',
      slashes: true
    }));
    camera.productionFeed.webContents.on('paint', Streamr.pipeProductionFeed);
    camera.productionFeed.webContents.setFrameRate(120);
  };

  camera.captureFeed = function(event, dirty, image){
    return;
    let imageData = image.toJPEG(100);
    fs.writeFile(capturePath, imageData, function(){});
  };

  camera.receivedWindow = function(event, options){
    if(options.live){
      event.sender.send('camera:ready');
      event.sender.send('start:recording');
    } else {
      camera.log("got our camera window");
      camera.window = event.sender;
      camera.window.send('camera:ready');
      camera.emit('ready-to-stream');
      
    }
  };

  let bind = function(){
    ipc.on('camera:window', camera.receivedWindow);
    Streamr.on('ready', function(){
      camera.pipeDevelopmentFeed();
      camera.pipeProductionFeed();
    });
  };

  let init = function(){
    bind();
    return camera;
  };

  return init();
};