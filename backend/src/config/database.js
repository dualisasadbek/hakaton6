import { PrismaClient } from "@prisma/client";
import config from "./env.js";

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: config.isProduction ? ["error"] : ["warn", "error"],
    });
  }

  async connect() {
    await this.prisma.$connect();
    console.log("Database connected");
  }

  async disconnect() {
    await this.prisma.$disconnect();
    console.log("Database disconnected");
  }
}

export const db = new Database();
export const prisma = db.prisma;
