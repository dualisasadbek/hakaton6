import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Statistika (admin dashboard)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Statistika
 */
router.get("/stats", requireAdmin, asyncHandler(adminController.stats));

export default router;
