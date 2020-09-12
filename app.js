/**
 * node-webcrawler - As a school assignment, develop a utility to crawl a website that will fetch the index page and perform a series of defined actions with the data.
 * @license MIT
 *
 *  https://github.com/msudol/node-webcrawler
 */
 
'use strict';

// get config values
const config = require('./config/config.js');

// get our cli and reader classes
const CLI = require('./src/cli.js');
const Spider = require('./src/spider.js');
const Status = require('./src/status.js');

// set instances
let cli = new CLI(config.prefix);
let spider = new Spider(config.url, config.maxDepth);
let status = new Status();

// call whenever the prompt is needed
function prompt() {
    cli.rl.prompt();
};

// send to reader later as callback function
function log(data) {
    console.log(data);
    prompt();
};

// send to reader later as callback function
function startlog(data) {
    console.log(data);
    cli.showMenu();
    prompt();
};

// show the CLI Menu on app init.
cli.showMenu();

// run the crawler on app init (I think we should just show menu and use the start command)
//spider.start(log);

// fire off prompt since we aren't starting spider yet, remove this when spider runs first
prompt();

// line event - basically creates a stream cli
cli.rl.on('line', function(input) {

    // accept upper and lower input
    let line = input.toLowerCase();
    
    // close if user types quit
    if (line === "quit" || line === "q") {
        cli.rl.close();
    } 

    // pull feed
    else if (line.startsWith("start")) {
        spider.start(startlog);
    }   

    // show all indexed pages
    else if (line.startsWith("pages")) {
        spider.pages(log);
    }   

    // word check
    else if ((line === "word") || (line.startsWith("word "))) {
        // split on all spaces to get just the first word if more are typed
        let args = input.split(" ");
        spider.word(args[1], log);   
    }  

    // read title
    else if ((line === "read") || (line.startsWith("read "))) {
        // split on first space, everything after is considered the args
        let args = input.split(/ (.+)/)[1];
        spider.read(args, log);   
    }  

    // read links for title
    else if ((line === "listlinks") || (line.startsWith("listlinks "))) {
        // split on first space, everything after is considered the args
        let args = input.split(/ (.+)/)[1];
        spider.listlinks(args, log);   
    }  

    // read the words for the title
    else if ((line === "listwords") || (line.startsWith("listwords "))) {
        // split on first space, everything after is considered the args
        let args = input.split(/ (.+)/)[1];
        spider.listwords(args, log);   
    }  

    // help menu
    else if (line.startsWith("?") || line.startsWith("help")) {
        cli.showMenu();
        prompt();
    }   

    // prompt again
    else {   
        console.log("> Unknown command");
        prompt();
    }
    
});

