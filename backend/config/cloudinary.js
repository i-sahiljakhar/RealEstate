import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

console.log("CLOUDINARY ENV CHECK", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY ? "LOADED" : "MISSING",
  api_secret: process.env.CLOUD_SECRET ? "LOADED" : "MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export default cloudinary;
