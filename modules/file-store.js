/**
 * Created by AlinC on 6/12/14.
 */



// CONSTANTS
var AMAZON_BUCKET_NAME = 'booksin3d';
var AMAZON_BUCKET_URL = "http://s3-eu-west-1.amazonaws.com/" + AMAZON_BUCKET_NAME + "/";
var FILE_TYPE = ".png";


var request = require("request");
var AWS = require('aws-sdk');
var s3 = new AWS.S3();


exports.getCoverUrl = function (isbn) {
    return AMAZON_BUCKET_URL + isbn + FILE_TYPE;
};

exports.storeBookCover = function (url, isbn, callback) {
    downloadImage(url, function (img) {
        putImageToAws(img, isbn, callback);
    });
};


function downloadImage(url, callback) {
    var requestParams = {
        url: url,
        encoding: null
    };

    request(requestParams, function (err, response, body) {
        if (err) {
            console.log(err);
        } else {
            callback(body);
        }
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


