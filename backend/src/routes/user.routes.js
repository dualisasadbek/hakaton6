import { Router } from "express";
import { z } from "zod";
import { userController } from "../controllers/user.controller.js";
import { requireAdmin, requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const updateMeSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

const blockSchema = z.object({
  isBlocked: z.boolean(),
});

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: O'z profilini yangilash
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               password: { type: string }
 *               avatarUrl: { type: string }
 *     responses:
 *       200:
 *         description: Profil yangilandi
 */
router.patch("/me", requireAuth, validate(updateMeSchema), asyncHandler(userController.updateMe));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Foydalanuvchilar ro'yxati (admin)
 *     security: [{ bearerAuth: [] }]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN, SUPER_ADMIN]
 *     responses:
 *       200:
 *         description: Ro'yxat
 */
router.get("/", requireAdmin, asyncHandler(userController.list));

/**
 * @swagger
 * /users/{id}/block:
 *   patch:
 *     tags: [Users]
 *     summary: Foydalanuvchini bloklash/ochish (admin)
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
 *             required: [isBlocked]
 *             properties:
 *               isBlocked: { type: boolean }
 *     responses:
 *       200:
 *         description: Bloklash holati o'zgartirildi
 */
router.patch("/:id/block", requireAdmin, validate(blockSchema), asyncHandler(userController.setBlocked));

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Foydalanuvchi rolini o'zgartirish (super admin)
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
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       200:
 *         description: Rol o'zgartirildi
 */
router.patch("/:id/role", requireRole("SUPER_ADMIN"), validate(roleSchema), asyncHandler(userController.setRole));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Foydalanuvchini o'chirish (super admin)
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
router.delete("/:id", requireRole("SUPER_ADMIN"), asyncHandler(userController.delete));

export default router;
