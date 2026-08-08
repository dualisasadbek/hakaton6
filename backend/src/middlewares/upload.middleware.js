import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import config from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadDir = path.resolve(process.cwd(), config.UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const uploadImages = multer({
  storage,
  limits: { fileSize: config.MAX_IMAGE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(ApiError.badRequest("Faqat rasm fayllari yuklanadi (jpeg/png/webp/gif)"));
    }
    cb(null, true);
  },
});

export const uploadSingle = uploadImages.single("image");
export const uploadMultiple = uploadImages.array("images", 6);
