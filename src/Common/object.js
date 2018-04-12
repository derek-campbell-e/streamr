module.exports = function CommonObject(Options){
  Options = Options || global['Options'] || {};
  const EventEmitter = require('events').EventEmitter;
  const common = require('./index');

  let Module = new EventEmitter();
  Module.setMaxListeners(0);

  Module.meta = {};
  Module.meta.id = common.uuid();
  Module.meta.class = "object";
  Module.meta.mind = "default";
  Module.meta.debugName = function(){
    return Module.meta.class + ":" + Module.meta.mind + ":" + Module.meta.id;
  };
  Module.meta.createdAt = common.timestamp();

  Module.meta.stdout = [];
  Module.meta.stderr = [];
  Module.meta.results = [];

  common.makeLogger(Module, Options);


  return Module;
};