/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var library = require('./routes/library');
var jsdomEnv = require('jsdom').env;
var http = require('http');
var path = require('path');

/* DATABASE CONNECTION */
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: "booksin3d"
});
connection.connect();

/*connection.query('SELECT * FROM users', function(err, rows, fields) {
 if (err) throw err;

 console.log('The solution is: ', rows[0].userid, rows[0].goodreads_id);
 });*/


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: "bigSecret"}));
var passport = require('passport'),
    util = require('util'),
    GoodreadsStrategy = require('passport-goodreads').Strategy;
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


// Routes
app.get('/', function (req, res) {
    var isLogged = (req.user) ? true : false;
    if (isLogged) {
        getUserIdFromDb(req.user, function (userid) {
            if (userid) {
                req.session.userid = userid;
            } else {
                addUserInDb(req.user, function (userid) {
                    req.session.userid = userid;
                });
            }
        });
    }
    // render the page
    res.render('index', { title: 'Books in 3D', logged: isLogged, user: req.user});


    function getUserIdFromDb(user, callback) {
        connection.query("SELECT * FROM users WHERE goodreadsid=" + user.id, function (err, result) {
            if (result && result.length > 0) {
                callback(result[0].userid);
            } else {
                callback(null);
            }
        });
    }

    function addUserInDb(user, callback) {
        connection.query("INSERT INTO users(goodreadsid,displayname) VALUES ('" + user.id + "','" + user.displayName + "')", function (err, result) {
            if (!err) {
                callback(result.insertId);
            } else {
                throw err;
            }
        });
    }

});

app.get('/library', library.index);


/* GOODREADS starts */

// GOODREADS constants
var OAuth = require("oauth").OAuth;
/* The key and the secret are here, just for debug, please get your own, form goodreads.com/api */
var key = "tOgmJWA6I7IyRZGP8WFFg";
var secret = "Vpd5h0WophG0hNqMXOVwZpkatAvOkoXlZOdIOROgwhI";

var requestTokenUrl = "http://www.goodreads.com/oauth/request_token";
var accessTokenUrl = "http://www.goodreads.com/oauth/access_token";
var authorizeTokenUrl = "http://www.goodreads.com/oauth/authorize";
var callbackAddress = "http://localhost:3000/goodreads";
var urlListOfBooks = "https://www.goodreads.com/review/list?format=xml&v=2&shelf=read&page=1&per_page=200&id=";
var googleBooksUrl = "http://books.google.com/books?jscmd=viewapi&bibkeys=";


app.get("/updateBooks", function (req, res) {
    var newOA = new OAuth(
        requestTokenUrl,
        accessTokenUrl,
        key,
        secret,
        "1.0",
        null,
        "HMAC-SHA1");

    newOA.get(
        urlListOfBooks + req.user.id,
        req.user.token,
        req.user.tokenSecret,
        parseBooks
    );

    function parseBooks(error, data, response) {
        var books = [];
        // first argument can be html string, filename, or url
        jsdomEnv(data, function (errors, window) {
            var htmlRsp = "";
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

            http.get(googleBooksUrl + booksISBNs.join(","),function (rsp) {
                var data = "";
                rsp.on("data", function (chunk) {
                    data += chunk;
                });
                rsp.on("end", function () {
                    var rspHTML = "";
                    var coversURL = [];
                    console.log("parsed data:", data);

                    data = data.substring("var _GBSBookInfo = ".length, data.lastIndexOf(";"));

                    console.log("data after substr", data);

                    data = JSON.parse(data);
                    for (var i = 0; i < booksISBNs.length; i++) {
                        var imgUrl = decodeURIComponent(data[booksISBNs[i]].thumbnail_url);
                        imgUrl = decreaseZoomAndRemoveCurl(imgUrl);
                        coversURL.push(imgUrl);

                        rspHTML += '<img src="' + imgUrl + '" > <br> <br>';

                    }
                    function decreaseZoomAndRemoveCurl(imgUrl) {
                        return imgUrl.replace(/zoom=[0-9]/, "zoom=1").replace("edge=curl", "edge=");
                    }

                    res.writeHead(200, {"Content-Type": "text/html"});
                    res.end(rspHTML);

                })

            }).on('error', function (e) {
                console.log("Got error: " + e.message);
            });

        });


    }


    /*here stop update books*/
});

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new GoodreadsStrategy({
        consumerKey: key,
        consumerSecret: secret,
        callbackURL: "http://localhost:3000/auth/goodreads/callback"
    },
    function (token, tokenSecret, profile, done) {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));
app.get('/auth/goodreads/callback',
    passport.authenticate('goodreads', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/auth/goodreads',
    passport.authenticate('goodreads'),
    function (req, res) {
        // The request will be redirected to Goodreads for authentication, so this
        // function will not be called.
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get("/login", function (req, res) {
    res.redirect("/auth/goodreads");
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

/* GOODREADS end */


// server
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
