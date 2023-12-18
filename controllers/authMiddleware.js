const isLoggedIn = (req, res, next) => {
  console.log("isLoggedIn middleware called")

  if (req.session.isAuth === "true") {

    return next();
  }


  res.redirect('/user/login');
};

module.exports = { isLoggedIn };
