import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import config from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import { uploadDir } from "./middlewares/upload.middleware.js";

class App {
  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.errorHandlers();
  }

  configure() {
    this.app.use(express.json({ limit: "2mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use("/uploads", express.static(uploadDir));
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
