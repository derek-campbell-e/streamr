module.exports = function LogFormatter(Module, logString){
  const moment = require('moment');
  const util = require('util');
  const dateString = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
  const metaString =  /* Module.meta.id + " " + */ Module.meta.class + ":" + Module.meta.mind;
  logString = logString.replace(/\n/g, " ");
  return util.format('%s [%s] - %s', metaString, dateString, logString);
};