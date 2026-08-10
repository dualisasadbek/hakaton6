import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import complaintRoutes from "./complaint.routes.js";
import voteRoutes from "./vote.routes.js";
import aiRoutes from "./ai.routes.js";
import adminRoutes from "./admin.routes.js";
import announcementRoutes from "./announcement.routes.js";
import { adminController } from "../controllers/admin.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "FixMyCity API ishlayapti", timestamp: new Date().toISOString() })
);

router.get("/stats", asyncHandler(adminController.publicStats));

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/complaints", complaintRoutes);
router.use("/", voteRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);
router.use("/announcements", announcementRoutes);

export default router;
