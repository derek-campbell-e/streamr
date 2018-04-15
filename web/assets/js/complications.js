module.exports = function Complications(options){
  const ipc = require('electron').ipcRenderer;
  const common = require('../../../src/Common');

  let compl = common.object();
  compl.emitToIPC();

  compl.meta.class = 'complications';
  compl.meta.mind = 'web';
  
  compl.activeRegions = {};
  compl.complications = {};

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

  let moduleRegions = ['top-left', 'top-right', 'right-quarter', 'bottom-right','left-quarter', 'top-quarter', 'bottom-half', 'half-center', 'top-half'];
  compl.addModule = function(event, moduleName, moduleRegion, moduleHtml){
    compl.log("adding module", moduleName, 'to region', moduleRegion);
    let html =`<div class='module'>
                  <div class='wrapper'>
                    ${moduleHtml}
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
    compl.complications[moduleName] = {name: moduleName, dom: dom};
    dom.appendTo('.'+moduleRegion);
  };

  compl.updateModule = function(event, moduleName, html){
    let ref = compl.complications[moduleName];
    if(!ref){
      return;
    }
    ref.dom.find(".wrapper").html(html);
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
    ipc.on('update:module', compl.updateModule);
  };

  let init = function(){
    bind();
    ipc.send('compl:ready', options);
    compl.log("complications module ready....", options.env);
    return compl;
  };

  return init();
};