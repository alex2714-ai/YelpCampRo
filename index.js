import * as dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { mongoose } from "mongoose";
import session from "express-session";
import flash from "connect-flash";
import ejsMate from "ejs-mate";
import methodOverride from "method-override";
import expressError from "./utils/ExpressError.js";
import campgroundsRouters from "./routes/campground.js";
import userRouters from "./routes/user.js";
import reviewsRouters from "./routes/review.js";
import passport from "passport";
import passportLocal from "passport-local";
import User from "./models/user.js";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import MongoStore from "connect-mongo";

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/campground";

const app = express();
const port = 3000;

async function main() {
  await mongoose.connect(dbUrl),
    {
      userNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    };
}

main().catch((err) => console.log(err));

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

app.use(
  session({
    store,
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",

  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dtxw73hy3/",
  "https://code.jquery.com/",
];
const styleSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",

  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dtxw73hy3/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dtxw73hy3/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dtxw73hy3/"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dtxw73hy3/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dtxw73hy3/"],
      childSrc: ["blob:"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRouters);
app.use("/campgrounds", campgroundsRouters);
app.use("/campgrounds/:id/reviews", reviewsRouters);

app.get("/", (req, res) => {
  res.render("home");
});

app.post(function (req, res, next) {
  next();
});

app.all("*", (req, res, next) => {
  next(new expressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  // if (err) {
  //     req.flash('error', "Something went wrong");
  //     return res.redirect(`/campgrounds`);
  // }

  if (!err.message) err.message = "Somthing went wrong";

  res.status(statusCode).render("error", {
    err,
  });
});

app.listen(port, (req, res) => {
  console.log("Serving at http://localhost:" + port);
});
