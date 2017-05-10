
checkUser = function(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect(301, '/login');
  }
}
