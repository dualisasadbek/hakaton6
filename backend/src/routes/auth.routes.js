import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth, requireRefreshToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta belgi").max(50),
  lastName: z.string().min(2, "Familiya kamida 2 ta belgi").max(50),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgi").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Ro'yxatdan o'tish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: Ro'yxatdan o'tildi, tokenlar cookie'ga yozildi
 */
router.post("/register", validate(registerSchema), asyncHandler(authController.register));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimga kirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Kirildi, tokenlar cookie'ga yozildi
 */
router.post("/login", validate(loginSchema), asyncHandler(authController.login));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh token yordamida yangi tokenlar olish
 *     responses:
 *       200:
 *         description: Yangi tokenlar cookie'ga yozildi
 */
router.post("/refresh", requireRefreshToken, asyncHandler(authController.refresh));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimdan chiqish (cookie'lar tozalanadi)
 *     responses:
 *       200:
 *         description: Chiqildi
 */
router.post("/logout", requireRefreshToken, asyncHandler(authController.logout));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi ma'lumotlari
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma'lumotlari
 */
router.get("/me", requireAuth, asyncHandler(authController.me));

export default router;
