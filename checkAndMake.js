/*
 Treehouse Web Scraper Proj

 Module that checks for the existence of a directory or file,
 and then makes directory or creates call back for creating a file 
*/

"use strict";

const fs = require("fs");

/* 
  Check if directory exists in root of project
  If not, create it 
  @param: directory name
*/

function doDir(dirName, callback) {
	let dirContents = fs.readdirSync("./");
	if (dirContents.indexOf(dirName) === -1) {
		fs.mkdirSync("./" + dirName);
	}
	callback();
};


/* 
  Check if file exists in dir of your choice
  If so, delete it 
  @param: file name
  @param: directory name
*/

function doFile(fileName, dir, callback) {
	let dirContents = fs.readdirSync(dir);
	if (dirContents.indexOf(fileName) !== -1) {
		fs.unlinkSync(dir + "/" + fileName);
	}
	callback();
};

module.exports.doDir = doDir;
module.exports.doFile = doFile;
