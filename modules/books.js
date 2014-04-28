/**
 * Created by aciocan on 4/22/2014.
 */

var jsdomEnv = require('jsdom').env;
var database = require("./database");
var http = require("http");
var async = require("async");


var googleBooksUrl = "http://books.google.com/books?jscmd=viewapi&bibkeys=";

function decreaseZoomAndRemoveCurl(imgUrl) {
    return imgUrl.replace(/zoom=[0-9]/, "zoom=1").replace("edge=curl", "edge=");
}

function googleBooksReq(isbns, books, userId) {
    http.get(googleBooksUrl + isbns.join(","), function (rsp) {
        var data = "";

        rsp.on("data", function (chunk) {
            data += chunk;
        });


        rsp.on("end", function () {
            var coversURL = [];
            data = data.substring("var _GBSBookInfo = ".length, data.lastIndexOf(";"));
            data = JSON.parse(data);
            for (var i = 0; i < isbns.length; i++) {
                if (data[isbns[i]]) {
                    var imgUrl = decodeURIComponent(data[isbns[i]].thumbnail_url);
                    imgUrl = decreaseZoomAndRemoveCurl(imgUrl);
                    coversURL.push(imgUrl);
                }
            }
            database.addInDatabaseBooks(books, coversURL, userId);
        });

    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}


exports.getBooks = function (error, data, userId, res) {
    var books = [];


    // first argument can be html string, filename, or url
    jsdomEnv(data, function (errors, window) {
        var $ = require('jquery')(window);
        $("reviews").find("book").children("isbn").each(function (i, elem) {
            var isbn = elem.innerHTML;
            var num_pages;
            if (isbn.length < 20) {
                try {
                    num_pages = parseInt($(elem).siblings("num_pages")[0].innerHTML, 10);
                    num_pages = (isNaN(num_pages)) ? 250 : num_pages;
                } catch (e) { // do nothing
                }
                books.push({
                    isbn: "ISBN" + isbn,
                    pages: num_pages || 250 // if is null, then should be 250
                });
                console.log("book:" + i + " -> " + isbn + " -> " + num_pages);
            }
        });

        var booksISBNs = [];
        for (var i = 0; i < books.length; i++) {
            booksISBNs.push(books[i].isbn);
        }

        var googleRequestsTasks = [];
        var ISBNs_PER_REQUEST = 10;
        while (booksISBNs.length > 0) {

            var requestISBNs = booksISBNs.splice(0, ISBNs_PER_REQUEST);
            var requestBooks = books.splice(0, ISBNs_PER_REQUEST);
            (function (isbns, books) {
                googleRequestsTasks.push(function (callback) {
                    googleBooksReq(isbns, books, userId);
                    console.log("before callback");
                    callback();
                    console.log("after callback");
                });

            })(requestISBNs, requestBooks);
        }

        async.series(googleRequestsTasks, function () {
            console.log("final callback");
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end("ok");
        });

    });
};