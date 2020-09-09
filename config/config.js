// config.js

'use strict';

// Static config, do not edit
let config = {};

// CLI prefix
config.prefix = 'CMD> ';

// Crawler target
config.targetURL = 'https://www.usatoday.com/';

// First page and discovered links from it are fetched
config.maxDepth = 2;

module.exports = config;