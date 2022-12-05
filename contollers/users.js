import passport from "passport";
import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";

const renderRegister = (req, res) => {
  res.render("users/register", {
    title: "Create Your Account",
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({
      email,
      username,
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};
export const renderLoginForm = (req, res) => {
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  res.render("users/login");
};
export const login = (req, res) => {
  req.flash("success", "Welcome Back! " + req.user.username);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
};
export const logout = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("succes", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

export default renderRegister;
