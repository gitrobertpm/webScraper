/*
Treehouse Web Scraper Proj
*/

"use strict";

const fs = require("fs");
const colors = require("colors/safe");
const checkAndMake = require('./checkAndMake');
const getDate = require('./getDate');
const scrapeIt = require("scrape-it");
const async = require("async");
const json2csv = require('json2csv');
const schedule = require('node-schedule');


// Problem: Uses third praty library to scrapes daily data from website and stores data into CSV file created by third party library
//Solution: 
// - runs every day
// - creates "data" folder if it doesn't exist

// - use third party library to scrape - why this one?
// - scrape http://shirts4mike.com
	// 
// - get price, title, url, image from product page and save to CSV

// - store data in CSV file nemd for the date, use third party library for creating CSV - why?
// - column headers - title, price, imageURL, URl, and time of scrapping
// - error if sight is down
// - overwrite current data if exsts
// - well documented


const mainURL = "http://shirts4mike.com";
const mainURI = "/shirts.php";

// Data Holders
var shirtURIs = [];
var shirtURLs = [];
var shirtTitles = [];
var shirtImgs = [];
var shirtPrices = [];
var fields = ["Title", "Price", "ImageURL", "URL", "Time"];
var results = [{}, {}, {}, {}, {}, {}, {}, {}];


// Set up scheduler
let rule = new schedule.RecurrenceRule();
let d = new Date();
rule.hour = d.getHours();
rule.minute = d.getMinutes() + 1;
console.log(colors.green("Scraping begins at the next tick of the minute hand, " + colors.red((d.getMinutes() + 1)) + " minutes passed the hour\nand again everday at this time"));

// Begin scraping job at the next tic of the minute hand
schedule.scheduleJob(rule, function(){
	console.log(colors.cyan("Scraping has begun"));
	
	// Scrape intial data and prepare for second set of asynchronous scrapes
	mainScraper((err) => {
		if (err) throw (err);
		
		// scrape shirt prices from individual shirt pages
		async.eachSeries(shirtURLs, (item, callback) => {
			syncedScraper(item, (err) => {
				if (err) throw (err);
				callback();
			});

		}, (err) => {
			if (err) throw (err);
			
			// Take stored data from scraping and organize it into an nicely formatted object
			populateResults((err) => {
				if (err) throw (err);
				
				// Empty storage arrays for next use
				shirtURIs = [];
				shirtURLs = [];
				shirtTitles = [];
				shirtImgs = [];
				shirtPrices = [];
				
				// Check for "data" directory, if none exists, make one
				checkAndMake.doDir("data", (err) => {
					if (err) throw (err);
					
					// Setup csv creation
					let csv = json2csv({ data: results, fields: fields });
					let title = new Date().toISOString().substr(0,10);
					
					// chekc for already existing csv with same title
					checkAndMake.doFile(title + ".csv", "data", (err) => {
						if (err) throw (err);
						
						// Create csv
						fs.writeFile("./data/" + title + ".csv", csv, (err) => {
							if (err) throw err;
							console.log(colors.green('file saved'));
							
							// Empty results object for next use
							results = [{}, {}, {}, {}, {}, {}, {}, {}];
						});
					});	
				});
			});
		});
	});
});


// Helper function to handle intial scrape and provide callback functionality
function mainScraper(callback) {
	
	// Fetch the shirt links, img urls, and shirt titles from the shirts page
	scrapeIt(mainURL + mainURI, {
		shirtLinks: {
			listItem: ".products li",
			name: "shirtLinks",
			data: {
				href: {
				selector: "a",
				attr: "href"
				},
				title: {
				selector: "img",
				attr: "alt"
				},
				img: {
				selector: "img",
				attr: "src"
				}
			}
		}

	}, (err, page) => {
		if (err) throw (err);
		
		// Push shirt titles, shirt urls, img urls to arrays for temporary storage
		page.shirtLinks.forEach((vally, indy, arry) => {
			shirtURIs.push(vally.href);
			shirtURLs.push(mainURL + "/" + vally.href);
			shirtTitles.push(vally.title);
			shirtImgs.push(mainURL + "/" + vally.img);
		});
		
		callback();
	});
}
	

function syncedScraper(item, callback) {
	
	// Fetch the shirt prices from the indivudal shirt pages
	scrapeIt(item, {
	    shirtPrice: {
		selector: "span.price",
		name: "shirtPrice",
		price: {
			selector: "span.price",
			how: "html"
			}
		}

	}, (err, page) => {
		if (err) throw (err);
		
		// Push shirt prices to array for temporary storage
		shirtPrices.push(page.shirtPrice);
		callback();
	});
}

// Take data from holding arrays and organize into usable object
function populateResults(callback) {
	shirtTitles.forEach((vally, indy, arry) => {
		results[indy].Title = vally;
		results[indy].Price = shirtPrices[indy];
		results[indy].ImageURL = shirtImgs[indy];
		results[indy].URL = shirtURLs[indy];
		results[indy].Time = getDate();
	});
	callback();
}
