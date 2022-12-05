import Campground from "../models/campGround.js";
import cloudinary from "../cloudinary/index.js";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";

const mapToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({
  accessToken: mapToken,
});

const index = async (req, res) => {
  const filt = req.body.filter;

  const camp = await Campground.find({});
  if (req.query.search) {
    Campground.fuzzySearch(req.query.search, (err, searchResults) => {
      if (err) {
        console.log(err);
      } else {
        if (searchResults.length === 0) {
          req.flash(
            "error",
            "Sorry, no campgrounds match your query. Please try again"
          );
          return res.redirect("/campgrounds");
        }
        res.render("campgrounds/index", {
          campgrounds: searchResults,
          page: "campgrounds",
          filt,
          camp,
        });
      }
    });
    // res.render("campgrounds/index", { camp, filt });
  } else {
    if (!req.query.page) {
      const camp = await Campground.find({});
      const campgrounds = await Campground.paginate(
        {},
        {
          sort: { [filt]: -1 },
        }
      );
      res.render("campgrounds/index", { campgrounds, camp, filt });
    } else {
      const { page } = req.query;
      const { filter } = req.query;
      const campgrounds = await Campground.paginate(
        {},
        {
          sort: { [filter]: -1 },
          page,
        }
      );
      res.status(200).json(campgrounds);
    }
  }
};

export const renderNewForm = (req, res) => {
  res.render("campgrounds/new", {
    title: "Add a new campground",
  });
};

export const showCampground = async (req, res) => {
  const { id } = req.params;
  const campgrounds = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");

  res.render("campgrounds/show", {
    campgrounds,
    title: "Campground Details",
  });
};

export const renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campgroundsEdit = await res.locals.foundCampground;

  res.render("campgrounds/edit", {
    campgroundsEdit,
    title: "Edit campground",
  });
};

export const createCampground = async (req, res) => {
  if (!req.body.campground)
    throw new expressError("Invalid Campground Data", 400);
  const geoData = await geocoder
    .forwardGeocode({
      query:
        req.body.campground.location.judet +
        ", " +
        req.body.campground.location.localitate,
      limit: 1,
    })
    .send();
  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = geoData.body.features[0].geometry;
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  newCampground.rating = await calculateAverage(newCampground.reviews);
  await newCampground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect("/campgrounds/" + newCampground.id);
};

export const updateCampground = async (req, res) => {
  // const {
  //     id
  // } = req.params

  // const campground = await Campground.findByIdAndUpdate(id, {
  //     ...req.body.campground
  // }, {
  //     runValidators: true
  // });
  //no longer use findbyid querry
  const campground = res.locals.foundCampground;
  if (
    req.body.campground.location.judet !== campground.location.judet ||
    req.body.campground.location.localitate !== campground.location.localitate
  ) {
    const geoData = await geocoder
      .forwardGeocode({
        query:
          req.body.campground.location.judet +
          ", " +
          req.body.campground.location.localitate,
        limit: 1,
      })
      .send();
    campground.geometry = geoData.body.features[0].geometry;
  }
  const img = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...img);
  Object.assign(campground, req.body.campground);

  // await Campground.findOneAndUpdate(res.locals.foundCampground._id, {
  //     ...req.body.campground
  // }, {
  //     runValidators: true
  // });

  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: {
        images: {
          filename: {
            $in: req.body.deleteImages,
          },
        },
      },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect("/campgrounds/" + req.params.id);
};

export const deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  for (let image of campground.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};

export const calculateAverage = (reviews) => {
  if (reviews.length === 0) {
    return 0;
  }
  let sum = 0;

  reviews.forEach(function (element) {
    sum += element.rating;
  });

  return sum / reviews.length;
};

export default index;
