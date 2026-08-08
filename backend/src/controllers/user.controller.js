import { userService } from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class UserController {
  async updateMe(req, res) {
    const user = await userService.updateMe(req.user.id, req.body);
    res.json(ApiResponse.ok("Profil yangilandi", { user }));
  }

  async list(req, res) {
    const result = await userService.list(req.query);
    res.json(ApiResponse.ok("Foydalanuvchilar ro'yxati", result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  async setBlocked(req, res) {
    const isBlocked = req.body.isBlocked === true;
    const user = await userService.setBlocked(req.params.id, isBlocked);
    res.json(ApiResponse.ok(isBlocked ? "Foydalanuvchi bloklandi" : "Foydalanuvchi blokdan ochildi", { user }));
  }

  async setRole(req, res) {
    const user = await userService.setRole(req.params.id, req.body.role);
    res.json(ApiResponse.ok("Rol o'zgartirildi", { user }));
  }

  async delete(req, res) {
    await userService.delete(req.params.id);
    res.json(ApiResponse.ok("Foydalanuvchi o'chirildi"));
  }
}

export const userController = new UserController();
