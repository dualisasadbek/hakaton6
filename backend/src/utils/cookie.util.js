import config from "../config/env.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./jwt.util.js";

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const { cookieOptions } = config;
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    path: "/api/auth",
  });
}

export function clearAuthCookies(res) {
  const { secure, sameSite } = config.cookieOptions;
  const base = { httpOnly: true, secure, sameSite };
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, { ...base, path: "/api/auth" });
}
