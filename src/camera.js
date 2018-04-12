module.exports = function Camera(Streamr){
  const common = require('./Common');
  const ipc = require('electron').ipcMain;
  const debug = require('debug')('camera');
  let camera = common.object();
  camera.meta.class = 'camera';
  camera.meta.mind = 'node';

  camera.startRecording = function(){
    camera.window.webContents.capturePage(function(image){
      debug(image.isEmpty());
    });
  };

  camera.receivedWindow = function(event){
    camera.log("got our camera window");
    camera.window = event.sender;
    camera.window.send('camera:ready');
    camera.emit('ready-to-stream');
  };

  let bind = function(){
    ipc.on('camera:window', camera.receivedWindow);
    Streamr.on('start-recording', function(){
      camera.log("ASDASDAS");
    });
  };

  let init = function(){
    bind();
    return camera;
  };

  return init();
};