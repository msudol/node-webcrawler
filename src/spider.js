/***  spider.js ***/

'use strict';

// required modules

// chalk - https://www.npmjs.com/package/chalk
const chalk = require('chalk');

// cheerio for it's parsing API
const cheerio = require('cheerio');

// https://www.npmjs.com/package/html-to-text
const htmlToText = require('html-to-text');

// jsonfile for reading and writing to file - https://www.npmjs.com/package/jsonfile
const jsonfile = require('jsonfile');
const file = './store/queueData.json';

// simplecrawler - https://www.npmjs.com/package/simplecrawler
let Crawler = require("simplecrawler");

// spider class wraps an instance of crawler
function spider(url, maxDepth) {

    var self = this;

    // track the current id later on
    self.currentId = 0;

    // set to the total of pages indexed later on
    self.indexpages = 0;

    // I have jsonfile but I could also just use memory now that we've got it smaller
    self.store = {};

    let crawler = new Crawler(url);

    // first page and discovered links - maxDepth 2
    crawler.maxDepth = maxDepth;

    /*** Do we want to move all configuration values to the config.js and the spider instance? ***/

    // set to true to keep on targetURL only
    crawler.filterByDomain = true;
    crawler.scanSubdomains = true;

    // some other settings 
    crawler.interval = 250;
    crawler.maxConcurrency = 5;

    // response body for true, raw buffer for false
    crawler.decodeResponses = true;

    // parse links inside comments?
    crawler.parseHTMLComments = false;

    // dont download unsupported mime-types
    crawler.downloadUnsupported = false;

    // I only want html content types to be fetched as pages
    crawler.addFetchCondition((queueItem, referrerQueueItem, callback) => {
       callback(null, queueItem.url.indexOf(".xml") < 1);
    });

    crawler.on("crawlstart", function() {
        console.log("Crawling started!");
    });

    // event for fetch complete - this is the workhorse function
    crawler.on("fetchcomplete", function(queueItem, responseBody, response) { 

        // create an empty data object to store this fetch
        let data = {};

        // load cheerio for parsing the html 
        var $ = cheerio.load(responseBody);

        // remove all the inline javascript
        $('script').remove();
        
        // extract just the text of the page 
        var t = $('body *').contents().map(function() {
            return (this.type === 'text') ? $(this).text() : '';
        }).get().join(' ');

        // build our data store from the info above
        var words = t.replace(/\W*[ \n\t\r]\W*/g,",");
        let wordarr = words.toLowerCase().split(',');
        let wordcount = {};
        wordarr.forEach(function(i) { wordcount[i] = (wordcount[i]||0) + 1;});

        //data.links = linkarr;
        data.depth = queueItem.depth;
        data.id = queueItem.id;
        data.url = queueItem.url;
        data.bodylen = responseBody.length;
        data.type = response.headers['content-type'];
        data.words = wordarr;
        data.wordcount = wordcount;
        data.responseBody = htmlToText.fromString(responseBody, {
            wordwrap: null,
            hideLinkHrefIfSameAsText: true,
            format: {
                image: function(elem, fn, options) {
                    return '[image]';
                }
            }
        });

        // store result in object
        self.store[self.currentId] = data;
        
    });

    // Crawler is totally done
    crawler.on("complete", function() {
        
        // should probably write some data to storage or something
        jsonfile.writeFile(file, self.store, function (err) {
            if (err) console.error(err)
        }) 

        // because the fetch will be less than the discover when samedomain is true
        var note = "";
        if (crawler.filterByDomain) {
            note = "(Excluding non-domain pages)";
        }

        let items = Object.keys(self.store).length;
        let res = chalk.red.bold(`> Done Crawling! Found ${items} valid index pages. ${note} \n`);

        // runs the "current callback", an ugly trick I learned years ago that works great in async or event controlled situtations 
        // as long as you're only waiting on this one event that is.
        self.crawlCompleteCallback(res);
        
    });

    // fired when the discovery of linked resources has completed   
    crawler.on("discoverycomplete", function(queueItem, resources) {
        
        if (queueItem.id == 1) {
            console.log(chalk.red.bold("Found %d potential index links."), resources.length);
            self.indexpages = resources.length;
        }

        console.log(">[%d / %d] %s (%d bytes) %s ", self.currentId + 1, self.indexpages, self.store[self.currentId].url, self.store[self.currentId].bodylen, self.store[self.currentId].type);

        // add discovered links to the store and increment the currentid + 1
        self.store[self.currentId].links = resources;
        self.currentId++;

    });

    // overwriting the discoverResources method
    crawler.discoverResources = function(buffer, queueItem) {
        // going to look for real links using a href as the crawler default looks for greedy links
        var $ = cheerio.load(buffer.toString("utf8"));
    
        return $("a[href]").map(function () {
            return $(this).attr("href");
        }).get();

    };    

    // extend crawler to spider class
    this.crawler = crawler;

};

// start the web crawler
spider.prototype.start = function(callback) {
    this.crawler.start();
    // a temporary space for a waiting callback that can be called after the event we are waiting for is finished... ugly, but works great
    this.crawlCompleteCallback = callback;
};

// gets every page with word count of word argument and logs it
spider.prototype.pages = function(callback) {

    let res = "";
    
    var store = this.store;

    // has the feed been pulled yet?
    if (Object.keys(store).length === 0 && store.constructor === Object) {
        res = "> No items exist, try running start";
    }
    else {
        res = chalk.red.bold("> Searching site index for all pages...\n");
        res += "[##]  URL \n";
        Object.keys(store).forEach(function(key) {
            let c = parseInt(key) + 1;
            res += "[" + (c) + "]  " + store[key].url + "\n";
        });
    }

    callback(res);
}

// read the body of an indexed page
spider.prototype.read = function(args, callback) {

    let res = "";
    
    // has the feed been pulled yet?
    if (Object.keys(this.store).length === 0 && this.store.constructor === Object) {
        res = "> No items exist, try running start";
    }
    else {

        let argcheck = true;

        // input should be only int
        let intreg = /^\d+$/;
        let index = null;

        if ((args !== undefined) && (args !== null)) {
            if ((intreg.test(args)) && (args >= 1) && (args <= Object.keys(this.store).length)) {
                index = parseInt(args);
            }
            else {
                argcheck = false;
            }
        }

        if (argcheck) {
            res += chalk.red.bold(this.store[index - 1].url) + "\n";
            res += chalk.white.inverse(this.store[index - 1].responseBody);
        }
        else {
            res = "> Unknown index, try read [int].  Check 'pages' for available indices.";
        }

    }
    
    callback(res);
}

// function to list links for a link index
spider.prototype.listlinks = function(args, callback) {

    let res = "";
    
    // has the feed been pulled yet?
    if (Object.keys(this.store).length === 0 && this.store.constructor === Object) {
        res = "> No items exist, try running start";
    }
    else {

        let argcheck = true;

        // input should be only int
        let intreg = /^\d+$/;

        let index = null;

        if ((args !== undefined) && (args !== null)) {
            if ((intreg.test(args)) && (args >= 1) && (args <= Object.keys(this.store).length)) {
                index = parseInt(args);
            }
            else {
                argcheck = false;
            }
        }

        if (argcheck) {
            res += chalk.red.bold(this.store[index - 1].url) + "\n";
            for (var i = 0; i < this.store[index - 1].links.length; i++) {
                res += "[" + (i + 1) + "]  " + this.store[index - 1].links[i] + "\n";
            }
        }
        else {
            res = "> Unknown index, try listlinks [int].  Check 'pages' for available indices.";
        }

    }
    
    callback(res);
}

// helper function for development to list words for a link index
spider.prototype.listwords = function(args, callback) {

    let res = "";
    
    // has the feed been pulled yet?
    if (Object.keys(this.store).length === 0 && this.store.constructor === Object) {
        res = "> No items exist, try running start";
    }
    else {

        let argcheck = true;

        // input should be only int
        let intreg = /^\d+$/;
        let index = null;
        if ((args !== undefined) && (args !== null)) {
            if ((intreg.test(args)) && (args >= 1) && (args <= Object.keys(this.store).length)) {
                index = parseInt(args);
            }
            else {
                argcheck = false;
            }
        }

        if (argcheck) {
            res += chalk.red.bold(this.store[index - 1].url) + "\n";
            res += chalk.white.inverse(this.store[index - 1].wordcount.toString());            
        }
        else {
            res = "> Unknown index, try listwords [int].  Check 'pages' for available indices.";
        }

    }
    
    callback(res);
}

// gets every page with word count of word argument and logs it
spider.prototype.word = function(args, callback) {

    let res = "";
    
    var store = this.store;

    // has the feed been pulled yet?
    if (Object.keys(store).length === 0 && store.constructor === Object) {
        res = "> No items exist, try running start";
    }
    else if ((args !== undefined) && (args !== null)) {
        // args is a word to check the store for
        let arg = args.toLowerCase();
        res = chalk.red.bold("> Searching site index for pages with word: " + arg + "...\n");
        res += "[#]  URL \n";
        Object.keys(store).forEach(function(key) {
            if (store[key].wordcount[arg] > 0) {
                res += "[" + store[key].wordcount[arg] + "]  " + store[key].url + "\n";
            }
        });

    }
    else {
        res = "> Unknown index, try word [str].  Check 'pages' for available indices.";
    }
  
    callback(res);
}

module.exports = spider;