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
app.get('/', routes.index);
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
var oa = new OAuth(requestTokenUrl,
    accessTokenUrl,
    key,
    secret,
    "1.0",
    callbackAddress,
    "HMAC-SHA1"
);

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
        // asynchronous verification, for effect...
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

app.get("/login", function(req,res){
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
