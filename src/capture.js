module.exports = function Capture(){
  const common = require('./Common');
  const debug = require('debug')('capturer');
  const fs = require('fs');

  let capture = common.object();
  capture.meta.class = 'capturer';

  capture.keepOpenTimer = null;
  
  capture.send = function(data){
    process.send(data);
  };

  capture.handler = function(message){
    switch(message.cmd){
      case 'framecapture':
        let buffer = Buffer.from(message.image);
        //fs.writeFile(message.path, buffer, function(){});
      break;
    }
  };

  process.on('message', capture.handler);

  let init = function(){
    capture.send('ready');
    capture.keepOpenTimer = setInterval(function(){}, 1000);
    return capture;
  };

  return init();
}();