import { Router } from "express";
import { z } from "zod";
import { announcementController } from "../controllers/announcement.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi").max(150),
  body: z.string().min(5, "Matn kamida 5 ta belgi").max(5000),
  area: z.string().max(150).nullable().optional(),
  fixAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

/**
 * @swagger
 * /announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: Yangiliklar ro'yxati
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get("/", asyncHandler(announcementController.list));

/**
 * @swagger
 * /announcements:
 *   post:
 *     tags: [Announcements]
 *     summary: Yangilik yaratish (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *               area: { type: string }
 *               fixAt: { type: string, format: date-time }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post("/", requireAdmin, validate(createSchema), asyncHandler(announcementController.create));

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     tags: [Announcements]
 *     summary: Yangilikni yangilash (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yangilandi
 */
router.patch("/:id", requireAdmin, validate(updateSchema), asyncHandler(announcementController.update));

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     tags: [Announcements]
 *     summary: Yangilikni o'chirish (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: O'chirildi
 */
router.delete("/:id", requireAdmin, asyncHandler(announcementController.remove));

export default router;
