import { Router } from "express";
import { z } from "zod";
import { aiController } from "../controllers/ai.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, "Xabar kiritilishi shart").max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(8)
    .optional(),
});

const analyzeSchema = z.object({
  id: z.string().uuid("Shikoyat ID noto'g'ri"),
});

/**
 * @swagger
 * /ai/analyze/{id}:
 *   post:
 *     tags: [AI]
 *     summary: Shikoyatni AI yordamida tahlil qilish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI tahlili (isAppropriate, blocked, summary...)
 */
router.post(
  "/analyze/:id",
  requireAuth,
  validate(analyzeSchema, "params"),
  asyncHandler(aiController.analyze)
);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     tags: [AI]
 *     summary: AI bilan chat (o'zbekcha)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: AI javobi
 */
router.post("/chat", optionalAuth, validate(chatSchema), asyncHandler(aiController.chat));

/**
 * @swagger
 * /ai/status:
 *   get:
 *     tags: [AI]
 *     summary: AI holati (yoqilgan/o'chirilgan)
 *     responses:
 *       200:
 *         description: "enabled: boolean"
 */
router.get("/status", asyncHandler(aiController.status));

export default router;
