module.exports = function Complications(){
  const ipc = require('electron').ipcRenderer;
  const common = require('../../../src/Common');

  let compl = common.object();
  compl.emitToIPC();

  compl.meta.class = 'complications';
  compl.meta.mind = 'web';
  
  compl.activeRegions = {};

  compl.collisions = {};
  compl.collisions['top-half'] = ['half-center', 'top-quarter', 'left-quarter', 'right-quarter'];
  compl.collisions['top-quarter'] = ['top-half', 'left-quarter', 'right-quarter'];
  compl.collisions['top-right'] = ['half-center', 'right-quarter', 'top-quarter', 'top-half'];
  compl.collisions['top-left'] = ['half-center', 'left-quarter', 'top-quarter', 'top-half'];

  compl.collisions['bottom-half'] = ['half-center', 'bottom-quarter', 'bottom-left', 'bottom-right'];
  compl.collisions['bottom-quarter'] = ['bottom-half', 'bottom-quarter', 'bottom-left', 'bottom-right'];
  compl.collisions['bottom-right'] = ['bottom-half', 'bottom-quarter', 'right-quarter'];
  compl.collisions['bottom-left'] = ['bottom-half', 'bottom-quarter', 'left-quarter'];

  compl.collisions['half-center'] = ['bottom-half', 'top-half', 'bottom-right', 'right-quarter', 'bottom-left', 'left-quarter', 'top-half'];

  compl.collisions['left-quarter'] = ['bottom-half', 'bottom-quarter', 'bottom-left', 'top-left', 'top-half', 'top-quarter'];
  compl.collisions['right-quarter'] = ['bottom-half', 'bottom-quarter', 'bottom-right', 'top-right', 'top-half', 'top-quarter'];

  
  compl.checkCollision = function(moduleRegion){
    let collisions = [];
    for(let collisionRegionKey in compl.collisions){
      let collionRegions = compl.collisions[collisionRegionKey];
      if(collionRegions.indexOf(moduleRegion) !== -1 && compl.activeRegions[collisionRegionKey]){
        collisions.push(collisionRegionKey);
        compl.log("collision found!", moduleRegion, 'collides with', collisionRegionKey);
      }
    }
    if(collisions.length === 0){
      return false;
    }
    return collisions;
  };

  let moduleRegions = ['top-left', 'top-right', 'bottom-right','left-quarter', 'bottom-half', 'half-center', 'top-half'];
  compl.addModule = function(moduleName, moduleRegion){
    moduleName = 'test2';
    moduleRegion = moduleRegions.shift();
    compl.log("adding module", moduleName, 'to region', moduleRegion);
    let html = `<div class='module'>
                  <div class='wrapper'>
                    <h2>HELLO!!!</h2>
                  </div>
                </div>`;
    let dom = $(html);
    let collisionRegions = compl.checkCollision(moduleRegion);
    compl.log(collisionRegions);

    if(collisionRegions){
      return compl.removeRegions(collisionRegions, function(){
        compl.activeRegions[moduleRegion] = {name: moduleName, dom: dom};
        dom.appendTo('.'+moduleRegion);
      });
    }
    compl.activeRegions[moduleRegion] = {name: moduleName, dom: dom};
    dom.appendTo('.'+moduleRegion);
  };

  compl.removeRegions = function(regions, callback){
    callback = callback || function(){};
    let regionsCopy = [...regions];
    compl.log(regions);
    let loop = function(){
      let region = regionsCopy.shift();
      if(typeof region === "undefined"){
        return callback();
      }
      compl.activeRegions[region].dom.fadeOut(function(){
        compl.activeRegions[region].dom.remove();
        compl.activeRegions[region] = null;
        delete compl.activeRegions[region];
      });
      loop();
    };
    loop();
  };

  let bind = function(){
    ipc.on('add:module', compl.addModule);
  };

  let init = function(){
    bind();
    ipc.send('compl:ready');
    compl.log("complications module ready....");
    return compl;
  };

  return init();
};