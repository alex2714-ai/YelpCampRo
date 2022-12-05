import express from "express";
import passport from "passport";
import catchAsync from "../utils/catchAsync.js";
import renderRegister from "../contollers/users.js";
import { checkReturnTo } from "../public/javascripts/middleware.js";

import {
  register,
  renderLoginForm,
  login,
  logout,
} from "../contollers/users.js";

const router = express.Router();

router.route("/register").get(renderRegister).post(catchAsync(register));

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    checkReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "login",
    }),
    login
  );

router.get("/logout", logout);

export default router;
