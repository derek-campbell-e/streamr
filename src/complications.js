module.exports = function Complications(Streamr){
  const common = require('./Common');
  const ipc = require('electron').ipcMain;
  const debug = require('debug')('complications');
  const ejs = require('ejs');
  const moment = require('moment');

  let compl = common.object();
  compl.meta.class = 'complications';
  compl.meta.mind = 'node';

  compl.windows = {};
  compl.complications = {dev: {}, prod: {}};

  let timeComplication = {};

  timeComplication.html = `
    <div class='timer'><%- time %></div>
  `;

  timeComplication.updateOn = {
    hz: 1000
  };

  timeComplication.update = function(){
    let data = {};
    data.time = moment().format('hh:mm:ss');
    return data;
  };

  timeComplication.generate = function(){
    let template = ejs.compile(timeComplication.html);
    return template(timeComplication.update());
  };

  compl.addWindow = function(event, options){
    switch(options.env){
      case 'dev':
        compl.windows.dev = event.sender;
      break;
      case 'prod':
        compl.windows.prod = event.sender;
      break;
    }
    debug("added window", options.env);
  };

  compl.addComplication = function(environment, moduleName, toRegion){
    let ref = null;
    let window = null;
    switch(environment){
      case 'dev':
        ref = compl.complications.dev;
        window = compl.windows.dev;
        break;
      case 'prod':
        ref = compl.complications.prod;
        window = compl.windows.prod;
        break;
    }

    if(!ref || !window){
      return false;
    }
    let complRef = {};
    complRef.name = moduleName;
    complRef.module = timeComplication;
    complRef.region = toRegion;

    ref[moduleName] = complRef;
    compl.bindComplication(environment, ref[moduleName]);
  };

  compl.bindComplication = function(environment, complicationRef){
    let isUpdatingOnHz = complicationRef.module.updateOn.hasOwnProperty('hz');
    if(isUpdatingOnHz){
      complicationRef.timer = setInterval(compl.sendUpdateToComplication.bind(compl, environment, complicationRef), complicationRef.module.updateOn.hz);
      debug("we are on an updateTimer");
    }
    let ref = null;
    let window = null;
    switch(environment){
      case 'dev':
        ref = compl.complications.dev;
        window = compl.windows.dev;
        break;
      case 'prod':
        ref = compl.complications.prod;
        window = compl.windows.prod;
        break;
    }
    window.send("add:module", complicationRef.name, complicationRef.region, compl.updateComplication(environment, complicationRef));
  };

  compl.updateComplication = function(environment, complicationRef){
    let newHTML = complicationRef.module.generate();
    return newHTML;
  };

  compl.sendUpdateToComplication = function(environment, complicationRef){
    debug("UPDATING", environment);
    let ref = null;
    let window = null;
    switch(environment){
      case 'dev':
        ref = compl.complications.dev;
        window = compl.windows.dev;
        break;
      case 'prod':
        ref = compl.complications.prod;
        window = compl.windows.prod;
        break;
    }
    compl.log("sending update to module");
    window.send('update:module', complicationRef.name, compl.updateComplication(environment, complicationRef));
  };

  let bind = function(){
    ipc.on('compl:ready', compl.addWindow);
  };

  let init = function(){
    bind();
    return compl;
  };

  return init();
};