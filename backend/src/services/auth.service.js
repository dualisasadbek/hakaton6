import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/database.js";
import { jwtUtil } from "../utils/jwt.util.js";
import { ApiError } from "../utils/ApiError.js";

const BCRYPT_ROUNDS = 12;

class AuthService {
  hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  issueTokens(user) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    return {
      accessToken: jwtUtil.signAccessToken(payload),
      refreshToken: jwtUtil.signRefreshToken(payload),
    };
  }

  async register({ firstName, lastName, email, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict("Bu email allaqachon ro'yxatdan o'tgan");

    const passwordHash = await this.hashPassword(password);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
    });

    const tokens = this.issueTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), tokens };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.unauthorized("Email yoki parol noto'g'ri");

    if (user.isBlocked) throw ApiError.forbidden("Foydalanuvchi bloklangan");

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Email yoki parol noto'g'ri");

    const tokens = this.issueTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), tokens };
  }

  async saveRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.refreshToken.create({
      data: { userId, token: hashed, expiresAt },
    });
  }

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwtUtil.verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Refresh token yaroqsiz yoki muddati o'tgan");
    }

    const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const stored = await prisma.refreshToken.findUnique({ where: { token: hashed } });

    if (!stored || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Refresh token muddati o'tgan");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized("Foydalanuvchi topilmadi");

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = this.issueTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitize(user), tokens };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;
    const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.refreshToken.deleteMany({ where: { token: hashed } });
  }

  sanitize(user) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();
