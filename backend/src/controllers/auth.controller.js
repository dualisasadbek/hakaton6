import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookie.util.js";

class AuthController {
  async register(req, res) {
    const { user, tokens } = await authService.register(req.body);
    setAuthCookies(res, tokens);
    res.status(201).json(ApiResponse.created("Ro'yxatdan o'tish muvaffaqiyatli", { user, tokens }));
  }

  async login(req, res) {
    const { user, tokens } = await authService.login(req.body);
    setAuthCookies(res, tokens);
    res.json(ApiResponse.ok("Tizimga kirish muvaffaqiyatli", { user, tokens }));
  }

  async refresh(req, res) {
    const { user, tokens } = await authService.refresh(req.refreshToken);
    setAuthCookies(res, tokens);
    res.json(ApiResponse.ok("Token yangilandi", { user, tokens }));
  }

  async logout(req, res) {
    await authService.logout(req.refreshToken);
    clearAuthCookies(res);
    res.json(ApiResponse.ok("Chiqish muvaffaqiyatli"));
  }

  async me(req, res) {
    const user = await authService.sanitize(req.user);
    res.json(ApiResponse.ok("Foydalanuvchi ma'lumotlari", { user }));
  }
}

export const authController = new AuthController();
