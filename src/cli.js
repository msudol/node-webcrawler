/*** cli.js ***/

'use strict';

// required modules

// chalk - https://www.npmjs.com/package/chalk
const chalk = require('chalk');

// node-color-readline - https://www.npmjs.com/package/node-color-readline
const colorReadline = require('node-color-readline');

function cli(prefix) {
    this.prefix = prefix;
    this.rl.setPrompt(prefix);
};

// instance of readline as rl
const rl = colorReadline.createInterface({
  input: process.stdin,
  output: process.stdout,
  colorize: function (str) {
    // Make all input white
    return str.replace(/.*/g, function (match) {
        return chalk.white(match);
    });
  }
});

// readline close event
rl.on('close',function(){
    console.log("\n> Closing... bye bye!");
    process.exit(0);
});

// function to show a simple menu from the CLI
cli.prototype.showMenu = function() {
    console.log(chalk.inverse("=== Node-Webcrawler Commands ==="));
    console.log(chalk.magentaBright(" * start: start the spider for the target website")); 
    console.log(chalk.magentaBright(" * titles: show index of news titles")); 
    console.log(chalk.magentaBright(" * read [int]: read the content snippet of title [int]"));     
    console.log(chalk.magentaBright(" * open [int]: open the feed item in your system browser"));     
    console.log(chalk.magentaBright(" * quit: close this program"));    
};

cli.prototype.rl = rl;

module.exports = cli;