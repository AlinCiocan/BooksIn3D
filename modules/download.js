/**
 * Created by aciocan on 4/22/2014.
 */
var fs = require("fs");
var request = require("request");
var COVERS_PATH = ".\\public\\booksCovers\\";

exports.getCoverPath = function () {
    return COVERS_PATH.replace("\\public", "");
};

function downloadImage(uri, filePath) {
    request(uri).pipe(fs.createWriteStream(filePath)).on('close', function (err) {
        if (err) console.log(err);
    });
}

function ifFileNotFound(filePath, callback) {
    fs.stat(filePath, function (err) {
        if (err) {
            callback();
        }
    });
}


exports.saveImage = function (uri, filename) {
    var filePath = COVERS_PATH + filename;

    ifFileNotFound(filePath, function () {
        downloadImage(uri, filePath);
    });
};





