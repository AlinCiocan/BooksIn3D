/**
 * Created by AlinC on 1/22/14.
 */

var OAuth = require("oauth").OAuth;

exports.index = function(req, res){
    console.log("GOODREADS!!");


    res.render('goodreads', { title: 'Goodreads' });
};