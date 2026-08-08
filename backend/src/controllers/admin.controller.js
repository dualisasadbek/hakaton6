import { adminService } from "../services/admin.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class AdminController {
  async stats(_req, res) {
    const stats = await adminService.stats();
    res.json(ApiResponse.ok("Statistika", stats));
  }
}

export const adminController = new AdminController();
