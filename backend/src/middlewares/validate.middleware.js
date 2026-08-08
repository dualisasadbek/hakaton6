import { ApiError } from "../utils/ApiError.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(ApiError.badRequest("Validatsiya xatosi", details));
  }
  req[source] = result.data;
  next();
};
