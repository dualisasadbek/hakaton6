import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import config from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import { uploadDir } from "./middlewares/upload.middleware.js";

const allowedOrigins = (config.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

class App {
  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.errorHandlers();
  }

  configure() {
    this.app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    this.app.use(compression());
    this.app.use(express.json({ limit: "2mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin(origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
          callback(null, false);
        },
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    // Static rasmlar uchun uzoq muddatli brauzer keshi
    this.app.use(
      "/uploads",
      express.static(uploadDir, {
        maxAge: "30d",
        immutable: true,
        etag: true,
      })
    );
  }

  routes() {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.app.use("/api", apiRoutes);
  }

  errorHandlers() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }
}

export const { app } = new App();
