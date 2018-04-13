module.exports = function Camera(cameraOptions){
  cameraOptions = cameraOptions || {};
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
  let $video = $("#camera");
  let feedInterval = null;

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
    $video.style('object-fit', 'contain');
  };

  camera.webcamError = function(error){
    camera.error(error);
  };

  let bind = function(){
    camera.on('stdout', ipc.send.bind(ipc, 'camera:log'))
    ipc.on('camera:ready', function(){
      camera.log("WE ARE READY");
      camera.loadCamera();
      $(".card").css({position: 'absolute'}).animate({top: '300px'}, 3000, function(){
        $(".card").animate({left: '1000px'});
      });
    });
  };

  let init = function(){
    bind();
    ipc.send('camera:window', cameraOptions);
    return camera;
  };

  return init();
};