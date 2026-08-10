import { Router } from "express";
import { z } from "zod";
import { categoryController } from "../controllers/category.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { shortCache } from "../middlewares/cache.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 ta belgi").max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(50).optional(),
  icon: z.string().max(50).optional(),
});

const updateSchema = createSchema.partial();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Kategoriyalar ro'yxati
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get("/", shortCache(60), asyncHandler(categoryController.list));

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Kategoriya yaratish (super admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               icon: { type: string }
 *     responses:
 *       201:
 *         description: Yaratildi
 */
router.post("/", requireRole("SUPER_ADMIN"), validate(createSchema), asyncHandler(categoryController.create));

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Kategoriyani yangilash (super admin)
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
router.patch("/:id", requireRole("SUPER_ADMIN"), validate(updateSchema), asyncHandler(categoryController.update));

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Kategoriyani o'chirish (super admin)
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
router.delete("/:id", requireRole("SUPER_ADMIN"), asyncHandler(categoryController.remove));

export default router;
