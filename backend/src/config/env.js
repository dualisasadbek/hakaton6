import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(5),
  SEED_SUPER_ADMIN_EMAIL: z.string().optional(),
  SEED_SUPER_ADMIN_PASSWORD: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_BASE_URL: z.string().url().default("https://api.groq.com/openai/v1"),
  AI_ANALYSIS_MODEL: z.string().default("llama-3.2-11b-vision-preview"),
  AI_CHAT_MODEL: z.string().default("llama-3.3-70b-versatile"),
  AI_TEMPERATURE: z.coerce.number().default(0.3),
});

class Config {
  constructor() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
      throw new Error("Environment validation failed");
    }
    Object.assign(this, parsed.data);
  }

  get cookieOptions() {
    const base = { httpOnly: true, secure: this.COOKIE_SECURE, sameSite: "lax" };
    return { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 };
  }

  get isProduction() {
    return this.NODE_ENV === "production";
  }
}

export default new Config();
