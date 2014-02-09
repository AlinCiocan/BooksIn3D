/*
 * GET home page.
 */

exports.index = function (req, res) {
    var isLogged = (req.user) ? true : false;
    res.render('index', { title: 'Books in 3D', logged: isLogged, user: req.user});
};