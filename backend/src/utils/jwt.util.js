import jwt from "jsonwebtoken";
import config from "../config/env.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

class JwtUtil {
  signAccessToken(payload) {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    });
  }

  signRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  }
}

export const jwtUtil = new JwtUtil();
export { ACCESS_COOKIE, REFRESH_COOKIE };
