module.exports = function Timestamp(){
  return require('moment')().format('x');
};