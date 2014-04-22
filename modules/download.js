/**
 * Created by aciocan on 4/22/2014.
 */
var fs = require("fs");
var request = require("request");
var COVERS_PATH = ".\\public\\booksCovers\\";

exports.getCoverPath = function () {
    return COVERS_PATH.replace("\\public", "");
};

exports.saveImage = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log("Downloaded: ", uri);
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(COVERS_PATH + filename)).on('close', callback);
    });
};





