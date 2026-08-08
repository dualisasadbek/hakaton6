import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import complaintRoutes from "./complaint.routes.js";
import voteRoutes from "./vote.routes.js";
import aiRoutes from "./ai.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "FixMyCity API ishlayapti", timestamp: new Date().toISOString() })
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/complaints", complaintRoutes);
router.use("/", voteRoutes);
router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);

export default router;
