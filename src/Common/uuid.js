module.exports = function UUID(){
  const crypto = require('crypto');
  return crypto.randomBytes(2).toString('hex') + "-" + crypto.randomBytes(4).toString('hex');
};