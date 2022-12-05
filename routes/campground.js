import express from "express";
import catchAsync from "../utils/catchAsync.js";
import index from "../contollers/campgrounds.js";
import multer from "multer";

import { storage } from "../cloudinary/index.js";

import {
  renderNewForm,
  showCampground,
  renderEditForm,
  createCampground,
  updateCampground,
  deleteCampground,
} from "../contollers/campgrounds.js";

import isLoggedIn from "../public/javascripts/middleware.js";
import {
  validateCampground,

} from "../public/javascripts/middleware.js";
import { isAuthor } from "../public/javascripts/middleware.js";
import { isValidCampground } from "../public/javascripts/middleware.js";
import ExpressError from "../utils/ExpressError.js";

const upload = multer({
  storage,
  limits: {
    fileSize: 500000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new ExpressError("Only .png, .jpg and .jpeg format allowed!", 400)
      );
    }
  },
});

export const uploadFile = (req, res, next) => {
  const uploadProcess = upload.array("image");

  uploadProcess(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      req.flash("error", "File is to large!");
      return res.redirect("/campgrounds/new");
    } else if (err) {
      return next(new ExpressError(err, 500));
    }
    next();
  });
};

const router = express.Router();

router.route("/filter").post(catchAsync(index));

router
  .route("/")
  .get(catchAsync(index))
  .post(
    isLoggedIn,
    uploadFile,
    validateCampground,
    catchAsync(createCampground)
  );

router.get("/new", isLoggedIn, renderNewForm);
router.get(
  "/:id/edit",
  isValidCampground,
  isLoggedIn,
  isAuthor,
  catchAsync(renderEditForm)
);

router
  .route("/:id")
  .get(isValidCampground, catchAsync(showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    uploadFile,
    validateCampground,
    catchAsync(updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground));

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
//     const {
//         id
//     } = req.params
//     await Campground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted campground!')
//     res.redirect('/campgrounds');
// }))

export default router;
