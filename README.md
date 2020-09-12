# node-webcrawler
As a school assignment, develop a utility to crawl a website that will fetch the index page and perform a series of defined actions with the data.

## Installing & Running
Installation requires Node.js to be installed as a pre-requisite. Visit https://nodejs.org 

1. Clone project source into a directory
2. Run command > npm install
3. NPM the Node Package Manager will setup node-passgen and any depenendcies
4. Run command > node app

Running the app will initially display a user menu with the following options:

* start: start the spider for the target website
* pages: show index of all crawled pages
* word [str]: find all pages with word [str] and how many
* read [int]: read a text content snippet of page [int]  
* listlinks [int]: list all the links foud in page [int] 
* quit: close this program 

Run start to begin crawling the target website configured in config.js. It will get all the valid links on the first page, displaying them in a realtime CLI feed. 

It will then visit each link and pull the page content and all the valid links on those pages, and then will stop indexing.

### Commands

#### start

Executing start will run the crawler, wiping out the previous index of pages and creating a new one from the most recent data if start has been run already. If start is not run, the other commands will tell you to run start first.

#### pages

Use pages to show an index of all crawled pages in the order they were discovered. This index is preceded by an ID number that you can use in other commands.

#### word [str]

Execute word with a string argument and it will retrieve all the pages where that word appears with a count of how many times it appears. Word search is indexed and search without case-sensitivty. 

Additionally compound words and conjunctions are indexed as a single word as best as possible using a complex Regular Expression match, take the following example:

![Alt text](/cmd-word-regex.jpg?raw=true "Example of the word commands indexing to capture complex words")

#### read [int]

Read a parsed webpage contents where html is stripped, links are inlined, and images are denoted as [image]. Needless to say, it is not the best look but just image this is how the web looked in the days of Lynx before Netscape came out!

#### listlinks [int]

Choose a page and list all the links that were discovered by the crawler on that page.

## Libraries

node-webcrawler makes use of several libraries to fetch websites, parse through the content and display it in the CLI.

### simplecrawler 

https://www.npmjs.com/package/simplecrawler

simplecrawler is designed to provide a basic, flexible and robust API for crawling websites. It was written to archive, analyse, and search some very large websites and has happily chewed through hundreds of thousands of pages and written tens of gigabytes to disk without issue.

### cheerio 

https://www.npmjs.com/package/cheerio

Tiny, fast, and elegant implementation of core jQuery designed specifically for the server.

### html-to-text 

https://www.npmjs.com/package/html-to-text

An advanced converter that parses HTML and returns beautiful text. It was mainly designed to transform HTML E-Mail templates to a text representation. 

## Screenshots

![Alt text](/cmd-start.jpg?raw=true "Starting the cralwer and getting discovery feedback")

![Alt text](/cmd-pages.jpg?raw=true "Displaying the index of pages with pages command")

![Alt text](/cmd-listlinks.jpg?raw=true "List all the links discovered on a specific page")

![Alt text](/cmd-word.jpg?raw=true "Searching for a term throughout the entire site")

