export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Avtorizatsiya talab qilinadi") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Ruxsat yo'q") {
    return new ApiError(403, message);
  }

  static notFound(message = "Topilmadi") {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static tooMany(message = "Haddan tashqari ko'p so'rov") {
    return new ApiError(429, message);
  }

  static internal(message = "Server xatosi") {
    return new ApiError(500, message);
  }
}
