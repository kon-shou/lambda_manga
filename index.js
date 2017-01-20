"use strict";
const request = require("request");
const cheerio = require('cheerio');

exports.handler = (event, context, callback) => {
  request(
    {
		  uri: "http://sinkan.net/?action_rss=true&uid=28644&mode=schedule&key=15b8d46e062b05adf08bcf457b0eb5c3",
	  }, 
    function(error, response, body) {
      const $ = cheerio.load(body);
      $("channel > item").each(function() { //パースした内容にはjQuery風のセレクタでアクセスできる
			  let productInfo = $(this).find("pubDate");
			  let productInfoText = new Date(productInfo).getTime();
			  console.log(productInfoText);
		  });
    }
  );
};