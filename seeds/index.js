import { mongoose } from "mongoose";
import axios from "axios";
import Campground from "../models/campGround.js";
import cities from "./ro.js";
import descriptors from "./seedHelpers.js";
import places from "./seedHelpers.js";
import Review from "../models/reviews.js";
import User from "../models/user.js";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/campground;"),
    {
      userNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];

async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "lbGkmU6OeEDOVgVH257_KaDw-fWTYiuVo2ImNHgxSYA",
        collections: 1114848,
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}

const seedDB = async () => {
  await Review.deleteMany({});
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const random840 = Math.floor(Math.random() * 840);
    const price = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    const camp = new Campground({
      author: "638e07874cbe8631351645e4",
      location: {
        judet: `${cities[random840].admin_name}`,
        localitate: `${cities[random840].city}`,
      },
      title: `${sample(descriptors)},${sample(places)}`,
      images: [
        {
          url: await seedImg(),
          filename: "example",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [cities[random840].lng, cities[random840].lat],
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit.Aliquam culpa animi adipisci,veniam ducimus quibusdam temporibus est laboriosam eveniet exercitationem nisi tenetur,atque repellat maxime odit blanditiis sapiente officia aliquid",
      price: price,
      rating: 0,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
