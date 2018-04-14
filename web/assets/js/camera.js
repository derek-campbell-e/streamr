module.exports = function Camera(cameraOptions){
  cameraOptions = cameraOptions || {};
  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let camera = common.object();
  camera.emitToIPC();
  camera.meta.class = 'camera';
  camera.meta.mind = 'web';
  camera.log("INITIALIZING camera");
  
  let video = document.querySelector("#camera");
  let $video = $("#camera");
  let feedInterval = null;

  camera.resolution = null;

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
    video.onplay = function(){
      ipc.send("camera:playing");
    }
  };

  camera.webcamError = function(error){
    camera.error(error);
  };

  camera.scalePage = function(){
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    let scale = windowWidth / camera.resolution.w;
    let fontSize = parseFloat(camera.baseFontSize.replace(/(px|em)/g, ''));
    let scaledFont = fontSize * scale;
    $("html").css('font-size', scaledFont + 'px');
  };

  let bind = function(){
    camera.on('stdout', ipc.send.bind(ipc, 'camera:log'));
    ipc.on('reload:window', function(){
      window.location.reload();
    });
    ipc.on('camera:ready', function(event, resolution){
      $(window).on('resize', camera.scalePage);
      camera.resolution = resolution;
      camera.baseFontSize = $("html").css('font-size');
      camera.scalePage();
      camera.log("WE ARE READY");
      camera.loadCamera();
    });
  };

  let init = function(){
    bind();
    ipc.send('camera:window', cameraOptions);
    return camera;
  };

  return init();
};