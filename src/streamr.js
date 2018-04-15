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

  streamr.options = {};
  streamr.options.resolution = {w: 1920, h:1080};
  streamr.meta.class = 'streamr';
  streamr.meta.mind = 'node';


  streamr.dashboard = require('./dashboard')(streamr);
  streamr.camera = require('./camera')(streamr);
  streamr.complications = require('./complications')(streamr);

  let electron = null;

  streamr.pipeDevelopmentFeed = function(event, dirty, image){
    let jpegData = image.toJPEG(100);
    setTimeout(function(){
      streamr.window.send('feed:development', jpegData);
    })
  };

  streamr.pipeProductionFeed = function(event, dirty, image){
    streamr.window.send('feed:production', image.toJPEG(100));
  };

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
    //streamr.log("GOT AN IMAGE");
    //debug(image, image.isEmpty());
    let capturePath = path.join(process.cwd(), 'capture.png');
    //fs.writeFile(capturePath, image, function(){});
  };

  streamr.testRecord = function(){
    streamr.log("START THE RECORDING PLS");
  };

  streamr.complicationsReady = function(event){
    streamr.log("our complications are ready!");
    streamr.complication = {};
    streamr.complication.window = event.sender;
  };

  streamr.addComplication = function(){
    //streamr.complication.window.send('add:module');
    //streamr.log("sending add complication");
    streamr.complications.addComplication('prod', 'time', 'top-right');
    streamr.complications.addComplication('dev', 'time', 'half-center');
  };

  let bind = function(){
    streamr.on('stdout', streamr.writeToLog);
    streamr.on('stderr', streamr.writeToLog);
    electron.on('stdout', streamr.writeToLog);
    electron.on('stderr', streamr.writeToLog);
    streamr.dashboard.on('stdout', streamr.writeToLog);
    streamr.dashboard.on('stderr', streamr.writeToLog);
    streamr.dashboard.on('start:recording', streamr.testRecord);
    streamr.dashboard.on('add:module', streamr.addComplication);
    streamr.camera.on('stdout', streamr.writeToLog);
    streamr.camera.on('stderr', streamr.writeToLog);
    streamr.camera.on('ready-to-stream', streamr.startRecording);
    ipc.on('feed:capture', streamr.captureFeed);
    ipc.on('streamr:log', function(event, log){streamr.emit('stdout', log);});
    ipc.on('compl:ready', streamr.complicationsReady);
    ipc.on('renderer:log', function(event, key, message){
      streamr.writeToLog(message);
    });
    streamr.emit('ready');
  };

  let init = function(){
    electron = require('./electron')(streamr);
    electron.on('ready', bind);
    streamr.log("loading...");
    return streamr;
  };

  return init();
};