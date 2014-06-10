/**
 * Created by aciocan on 4/22/2014.
 */
var pg = require("pg");
var download = require("./download");

var connectionString = "postgres://postgres:1234@localhost:5433/booksin3d";


var connection = (function () {
    return {
        query: function (stringQuery, callback,parametersArray) {
            pg.connect(connectionString, function (err, client, done) {
                if (err) {
                    return console.error('error fetching client from pool', err);
                }
                client.query(stringQuery, parametersArray, function (err, result) {
                    //call `done()` to release the client back to the pool
                    done();

                    callback(err, result);
                });
            });
        }
    };

})();


exports.testPg = function (req,res) {
    connection.query("SELECT * FROM users", function(err, result) {
        if(err) {
            console.log("error from testpg", err);
            res.send("Failed connection to database");
        }
        res.send("It works connection to database.")
    });
};

exports.addUserInDb = function (user, callback) {
    connection.query("INSERT INTO users(goodreadsid,displayname) VALUES ('" + user.id + "','" + user.displayName + "')", function (err, result) {
        if (err) {
            console.log(err);
        }
    });
};

exports.getBooksFromDb = function (userid, callback) {
    var query = connection.query("SELECT B.bookisbn, B.pages FROM books B, users_books U " +
        "WHERE U.bookisbn = B.bookisbn AND U.goodreadsid ='" + userid + "'", function (err, result) {
        if (err) {
            console.log(err);
            callback(null);
        }

        var books = [];
        for (var i = 0; i < result.rows.length; i++) {
            books.push({
                imageUrl: (download.getCoverPath() + result.rows[i].bookisbn + ".png").replace("\\", "/"),
                pages: result.rows[i].pages
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

        connection.query("INSERT INTO books(bookisbn,pages) VALUES('" + bookisbn + "', '" + pages + "')", handleInsert);
        connection.query("INSERT INTO users_books(goodreadsid,bookisbn) VALUES(" + userid + ", '" + bookisbn + "')", handleInsert);



    }

    function handleInsert(err, result) {
        if (err) console.log(err);
    }

};


exports.isUserInOurDB = function (user, callback) {
    connection.query("SELECT * FROM users WHERE goodreadsid=" + user.id, function (err, result) {
        if (result && result.rows && result.rows.length > 0) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

