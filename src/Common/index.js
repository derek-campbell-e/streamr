module.exports = function CommonTools(){
  let common = {};

  common.object = require('./object');
  common.stdFormatter = require('./stdFormatter');
  common.logFormatter = require('./stdFormatter');
  common.uuid = require('./uuid');
  common.makeLogger = require('./makeLogger');
  common.timestamp = require('./timestamp');

  return common;
}();