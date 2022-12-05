import mongoose from "mongoose";
import Campground from "../../models/campGround.js";
import campgroundSchema from "../../schemas.js";
import { reviewSchema } from "../../schemas.js";
import Review from "../../models/reviews.js";
import ExpressError from "../../utils/ExpressError.js";

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

export const isValidCampground = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new ExpressError("Invalid Id", 400));
  }
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  next();
};

export const validateImg = (req, res, next) => {
  const size = req.headers["content-length"] / 1024 / 1024;

  if (size > 2) {
    // req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
};

export const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

export const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.locals.foundCampground = campground;
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

export const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  res.locals.foundReview = review;
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

export const hasReview = async (req, res, next) => {
  const { id } = req.params;

  const campground = await Campground.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  });
  if (campground.reviews.length > 0) {
    for (let review of campground.reviews) {
      if (review.author.equals(req.user._id)) {
        req.flash("error", "You can't post another review!");
        return res.redirect(`/campgrounds/${id}`);
      }
    }
  }
  next();
};

export const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

export const checkReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

export default isLoggedIn;
