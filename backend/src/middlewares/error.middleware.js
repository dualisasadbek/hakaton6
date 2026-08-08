import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route topilmadi: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Noto'g'ri JSON" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Bunday ma'lumot allaqachon mavjud",
    });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Server xatosi" });
}
