import Review from "../models/reviews.js";
import Campground from "../models/campGround.js";

import { calculateAverage } from "./campgrounds.js";

export const allReviews = async (req, res) => {
  const campgrounds = await Campground.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  });
  // console.log(campgrounds)
  res.render("campgrounds/allReviews", {
    campgrounds,
    title: "All Reviews",
  });
};

export const renderReviewEditForm = async (req, res) => {
  const { id, reviewId } = req.params;
  const campgrounds = await Campground.findById(id);

  const review = await res.locals.foundReview;
  res.render("campgrounds/reviewEdit", {
    campgrounds,
    review,
    title: "Edit review",
  });
  res.locals.campgrReview;
};

const createReview = async (req, res) => {
  const campgroundsReview = await Campground.findById(req.params.id).populate(
    "reviews",
    "rating"
  );

  const review = new Review(req.body.review);
  review.author = req.user._id;
  campgroundsReview.reviews.push(review);
  await review.save();

  // console.log(campgroundsReview.reviews.rating)
  campgroundsReview.rating = calculateAverage(campgroundsReview.reviews);
  await campgroundsReview.save();
  req.flash("success", "Successfully made a new review");
  res.redirect("/campgrounds/" + campgroundsReview.id);
};

export const updateReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findOneAndUpdate(
    res.locals.foundReview._id,
    {
      ...req.body.review,
    },
    {
      runValidators: true,
    }
  );
  const campgrounds = await Campground.findById(id).populate(
    "reviews",
    "rating"
  );
  campgrounds.rating = await calculateAverage(campgrounds.reviews);
  await campgrounds.save();
  req.flash("success", "Your review was successfully edited.");
  res.redirect("/campgrounds/" + campgrounds.id);
};

export const deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await res.locals.foundReview.deleteOne();
  const camp = await Campground.findByIdAndUpdate(id, {
    $pull: {
      reviews: reviewId,
    },
  }).populate("reviews", "rating");
  // await Review.findByIdAndDelete(reviewId);
  camp.rating = await calculateAverage(camp.reviews);

  await camp.save();

  req.flash("success", "Successfully deleted the review");
  res.redirect("/campgrounds/" + id);
};

export default createReview;
