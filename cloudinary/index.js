import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import * as dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

cloudinary.config({
  cloud_name: process.env.CLOUADINARY_CLOUD_NAME,
  api_key: process.env.CLOUADINARY_API_KEY,
  api_secret: process.env.CLOUADINARY_SECRET_KEY,
  secure: true,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CampImages",
    allowed_formats: ["png", "jpeg", "jpg"],
    //   format: async (req, file) => ['png','jpeg','jpg'], // supports promises as well
    //   public_id: (req, file) => 'computed-filename-using-request',
  },
});

export default cloudinary;
