const User = require("../models/user");
const passport = require("passport");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, confirmPassword, mobile } = req.body;

        if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match!");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username, mobile });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", "Email is already registered");
        res.redirect("/signup");
    }
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    // Blocked admin or user check
    if (req.user.isBlocked) {
        req.logout(() => {}); 
        req.flash("error", "You are blocked by a super admin.");
        return res.redirect("/login");
    }

    req.flash("success", "Welcome to Wanderlust! You are logged in!");

    if (req.user.isAdmin) {
        return res.redirect("/admin/dashboard");
    }

    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};





module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // Clear the role from session
    req.session.role = null;
    req.flash("success", "You are logged out!");
    res.redirect("/login");
  });
};
