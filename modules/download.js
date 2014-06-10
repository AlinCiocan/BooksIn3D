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
    console.log("right now dowloading: ", filePath, " url: ", uri);
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

    console.log("----->Trying to save: ", filePath, "uri: ", uri);
    ifFileNotFound(filePath, function () {
        console.log("----->Trying to save:222 ", filePath);
        downloadImage(uri, filePath);
    });
};





