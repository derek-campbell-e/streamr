module.exports = function StreamrWeb(){
  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let streamr = common.object();
  streamr.emitToIPC();
  streamr.meta.class = 'streamr';
  streamr.meta.mind = 'web';

  let aspectRatio = function(inWidth, inHeight, aspect){
    aspect = aspect || {w: 1920, h: 1080};
    if(inWidth){
      let a = inWidth * aspect.h;
      let b = aspect.w;
      let height = a / b;
      return height;
    }
    if(inHeight){
      let a = aspect.h;
      let b = aspect.w * inHeight;
      let width = b / a;
      return width;
    }
  };
  
  streamr.recordingTimer = null;

  streamr.writeLog = function(event, string){
    $("#logger pre code").prepend("<span>" + string + "</span>");
  };

  streamr.startRecording = function(){
    streamr.log("we should show a recording button....");
  };

  streamr.resizePlayers = function(){
    $(".stream-player").each(function(i,e){
      let player = $(e);
      let width = player.parent().width();
      let height = aspectRatio(width);
      try {
        player.css('height', height + 'px');
      } catch(error) {
        player.height(height);
      }
    });
  };

  streamr.pipeDevelopmentFeed = function(sender, image){
    try {
      let blob = new Blob([image], {type: 'image/jpeg'});
      let imageURL = window.URL.createObjectURL(blob);
      let img = document.querySelector("#stream-development");
      img.src = imageURL;
    } catch(error){
      console.log(error);
    }
  };

  streamr.pipeProductionFeed = function(sender, image){
    try {
      let blob = new Blob([image], {type: 'image/jpeg'});
      let imageURL = window.URL.createObjectURL(blob);
      let img = document.querySelector("#stream-production");
      img.src = imageURL;
    } catch(error){
      console.log(error);
    }
  };

  let bind = function(){
    ipc.on('log:message', streamr.writeLog);
    ipc.on('start-recording', streamr.startRecording);
    ipc.on('feed:development', streamr.pipeDevelopmentFeed);
    ipc.on('feed:production', streamr.pipeProductionFeed);
    $(document).on('resize', streamr.resizePlayers);
  };

  let init = function(){
    bind();
    streamr.log("INITIALIZING");
    streamr.resizePlayers();
    return streamr;
  };

  return init();
};