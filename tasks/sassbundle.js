var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var prefixer = postcss([ autoprefixer ]);

// our own custom module
var gitInfo = require(process.cwd() + '/tasks/repoInfo.js');

/******************************************************************
 * Build SASS
 */

// in order to pass variables to SASS we use the "data" options in node-sass
// and pass that a SASS string with our variables first and an @import of
// our main SASS file right after

// first we define our variables
var dataString =  "$build_branch : " + gitInfo.branch + "; ";
    dataString += "$build_repo : " + gitInfo.user + "; ";

// then we @import our main sass file
    dataString += "@import '" + './src/sass/dubplus.scss' + "';";



function compileSASS() {
  sass.render({
    data : dataString,
  }, function(err, result) { 
    if (err) {return console.error(err); }
    fs.writeFileSync('./css/dubplus.css', prefixer.process(result.css));
  });
}

function minifySASS() {
  sass.render({
    data : dataString,
    outputStyle : "compressed"
  }, function(err, result) { 
    if (err) {return console.error(err); }
    fs.writeFileSync('./css/dubplus.min.css', prefixer.process(result.css));
  });
}

function watchingSASS() {
  // create our own sass file watch with node
  fs.watch('./src/sass',
    {
      recursive : true
    },
    function (event, filename) {
      if ( filename && /s[ca]ss/i.test(path.extname(filename)) ) {
        console.log('SASS '+event+' event detected');
        console.log('file: '+ filename);
        compileSASS();
      } else {
        console.log('Filename missing. NOT compiling. Try again');
      }
    }
  );
}

module.exports = {
  compile : compileSASS,
  watch : watchingSASS,
  minify : minifySASS
};