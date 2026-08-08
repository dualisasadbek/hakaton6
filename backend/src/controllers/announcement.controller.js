import { announcementService } from "../services/announcement.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class AnnouncementController {
  async list(req, res) {
    const includeInactive = req.query.includeInactive === "true";
    const announcements = await announcementService.list({ includeInactive });
    res.json(ApiResponse.ok("Yangiliklar ro'yxati", announcements));
  }

  async create(req, res) {
    const announcement = await announcementService.create(req.body, req.user.id);
    res.status(201).json(ApiResponse.created("Yangilik yaratildi", announcement));
  }

  async update(req, res) {
    const announcement = await announcementService.update(req.params.id, req.body);
    res.json(ApiResponse.ok("Yangilik yangilandi", announcement));
  }

  async remove(req, res) {
    await announcementService.remove(req.params.id);
    res.json(ApiResponse.ok("Yangilik o'chirildi"));
  }
}

export const announcementController = new AnnouncementController();
