module.exports = function StreamrWeb(){
  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let streamr = common.object();
  streamr.meta.class = 'streamr';
  streamr.meta.mind = 'web';

  let feed = $("#stream").get(0);
  
  streamr.recordingTimer = null;

  streamr.writeLog = function(event, string){
    $("#logger pre code").append("<span>" + string + "</span>");
  };

  streamr.startRecording = function(){
    streamr.log("START RECORDING NOW PLZ");
    streamr.log("START IT");
    streamr.recordingTimer = setInterval(function(){
      /*
      feed.capturePage(function(image){
        //streamr.log(image);
        ipc.send('feed:capture', image);
      });
    }, 300);
    */
  };

  let bind = function(){
    streamr.on('stdout', ipc.send.bind(ipc, 'streamr:log'))
    ipc.on('log:message', streamr.writeLog);
    ipc.on('start-recording', streamr.startRecording);
  };

  let init = function(){
    bind();
    streamr.log("INITIALIZING");
    return streamr;
  };

  return init();
};