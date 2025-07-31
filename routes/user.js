const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

// SIGNUP
router.get("/signup", userController.renderSignupForm);
router.post("/signup", wrapAsync(userController.signup));

// LOGIN


router.get("/login", userController.renderLoginForm);
router.post("/login", saveRedirectUrl, async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid credentials!");
      return res.redirect("/login");
    }

    if (user.isBlocked) {
      req.flash("error", "You are restricted by authority. Please create a new account.");
      return res.redirect("/login");
    }

    req.login(user, (err) => {
      if (err) return next(err);

      req.flash("success", "Welcome back!");

      if (user.isAdmin) {
        req.session.role = "admin";
        return res.redirect("/admin/dashboard");
      } else {
        req.session.role = "user";
        return res.redirect("/listings");
      }
    });
  })(req, res, next);
});




// LOGOUT
router.get("/logout", userController.logout);




module.exports = router;
