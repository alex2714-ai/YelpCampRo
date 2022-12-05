import express from "express";
import catchAsync from "../utils/catchAsync.js";
import {
  deleteReview,
  renderReviewEditForm,
  updateReview,
  allReviews,
} from "../contollers/reviews.js";

import createReview from "../contollers/reviews.js";

import isLoggedIn, {
  hasReview,
  isReviewAuthor,
} from "../public/javascripts/middleware.js";
import { validateReview } from "../public/javascripts/middleware.js";

const router = express.Router({
  mergeParams: true,
});

//functions for review!!!!!!
router
  .route("/")
  .get(catchAsync(allReviews))
  .post(isLoggedIn, hasReview, validateReview, catchAsync(createReview));

router.get(
  "/:reviewId/edit",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(renderReviewEditForm)
);

router
  .route("/:reviewId")
  .put(isLoggedIn, validateReview, isReviewAuthor, catchAsync(updateReview))
  .delete(isLoggedIn, isReviewAuthor, catchAsync(deleteReview));

export default router;
