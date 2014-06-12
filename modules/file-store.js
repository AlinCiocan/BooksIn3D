/**
 * Created by AlinC on 6/12/14.
 */

var fs = require("fs");
var request = require("request");
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var COVERS_PATH = ".\\public\\booksCovers\\ISBN0439785960.png";
exports.testAws = function (req, res) {

    var uri = "http://news.softpedia.com/images/news2/Google-Book-Scanning-Targeted-Amazon-2.png";

    var requestParams = {
        url: uri,
        encoding: null
    };

    request(requestParams, function (err, response, body) {
        if (err) {
            console.log(err);
            res.send(JSON.stringify(err));
        } else {
            putImageToAws(body,res);
        }
    });
    /*
     var params = {
     Bucket: 'booksin3d', // required
     Key: 'ISBN0321498828.png' // required
     };


     s3.getObject(params, function(err, data) {
     if (err) {
     console.log(err, err.stack);
     res.send("An error occured: " + JSON.stringify(err));
     }
     });*/

};



function putImageToAws(body, res) {
    var params = {
        Bucket: 'booksin3d', // required
        Key: 'google-book.png', // required
        ContentLength : body.length,
        Body          : body,
        ACL: 'public-read'
    };

    s3.putObject(params, function(err, data) {
       if(err) {
           res.send("an error occured to aws: " + JSON.stringify(err));
       } else {
           res.send("Added to aws s3 image");
       }
    });
}