import { complaintService } from "../services/complaint.service.js";
import { voteService } from "../services/vote.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class ComplaintController {
  async create(req, res) {
    const files = req.files || [];
    const complaint = await complaintService.create({
      userId: req.user.id,
      ...req.body,
      files,
    });
    res.status(201).json(ApiResponse.created("Shikoyat yuborildi", complaint));
  }

  async list(req, res) {
    const { page = 1, limit = 20 } = req.query;
    const result = await complaintService.list({
      page: Number(page),
      limit: Number(limit),
      status: req.query.status,
      categoryId: req.query.categoryId,
      search: req.query.search,
      sort: req.query.sort,
    });
    res.json(ApiResponse.ok("Shikoyatlar ro'yxati", result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  async mapList(_req, res) {
    const complaints = await complaintService.mapList();
    res.json(ApiResponse.ok("Xarita uchun shikoyatlar", complaints));
  }

  async getById(req, res) {
    const complaint = await complaintService.getById(req.params.id);
    const voted = req.user ? await voteService.hasVoted(req.user.id, complaint.id) : false;
    res.json(ApiResponse.ok("Shikoyat tafsilotlari", { ...complaint, voted }));
  }

  async update(req, res) {
    const complaint = await complaintService.update(req.user.id, req.params.id, req.body);
    res.json(ApiResponse.ok("Shikoyat yangilandi", complaint));
  }

  async addImages(req, res) {
    const files = req.files || [];
    await complaintService.addImages(req.params.id, files);
    res.json(ApiResponse.ok("Rasmlar qo'shildi"));
  }

  async remove(req, res) {
    await complaintService.remove(req.user, req.params.id);
    res.json(ApiResponse.ok("Shikoyat o'chirildi"));
  }

  async changeStatus(req, res) {
    const complaint = await complaintService.changeStatus(req.user, req.params.id, req.body);
    res.json(ApiResponse.ok("Shikoyat holati yangilandi", complaint));
  }
}

export const complaintController = new ComplaintController();
