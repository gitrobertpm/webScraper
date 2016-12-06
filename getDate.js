/*
 Treehouse Web Scraper Proj

 Module for getting the time and returning a formatted time string
*/

"use strict";

module.exports = function() {
	
	let date = new Date();

	let year = date.getFullYear();
	let month = (date.getMonth() < 10) ? "0" + date.getMonth() : date.getMonth();     // starts at 0
	let formattedMonth = (Number(month) + 1) + "";
	let day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();      // returns the day of month
	let hour = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
	let minute = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
	
	let timeString = year + "-" + formattedMonth + "-" + day + " " + hour + ":" + minute;
	
	return timeString;
}