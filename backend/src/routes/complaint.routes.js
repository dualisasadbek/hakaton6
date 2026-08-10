import { Router } from "express";
import { z } from "zod";
import { complaintController } from "../controllers/complaint.controller.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";
import { shortCache } from "../middlewares/cache.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(5, "Sarlavha kamida 5 ta belgi").max(150),
  description: z.string().min(10, "Matn kamida 10 ta belgi").max(5000),
  categoryId: z.string().uuid("Kategoriya ID noto'g'ri"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().max(300).optional(),
});

const updateSchema = createSchema.partial();

const statusSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED", "BLOCKED"]),
  comment: z.string().max(500).optional(),
});

/**
 * @swagger
 * /complaints:
 *   get:
 *     tags: [Complaints]
 *     summary: Shikoyatlar ro'yxati (filter + pagination)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, IN_PROGRESS, RESOLVED, REJECTED, BLOCKED]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [votes, newest]
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get("/", shortCache(15), asyncHandler(complaintController.list));

/**
 * @swagger
 * /complaints/map:
 *   get:
 *     tags: [Complaints]
 *     summary: Xarita markerlari uchun yengil ro'yxat
 *     responses:
 *       200:
 *         description: Markerlar
 */
router.get("/map", shortCache(30), asyncHandler(complaintController.mapList));

/**
 * @swagger
 * /complaints:
 *   post:
 *     tags: [Complaints]
 *     summary: Shikoyat yaratish (multipart/form-data, images[])
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, categoryId, latitude, longitude]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               address: { type: string }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post(
  "/",
  requireAuth,
  uploadMultiple,
  validate(createSchema),
  asyncHandler(complaintController.create)
);

/**
 * @swagger
 * /complaints/{id}:
 *   get:
 *     tags: [Complaints]
 *     summary: Shikoyat tafsilotlari
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tafsilotlar
 */
router.get("/:id", optionalAuth, asyncHandler(complaintController.getById));

/**
 * @swagger
 * /complaints/{id}:
 *   patch:
 *     tags: [Complaints]
 *     summary: Shikoyatni tahrirlash (muallif, faqat PENDING)
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
router.patch("/:id", requireAuth, validate(updateSchema), asyncHandler(complaintController.update));

/**
 * @swagger
 * /complaints/{id}/images:
 *   post:
 *     tags: [Complaints]
 *     summary: Shikoyatga rasmlar qo'shish
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Rasmlar qo'shildi
 */
router.post("/:id/images", requireAuth, uploadMultiple, asyncHandler(complaintController.addImages));

/**
 * @swagger
 * /complaints/{id}/status:
 *   patch:
 *     tags: [Complaints]
 *     summary: Shikoyat holatini o'zgartirish (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [VERIFIED, IN_PROGRESS, RESOLVED, REJECTED, BLOCKED] }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Holat yangilandi
 */
router.patch("/:id/status", requireAdmin, validate(statusSchema), asyncHandler(complaintController.changeStatus));

/**
 * @swagger
 * /complaints/{id}:
 *   delete:
 *     tags: [Complaints]
 *     summary: Shikoyatni o'chirish (muallif yoki admin)
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
router.delete("/:id", requireAuth, asyncHandler(complaintController.remove));

export default router;
