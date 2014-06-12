/**
 * Module dependencies.
 */

var isDebugMode = (process.env.DATABASE_URL) ? false : true;


var localUrl = "http://localhost:3000";
var liveUrl = "http://booksin3d.herokuapp.com/";
var BASE_URL = (isDebugMode) ? localUrl : liveUrl;

var express = require('express');
var database = require("./modules/database");
var http = require('http');
var path = require('path');
var books = require("./modules/books");

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
//app.use(cors());
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
app.get("/testpg",function(req,res) {
    database.testPg(req,res);
});



app.get('/', function (req, res) {
    var isLogged = (req.user) ? true : false;
    if (isLogged) {
        database.isUserInOurDB(req.user, function (rsp) {
            if (rsp == false) {
                database.addUserInDb(req.user);
            }
        });
    }

    res.render('index', { title: 'Books in 3D', logged: isLogged, user: req.user, baseUrl: BASE_URL});
});

app.get('/library', ensureAuthenticated, function (req, res) {
    var userId = req.user.id;
    database.getBooksFromDb(userId, function (books) {
        if (!books) books = [];
        res.render('library', { title: 'Express', books: books});

    });
});

app.get('/library/:id', function (req, res) {

    var userid = req.params.id;
    database.getBooksFromDb(userid, function (books) {
        if (!books) books = [];
        res.render('library', { title: 'Express', books: books});

    });
});



// GOODREADS constants
var OAuth = require("oauth").OAuth;
/* The key and the secret are here, just for debug, please get your own, form goodreads.com/api */
var key = "tOgmJWA6I7IyRZGP8WFFg";
var secret = "Vpd5h0WophG0hNqMXOVwZpkatAvOkoXlZOdIOROgwhI";

var requestTokenUrl = "http://www.goodreads.com/oauth/request_token";
var accessTokenUrl = "http://www.goodreads.com/oauth/access_token";
var authorizeTokenUrl = "http://www.goodreads.com/oauth/authorize";
var callbackAddress = BASE_URL + "/goodreads";
var urlListOfBooks = "https://www.goodreads.com/review/list?format=xml&v=2&shelf=read&page=1&per_page=200&id=";


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
        function (error,data ) {
          return books.getBooks(error, data, req.user.id, res);
        }
    );

});

/* GOODREADS starts */


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new GoodreadsStrategy({
        consumerKey: key,
        consumerSecret: secret,
        callbackURL: BASE_URL + "/auth/goodreads/callback"
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