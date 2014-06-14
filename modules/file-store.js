/**
 * Created by AlinC on 6/12/14.
 */



// CONSTANTS
var AMAZON_BUCKET_NAME = 'booksin3d';
var AMAZON_BUCKET_URL = "http://s3-eu-west-1.amazonaws.com/" + AMAZON_BUCKET_NAME + "/";
var AWS_PROXY_URL = "/book-cover/";
var FILE_TYPE = ".png";


var request = require("request");
var AWS = require('aws-sdk');
var s3 = new AWS.S3();


exports.getCoverUrl = function (isbn) {
    return AWS_PROXY_URL + isbn;
};

exports.getCoverUrlFromAmazon = function (isbn) {
    return AMAZON_BUCKET_URL + isbn + FILE_TYPE;
};

exports.storeBookCover = function (url, isbn, callback) {
    downloadImage(url, function (err, img) {
        if (err) {
            console.log(err);
        }
        else {
            putImageToAws(img, isbn, callback);
        }
    });
};

exports.downloadImage = function (url, callback) {
    downloadImage(url, callback);
};

function downloadImage(url, callback) {
    var requestParams = {
        url: url,
        encoding: null
    };

    request(requestParams, function (err, response, body) {
        callback(err, body);
    });
}

function putImageToAws(data, filename, callback) {
    var params = {
        Bucket: AMAZON_BUCKET_NAME,
        Key: filename + ".png",
        ContentLength: data.length,
        Body: data,
        ACL: 'public-read'
    };

    s3.putObject(params, function (err, rsp) {
        if (callback) {
            callback(err, rsp);
            return;
        }

        if (err) {
            console.log(err);
        }
    });
}


