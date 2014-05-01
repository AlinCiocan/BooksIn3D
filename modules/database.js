/**
 * Created by aciocan on 4/22/2014.
 */
var mysql = require("mysql");
var download = require("./download");

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: "booksin3d"
});
connection.connect();


exports.getBooksFromDb = function (userid, callback) {
    var query = connection.query("SELECT B.bookisbn, B.pages FROM books B, users_books U " +
        "WHERE U.bookisbn = B.bookisbn AND U.goodreadsid ='" + userid + "'", function (err, result) {
        if (err) {
            console.log(err);
            callback(null);
        }

        var books = [];
        for (var i = 0; i < result.length; i++) {
            books.push({
                imageUrl: (download.getCoverPath() + result[i].bookisbn + ".png").replace("\\", "/"),
                pages: result[i].pages
            });
        }

        callback(books);

    });
};


exports.addInDatabaseBooks = function (books, coversURL, userid) {

    var coverLength = coversURL.length, bookisbn, coverurl, pages;
    for (var i = 0; i < coverLength; i++) {
        bookisbn = books[i].isbn;
        pages = books[i].pages;
        coverurl = coversURL[i];

        download.saveImage(coverurl, bookisbn + ".png");

        connection.query("INSERT INTO users_books(goodreadsid,bookisbn) VALUES(" + userid + ", '" + bookisbn + "')", handleInsert);
        connection.query("INSERT INTO books(bookisbn,pages) VALUES('" + bookisbn + "', '" + pages + "')", handleInsert);
    }

    function handleInsert(err, result) {
        if (err) console.log(err);
    }

};


exports.isUserInOurDB = function (user, callback) {
    connection.query("SELECT * FROM users WHERE goodreadsid=" + user.id, function (err, result) {
        if (result && result.length > 0) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

exports.addUserInDb = function (user, callback) {
    connection.query("INSERT INTO users(goodreadsid,displayname) VALUES ('" + user.id + "','" + user.displayName + "')", function (err, result) {
        if (err) {
            console.log(err);
        }
    });
};