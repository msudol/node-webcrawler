/***  spider.js ***/

'use strict';

// required modules

// chalk - https://www.npmjs.com/package/chalk
const chalk = require('chalk');

// cheerio for it's parsing API
const cheerio = require('cheerio');

// simplecrawler - https://www.npmjs.com/package/simplecrawler
let Crawler = require("simplecrawler");

// spider class wraps an instance of crawler
function spider(url, maxDepth) {

    var self = this;

    let crawler = new Crawler(url);

    // testing cache
    crawler.cache = new Crawler.cache('./cache');

    // first page and discovered links - maxDepth 2
    crawler.maxDepth = maxDepth;

    /*** Do we want to move all configuration values to the config.js and the spider instance? ***/

    // set to true to keep on targetURL only
    crawler.filterByDomain = false;

    // some other settings 
    crawler.interval = 250;
    crawler.maxConcurrency = 5;

    // response body for true, raw buffer for false
    crawler.decodeResponses = true;

    // parse links inside comments?
    crawler.parseHTMLComments = false;

    // dont download unsupported mime-types
    crawler.downloadUnsupported = false;

    crawler.on("crawlstart", function() {
        console.log("Crawling started!");
    });

    // event for fetch complete
    crawler.on("fetchcomplete", function(queueItem, responseBody, response) { 
        console.log("> %s (%d bytes) %s", queueItem.url, responseBody.length, response.headers['content-type']);

        // store this?

    });

    // When a discovery has completed - whats the diff between fetch and disco???? none?
    crawler.on("discoverycomplete", function(queueItem, resources) {
        // queueitem = the item that represents the document for the discovered resources
        // resources - an array of discovered and cleaned urls
        
    });

    // Crawler is totally done
    crawler.on("complete", function() {
        
        // should probably write some data to storage or something

        let res = "> Done Crawling!";

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



module.exports = spider;