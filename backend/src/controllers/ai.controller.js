import { aiService } from "../services/ai.service.js";
import { complaintService } from "../services/complaint.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class AiController {
  async analyze(req, res) {
    const complaint = await complaintService.getById(req.params.id);
    const images = complaint.images.map((img) => ({
      path: `${process.cwd()}${img.url}`,
    }));
    const result = await aiService.analyzeComplaint({
      title: complaint.title,
      description: complaint.description,
      images: images.map((i) => i.path),
    });
    res.json(ApiResponse.ok("AI tahlili", result));
  }

  async chat(req, res) {
    const answer = await aiService.chat({
      userId: req.user?.id,
      userMessage: req.body.message,
      history: req.body.history || [],
    });
    res.json(ApiResponse.ok("AI javobi", { answer }));
  }

  async status(_req, res) {
    res.json(ApiResponse.ok("AI holati", { enabled: aiService.enabled }));
  }
}

export const aiController = new AiController();
