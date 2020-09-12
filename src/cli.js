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
    console.log(chalk.greenBright("\n> Closing... bye bye!"));
    process.exit(0);
});

// function to show a simple menu from the CLI
cli.prototype.showMenu = function() {
    console.log(chalk.inverse("=== Node-Webcrawler Commands ==="));
    console.log(chalk.magentaBright(" * start: start the spider for the target website")); 
    console.log(chalk.magentaBright(" * pages: show index of all crawled pages")); 
    console.log(chalk.magentaBright(" * word [str]: find all pages with word [str] and how many"));  
    console.log(chalk.magentaBright(" * read [int]: read a text content snippet of page [int]"));     
    console.log(chalk.magentaBright(" * listlinks [int]: list all the links foud in page [int]"));     
    console.log(chalk.magentaBright(" * quit: close this program"));    
};

cli.prototype.rl = rl;

module.exports = cli;