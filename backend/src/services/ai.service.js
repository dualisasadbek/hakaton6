import fs from "fs";
import path from "path";
import config from "../config/env.js";
import { prisma } from "../config/database.js";
import { uploadDir } from "../middlewares/upload.middleware.js";

const SYSTEM_PROMPT = `Siz FixMyCity platformasining yordamchisiysiz.
FixMyCity - shahar muammolarini (yo'l, yoritish, chiqindi, suv, elektr, transport va h.k.) kuzatish platformasi.
Foydalanuvchilar shikoyat yozadilar, xaritada joy belgilaydilar, rasm qo'shadilar va ovoz beradilar.
Shikoyat holatlari: PENDING (yangi), VERIFIED (tasdiqlangan), IN_PROGRESS (jarayonda), RESOLVED (hal qilingan), REJECTED (rad etilgan), BLOCKED (bloklangan).
Javobni faqat o'zbek tilida, qisqa va tushunarli bering.`;

const ANALYSIS_PROMPT = (title, description) => `Siz FixMyCity shikoyat moderatori sifatida ishlaysiz.
Quyidagi shikoyatni tahlil qiling va FAQAT JSON formatida javob qaytaring (boshqa matn yo'q):

{
  "isAppropriate": true/false,
  "blocked": true/false,
  "blockReason": "bloklangan bo'lsa sabab, aks holda bo'sh string",
  "categoryGuess": "taxminiy kategoriya nomi",
  "summary": "1-2 jumlalik qisqa xulosa",
  "riskLevel": "low|medium|high"
}

Shikoyat sarlavhasi: ${title}
Shikoyat matni: ${description}

Qoidalar:
- Rasmlarda yalang'ochlik, zo'ravonlik, nafrat, shaxsiy ma'lumotlar, spam bo'lsa -> isAppropriate=false, blocked=true.
- Rasm sifat jihatdan yaroqsiz (bo'sh, tushunarsiz) bo'lsa ham blocked=true deb belgilang.
- Aks holda shikoyatni tasdiqlang.`;

function readBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64");
}

function imageMime(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimes[ext] || "image/jpeg";
}

class AiService {
  get enabled() {
    return Boolean(config.GROQ_API_KEY);
  }

  async chatCompletions({ model, messages, temperature = config.AI_TEMPERATURE }) {
    if (!this.enabled) {
      throw new Error("GROQ_API_KEY sozlanmagan");
    }

    const res = await fetch(`${config.GROQ_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Groq API xatosi (${res.status}): ${text}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  async analyzeComplaint({ title, description, images = [] }) {
    const fallback = {
      isAppropriate: true,
      blocked: false,
      blockReason: "",
      categoryGuess: "",
      summary: "",
      riskLevel: "low",
    };

    if (!this.enabled) return fallback;

    const prompt = ANALYSIS_PROMPT(title, description);
    const textParts = [{ type: "text", text: prompt }];

    for (const imagePath of images.slice(0, 3)) {
      try {
        textParts.push({
          type: "image_url",
          image_url: {
            url: `data:${imageMime(imagePath)};base64,${readBase64(imagePath)}`,
          },
        });
      } catch {
        // rasmni o'qib bo'lmadi - tashlab ketamiz
      }
    }

    const tryParse = (raw) => {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      try {
        return { ...fallback, ...JSON.parse(jsonMatch[0]) };
      } catch {
        return null;
      }
    };

    try {
      const raw = await this.chatCompletions({
        model: config.AI_ANALYSIS_MODEL,
        messages: [{ role: "user", content: textParts }],
      });
      const parsed = tryParse(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.warn("AI vision analysis failed:", err.message);
    }

    try {
      const raw = await this.chatCompletions({
        model: config.AI_CHAT_MODEL,
        messages: [{ role: "user", content: prompt }],
      });
      const parsed = tryParse(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.warn("AI text analysis failed:", err.message);
    }

    return fallback;
  }

  async chat({ userId, userMessage, history = [] }) {
    let userContext = "";
    if (userId) {
      const complaints = await prisma.complaint.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { title: true, status: true },
      });
      if (complaints.length) {
        userContext = `\nFoydalanuvchining shikoyatlari:\n${complaints
          .map((c) => `- ${c.title} (${c.status})`)
          .join("\n")}`;
      }
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + userContext },
      ...history.slice(-8),
      { role: "user", content: userMessage },
    ];

    if (!this.enabled) {
      return "Hozircha AI xizmati sozlanmagan (GROQ_API_KEY yo'q). Administrator bilan bog'laning.";
    }

    try {
      return await this.chatCompletions({
        model: config.AI_CHAT_MODEL,
        messages,
      });
    } catch (err) {
      console.warn("AI chat failed:", err.message);
      return "AI bilan bog'lanib bo'lmadi, keyinroq urinib ko'ring.";
    }
  }
}

export const aiService = new AiService();
