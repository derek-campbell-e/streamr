module.exports = function Dashboard(Streamr){
  const common = require('./Common');
  const debug = require('debug')('dashboard');

  const ipc = require('electron').ipcMain;

  let dashboard = common.object();
  dashboard.meta.class = 'dashboard';
  dashboard.meta.mind = 'node';

  dashboard.receivedWindow = function(event){
    debug("GOT A WINDOW");
    dashboard.log("got our window");
    dashboard.window = event.sender;
    event.sender.send('dashboard:ready');
  };

  dashboard.processMessage = function(event, message){
    switch(message){
      case 'start:recording':
        dashboard.emit('start:recording');
      break;
      case 'stop:recording':
        dashboard.emit('stop:recording');
      break;
    }
  };

  let bind = function(){
    ipc.on('dashboard:window', dashboard.receivedWindow);
    ipc.on('dashboard:log', function(event, log){
      dashboard.emit('stdout', log);
    });
    ipc.on('dashboard:message', dashboard.processMessage);
  };

  let init = function(){
    bind();
    return dashboard;
  }

  return init();
};