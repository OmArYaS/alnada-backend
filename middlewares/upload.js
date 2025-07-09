import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// إعدادات Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer بذاكرة مؤقتة
const storage = multer.memoryStorage(); // تغيير مهم هنا
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✔️ رفع صورة واحدة على Cloudinary
export const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ✔️ رفع صور متعددة
export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
  return await Promise.all(uploadPromises); // array of {url, public_id}
};

// Multer middleware
export const uploadSingle = upload.single("image"); // صورة واحدة
export const uploadMultiple = upload.array("images", 10); // صور متعددة (حد أقصى 10)

export default upload;
