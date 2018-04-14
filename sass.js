module.exports = function sass(){
  const sass = require('node-sass');
  const path = require('path');
  const fs = require('fs');

  const inputPath = path.join(process.cwd(), 'web', 'assets', 'scss', 'streamr.scss');
  const outputPath = path.join(process.cwd(), 'web', 'assets', 'css', 'streamr.css');

  sass.render({
    file: inputPath,
    outputStyle: 'expanded'
  }, function(error, result){
    if(error){
      return false;
    }
    //console.log(result);
    fs.writeFile(outputPath, result.css.toString('utf8'), console.log);
  });

  return sass;
}();