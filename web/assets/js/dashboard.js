module.exports = function Dashboard(){
  const desktop = require('electron').desktopCapturer;

  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let dashboard = common.object();
  dashboard.emitToIPC();
  dashboard.meta.class = 'dashboard';
  dashboard.meta.mind = 'web';

  dashboard.sendDataMessage = function(event){
    let dataMessage = $(this).attr('data-message');
    dashboard.log("sending message", dataMessage);
    ipc.send('dashboard:message', dataMessage);
    ipc.send(dataMessage);
  };

  dashboard.loadDesktopWindows = function(){
    desktop.getSources({types: ['screen']}, function(error, sources){
      if(error){
        dashboard.log(error);
        return;
      }
      let sourcesCopy = [...sources];
      let loop = function(){
        let source = sourcesCopy.shift();
        if(typeof source === "undefined"){
          return;
        }
        navigator.mediaDevices.getUserMedia({
          audio: false, 
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
            }
          }
        }).then(function(stream){
          dashboard.createDesktopWindow(source, stream);
          loop();
        })
        .catch(function(error){
          dashboard.log(error);
          loop();
        });
      };
      loop();
    });
  };

  dashboard.createDesktopWindow = function(source, stream){
    dashboard.log("creating desktopwindow", source.name);
    let html = `<div class='screen-capture' data-name='${source.name}' style='width:160px; height:160px'>
      <video style='width:100%;height:100%'></video>
    </div>`;
    let dom = $(html);
    dom.appendTo(".screens");
    let video = dom.find("video").get(0);
    video.srcObject = stream;
    video.onloadedmetadata = function(){
      video.play();
    }
    let canvas = document.createElement("canvas");
    canvas.width = $(video).width();
    canvas.height = $(video).height();
  };
 

  let bind = function(){
    $(document).on('click', '[data-message]', dashboard.sendDataMessage);
    ipc.on('dashboard:ready', function(){
      dashboard.log("WE ARE READY");
      //dashboard.loadDesktopWindows();
    });
  };

  let init = function(){
    bind();
    ipc.send('dashboard:window');
    dashboard.log("INITIALIZING DASHBOARD");
    return dashboard;
  };

  return init();
};