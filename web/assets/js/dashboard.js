module.exports = function Dashboard(){
  let options = {};
  options.logFolder = './logs';
  global['Options'] = options;
  const common = require('../../../src/Common');
  const ipc = require('electron').ipcRenderer;
  let dashboard = common.object();
  dashboard.meta.class = 'dashboard';
  dashboard.meta.mind = 'web';
  dashboard.log("INITIALIZING DASHBOARD");

  let bind = function(){
    dashboard.on('stdout', ipc.send.bind(ipc, 'dashboard:log'))
    ipc.on('dashboard:ready', function(){
      dashboard.log("WE ARE READY");
    });
  };

  let init = function(){
    bind();
    ipc.send('dashboard:window');
    return dashboard;
  };

  return init();
};