/**
 * Created by aciocan on 4/22/2014.
 */

var jsdomEnv = require('jsdom').env;
var database = require("./database");
var http = require("http");

var googleBooksUrl = "http://books.google.com/books?jscmd=viewapi&bibkeys=";

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

        http.get(googleBooksUrl + booksISBNs.join(","), function (rsp) {
            var data = "";
            rsp.on("data", function (chunk) {
                data += chunk;
            });
            rsp.on("end", function () {
                var coversURL = [];
                console.log("parsed data:", data);

                data = data.substring("var _GBSBookInfo = ".length, data.lastIndexOf(";"));

                console.log("data after substr", data);

                data = JSON.parse(data);
                for (var i = 0; i < booksISBNs.length; i++) {
                    if (data[booksISBNs[i]]) {
                        var imgUrl = decodeURIComponent(data[booksISBNs[i]].thumbnail_url);
                        imgUrl = decreaseZoomAndRemoveCurl(imgUrl);
                        coversURL.push(imgUrl);
                    }
                }


                database.addInDatabaseBooks(books, coversURL, userId);

                res.writeHead(200, {"Content-Type": "text/html"});
                res.end("ok");

                function decreaseZoomAndRemoveCurl(imgUrl) {
                    return imgUrl.replace(/zoom=[0-9]/, "zoom=1").replace("edge=curl", "edge=");
                }

            })

        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });

    });
};