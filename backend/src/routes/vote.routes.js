import { Router } from "express";
import { voteController } from "../controllers/vote.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

/**
 * @swagger
 * /complaints/{complaintId}/vote:
 *   post:
 *     tags: [Votes]
 *     summary: Ovoz berish/bekor qilish (toggle)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ovoz holati
 */
router.post(
  "/complaints/:complaintId/vote",
  requireAuth,
  asyncHandler(voteController.toggle)
);

/**
 * @swagger
 * /complaints/{complaintId}/votes:
 *   get:
 *     tags: [Votes]
 *     summary: Shikoyat ovozlari soni
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ovozlar soni
 */
router.get(
  "/complaints/:complaintId/votes",
  asyncHandler(voteController.count)
);

export default router;
