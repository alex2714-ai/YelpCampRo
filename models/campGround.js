import { mongoose } from "mongoose";

import Review from "./reviews.js";

import mongoosePaginate from "mongoose-paginate-v2";

import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";

const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [
      {
        url: String,
        filename: String,
      },
    ],
    location: {
      judet: String,
      localitate: String,
    },
    price: Number,
    description: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    rating: {
      type: Number,
    },
  },
  { timestamps: true },
  opts
);

//for edit page
CampgroundSchema.path("images")
  .schema.virtual("thumbnail")
  .get(function () {
    return this.url.replace("/upload/", "/upload/w_200/");
  });

//for show page
CampgroundSchema.path("images")
  .schema.virtual("cardImage")
  .get(function () {
    return this.url.replace("/upload", "/upload/ar_3:2,c_crop");
  });

CampgroundSchema.virtual("properties.popUpCampground").get(function () {
  return `<strong> ${this.title}</strong> 
  <p>${this.description.substring(
    0,
    30
  )} <a href="/campgrounds/${this._id}">...show details</a></p>`;
});

// CampgroundSchema.post('findOneAndDelete', async function (doc) {
//     if (doc) {
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         });

//     }

// })
CampgroundSchema.post(
  "deleteOne",
  {
    document: true,
    query: false,
  },
  async function (doc) {
    if (doc) {
      await Review.deleteMany({
        _id: {
          $in: doc.reviews,
        },
      });
    }
  }
);

CampgroundSchema.plugin(mongoose_fuzzy_searching, {
  fields: [
    {
      name: "title",
    },
    {
      name: "location",
      keys: ["judet", "localitate"],
    },
  ],
});
CampgroundSchema.plugin(mongoosePaginate);

const Campground = mongoose.model("Campground", CampgroundSchema);

export default Campground;
