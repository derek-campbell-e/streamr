module.exports = function Streamr(){
  const options = {};
  options.logFolder = "./logs";
  global['Options'] = options;
  const common = require('./Common');
  const ipc = require('electron').ipcMain;
  const fs = require('fs');
  const path = require('path');
  const debug = require('debug')('streamr');

  let streamr = common.object();
  streamr.meta.class = 'streamr';
  streamr.meta.mind = 'node';

  streamr.dashboard = require('./dashboard')(streamr);
  streamr.camera = require('./camera')(streamr);;
  let electron = null;

  streamr.writeToLog = function(string){
    if(!electron.mainWindow){
      return;
    }
    electron.mainWindow.send('log:message', string);
  };

  streamr.startRecording = function(){
    streamr.log("START RECORDING");
    streamr.window.send('start-recording');
    streamr.camera.startRecording();
  };

  streamr.captureFeed = function(event, image){
    streamr.log("GOT AN IMAGE");
    debug(image, image.isEmpty());
    let imageBuffer = image.toPNG();
    let capturePath = path.join(process.cwd(), 'capture.png');
    fs.writeFile(capturePath, imageBuffer, streamr.log.bind(streamr, 'writing capture to file....'));
  };

  let bind = function(){
    streamr.on('stdout', streamr.writeToLog);
    streamr.on('stderr', streamr.writeToLog);
    electron.on('stdout', streamr.writeToLog);
    electron.on('stderr', streamr.writeToLog);
    streamr.dashboard.on('stdout', streamr.writeToLog);
    streamr.dashboard.on('stderr', streamr.writeToLog);
    streamr.camera.on('stdout', streamr.writeToLog);
    streamr.camera.on('stderr', streamr.writeToLog);
    streamr.camera.on('ready-to-stream', streamr.startRecording);
    ipc.on('feed:capture', streamr.captureFeed);
    ipc.on('streamr:log', function(event, log){streamr.emit('stdout', log);});
  };

  let init = function(){
    electron = require('./electron')(streamr);
    electron.on('ready', bind);
    streamr.log("loading...");
    return streamr;
  };

  return init();
};