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

    self.currentId = 0;

    // I have jsonfile but I could also just use memory now that we've got it smaller
    self.store = {};

    let crawler = new Crawler(url);

    // testing cache - nah
    //crawler.cache = new Crawler.cache('./cache');

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

    // I only want html content types
    crawler.addFetchCondition((queueItem, referrerQueueItem, callback) => {
       callback(null, queueItem.url.indexOf(".xml") < 1);
    });

    crawler.on("crawlstart", function() {
        console.log("Crawling started!");
    });

    // event for fetch complete
    crawler.on("fetchcomplete", function(queueItem, responseBody, response) { 
        
        console.log(">[%d] %s (%d bytes) %s", self.currentId + 1, queueItem.url, responseBody.length, response.headers['content-type']);

        // store this?
        let data = {};

        var $ = cheerio.load(responseBody);
        let linkarr = [];

        var links = $('a'); //jquery get all hyperlinks
        $(links).each(function(i, link){
            linkarr.push($(link).attr('href'));
        });


        data.links = linkarr;
        data.depth = queueItem.depth;
        data.id = queueItem.id;
        data.url = queueItem.url;
        data.responseBody = htmlToText.fromString(responseBody, {
            wordwrap: null,
            hideLinkHrefIfSameAsText: true,
            format: {
                image: function(elem, fn, options) {
                    return '[image]';
                }
            }

        });

        //console.log(data.responseBody);

        //jsonfile.writeFile(file, data, { flag: 'a' }, function (err) {
        //    if (err) console.error(err)
        //})      
        
        self.store[self.currentId] = data;
        self.currentId++;
        
    });

    // When a discovery has completed - whats the diff between fetch and disco???? none?
    crawler.on("discoverycomplete", function(queueItem, resources) {
        // queueitem = the item that represents the document for the discovered resources
        // resources - an array of discovered and cleaned urls
    });

    // Crawler is totally done
    crawler.on("complete", function() {
        
        // should probably write some data to storage or something
        jsonfile.writeFile(file, self.store, function (err) {
            if (err) console.error(err)
        }) 

        let items = Object.keys(self.store).length;
        let res = `> Done Crawling! Found ${items} valid items.`;

        // runs the "current callback", an ugly trick I learned years ago that works great in async or event controlled situtations 
        // as long as you're only waiting on this one event that is.
        self.crawlCompleteCallback(res);
        
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

spider.prototype.start = function(callback) {

    this.crawler.start();

    // a temporary space for a waiting callback that can be called after the event we are waiting for is finished... ugly, but works great
    this.crawlCompleteCallback = callback;

};

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
            res = "> Unknown index, try read [int].  Check 'links' for available indices.";
        }

    }
    
    callback(res);
}

module.exports = spider;