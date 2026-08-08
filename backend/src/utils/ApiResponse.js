export class ApiResponse {
  constructor(success, message, data = null, meta = null) {
    this.success = success;
    this.message = message;
    if (data !== null && data !== undefined) this.data = data;
    if (meta !== null && meta !== undefined) this.meta = meta;
  }

  static ok(message, data, meta) {
    return new ApiResponse(true, message, data, meta);
  }

  static created(message, data) {
    return new ApiResponse(true, message, data);
  }

  static noContent() {
    return new ApiResponse(true, "Muvaffaqiyatli");
  }
}
