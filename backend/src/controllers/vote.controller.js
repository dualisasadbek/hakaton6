import { voteService } from "../services/vote.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class VoteController {
  async toggle(req, res) {
    const result = await voteService.toggle(req.user.id, req.params.complaintId);
    const count = await voteService.count(req.params.complaintId);
    res.json(ApiResponse.ok(result.voted ? "Ovoz berildi" : "Ovoz bekor qilindi", { ...result, count }));
  }

  async count(req, res) {
    const count = await voteService.count(req.params.complaintId);
    res.json(ApiResponse.ok("Ovozlar soni", { complaintId: req.params.complaintId, count }));
  }
}

export const voteController = new VoteController();
