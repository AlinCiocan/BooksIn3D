/**
 * Created by AlinC on 1/22/14.
 */

exports.index = function(req, res){
    var goodreads = require("goodreads");

    res.render('library', { title: 'Express' });
};