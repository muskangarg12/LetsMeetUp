module.exports = {                                        
    checkLoggedIn: (req, res, next) => {                  //To authenticate if a person is logged-in or not before accessing a route
        if (req.user)                                     // using passport
            return next();

        req.flash("error", "You must be Logged in to do that!");
        res.redirect("/");
    }
};
