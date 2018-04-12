module.exports = function Camera(){
  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let camera = common.object();
  camera.meta.class = 'camera';
  camera.meta.mind = 'web';
  camera.log("INITIALIZING camera");
  
  let video = document.querySelector("#camera");

  camera.loadCamera = function(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    if(!navigator.getUserMedia){
      camera.log("cannot get webcam");
      return false;
    }
    navigator.getUserMedia({video: true}, camera.loadIntoFeed, camera.webcamError);
  };

  camera.loadIntoFeed = function(stream){
    video.src = window.URL.createObjectURL(stream);
  };

  camera.webcamError = function(error){
    camera.error(error);
  };

  let bind = function(){
    camera.on('stdout', ipc.send.bind(ipc, 'camera:log'))
    ipc.on('camera:ready', function(){
      camera.log("WE ARE READY");
      camera.loadCamera();
    });
  };

  let init = function(){
    bind();
    ipc.send('camera:window');
    return camera;
  };

  return init();
};