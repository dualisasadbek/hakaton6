import { prisma } from "../config/database.js";
import { jwtUtil, ACCESS_COOKIE, REFRESH_COOKIE } from "../utils/jwt.util.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

async function authenticate(req) {
  let token = req.cookies?.[ACCESS_COOKIE] || extractBearerToken(req);
  if (!token) throw ApiError.unauthorized();

  try {
    const payload = jwtUtil.verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized("Foydalanuvchi topilmadi");
    if (user.isBlocked) throw ApiError.forbidden("Foydalanuvchi bloklangan");
    return user;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized("Yaroqsiz yoki muddati o'tgan token");
  }
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  req.user = await authenticate(req);
  next();
});

export const requireRefreshToken = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized("Refresh token topilmadi");
  req.refreshToken = token;
  next();
});

export const requireRole =
  (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) req.user = await authenticate(req);
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  });

export const requireAdmin = requireRole("ADMIN", "SUPER_ADMIN");

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE] || extractBearerToken(req);
  if (!token) return next();
  try {
    const payload = jwtUtil.verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user && !user.isBlocked) req.user = user;
  } catch {
    // token yaroqsiz bo'lsa ham davom etamiz (anonim)
  }
  next();
});
