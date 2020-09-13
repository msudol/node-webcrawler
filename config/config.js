// config.js

'use strict';

// Static config, do not edit
let config = {};

// CLI prefix
config.prefix = 'CMD> ';

// Crawler target
config.url = 'https://www.usatoday.com/';

// Crawler scan only domain or any domain
config.sameDomain = false;

// First page and discovered links from it are fetched
config.maxDepth = 2;

module.exports = config;