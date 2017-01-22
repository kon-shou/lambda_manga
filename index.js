"use strict";

const AWS = require('aws-sdk');
const url = require('url');
const https = require('https');
const cheerio = require('cheerio');
const rp = require('request-promise');

// The base-64 encoded, encrypted key (CiphertextBlob) stored in the kmsEncryptedHookUrl environment variable
const kmsEncryptedHookUrl = process.env.kmsEncryptedHookUrl;
// The Slack channel to send a message to stored in the slackChannel environment variable
const slackChannel = process.env.slackChannel;
let hookUrl;
let pubTitleArr = [];
let pubLinkArr = [];
let pubLink = [];
let pubDate = [];
let slackMessage;

const fetchOptions = {
    uri: 'http://sinkan.net/?action_rss=true&uid=28644&mode=schedule&key=15b8d46e062b05adf08bcf457b0eb5c3',
    transform: function (body) {
        let $ = cheerio.load(body ,{xmlMode : true});
        $("channel > item").each(function(i) {
			    pubTitleArr[i] = $(this).find("title").text();
          pubLinkArr[i] = $(this).find("link").text();
          console.log(pubTitleArr);
          console.log(pubLinkArr);
		    });
    }
};

function postMessage(message, callback) {
    const body = JSON.stringify(message);
    const Sendoptions = url.parse(hookUrl);
    Sendoptions.method = 'POST';
    Sendoptions.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
    };

    const postReq = https.request(Sendoptions, (res) => {
        const chunks = [];
        res.setEncoding('utf8');
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
            if (callback) {
                callback({
                    body: chunks.join(''),
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                });
            }
        });
        return res;
    });

    postReq.write(body);
    postReq.end();
}

function processEvent(event, callback) {
  for (let i = 0; i < pubTitleArr.length; i++) {
    slackMessage = {
        text: `${pubTitleArr[i]}\n${pubLinkArr[i]}`,
    };
    console.log(slackMessage);

    postMessage(slackMessage, (response) => {
        if (response.statusCode < 400) {
            console.info('Message posted successfully');
            callback(null);
        } else if (response.statusCode < 500) {
            console.error(`Error posting message to Slack API: ${response.statusCode} - ${response.statusMessage}`);
            callback(null);  // Don't retry because the error is due to a problem with the request
        } else {
            // Let Lambda retry
            callback(`Server error when processing message: ${response.statusCode} - ${response.statusMessage}`);
        }
    });
  }
}


function processEventWithHookUrl (event, callback) {
    if (hookUrl) {
        // Container reuse, simply process the event with the key in memory
        processEvent(event, callback);
    } else if (kmsEncryptedHookUrl && kmsEncryptedHookUrl !== '<kmsEncryptedHookUrl>') {
        const encryptedBuf = new Buffer(kmsEncryptedHookUrl, 'base64');
        const cipherText = { CiphertextBlob: encryptedBuf };

        const kms = new AWS.KMS();
        kms.decrypt(cipherText, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            hookUrl = data.Plaintext.toString('ascii');
            processEvent(event, callback);
        });
    } else {
        callback('Hook URL has not been set.');
    }
}

exports.handler = (event, context, callback) => {
    rp(fetchOptions)
    .then(function ($) {
        processEventWithHookUrl (event, callback);
    })
    .catch(function (err) {
        console.log("Error Fetch API");
    });
};
