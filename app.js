/**
 * node-webcrawler - As a school assignment, develop a utility to crawl a website that will fetch the index page and perform a series of defined actions with the data.
 * @license MIT
 *
 *  https://github.com/msudol/node-webcrawler
 */
 
'use strict';

// get config values
const config = require('./config/config.js');

// because I want the CLI to look good
const colorReadline = require('node-color-readline');
const chalk = require('chalk');
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


// cheerio for it's parsing API
const cheerio = require('cheerio');

// simplecrawler - https://www.npmjs.com/package/simplecrawler
const Crawler = require("simplecrawler");

// init crawler and set target url from config
const crawler = new Crawler(config.targetURL);

// first page and discovered links - maxDepth 2
crawler.maxDepth = config.maxDepth;

/*** Do we want to move all configuration values to the config.js? ***/

// set to true to keep on targetURL only
crawler.filterByDomain = false;

// some other settings 
crawler.interval = 250;
crawler.maxConcurrency = 5;

// response body for true, raw buffer for false
crawler.decodeResponses = true;

crawler.on("crawlstart", function() {
    console.log("Crawling started!");
});

// event for fetch complete
crawler.on("fetchcomplete", function(queueItem, responseBody, response) {
    console.log("> %s (%d bytes) %s", queueItem.url, responseBody.length, response.headers['content-type']);
});

// When a discovery has completed - whats the diff between fetch and disco???? none?
crawler.on("discoverycomplete", function(queueItem, resources) {
    // queueitem = the item that represents the document for the discovered resources
    // resources - an array of discovered and cleaned urls
    
});



// overwriting the discoverResources method
crawler.discoverResources = function(buffer, queueItem) {
    var $ = cheerio.load(buffer.toString("utf8"));
 
    return $("a[href]").map(function () {
        return $(this).attr("href");
    }).get();
};


// run the crawler
crawler.start();