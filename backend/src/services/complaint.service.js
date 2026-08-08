import { prisma } from "../config/database.js";
import { AiDecision, ComplaintStatus } from "@prisma/client";
import { aiService } from "./ai.service.js";
import { ApiError } from "../utils/ApiError.js";

const STATUS_FLOW = {
  [ComplaintStatus.PENDING]: [ComplaintStatus.VERIFIED, ComplaintStatus.REJECTED, ComplaintStatus.BLOCKED],
  [ComplaintStatus.VERIFIED]: [ComplaintStatus.IN_PROGRESS, ComplaintStatus.REJECTED],
  [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED],
  [ComplaintStatus.REJECTED]: [],
  [ComplaintStatus.BLOCKED]: [],
  [ComplaintStatus.RESOLVED]: [],
};

const publicInclude = {
  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  category: true,
  images: { orderBy: { isPrimary: "desc" } },
  _count: { select: { votes: true } },
};

class ComplaintService {
  async create({ userId, title, description, categoryId, latitude, longitude, address, files = [] }) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!category) throw ApiError.badRequest("Kategoriya topilmadi yoki nofaol");

    const complaint = await prisma.complaint.create({
      data: {
        userId,
        title,
        description,
        categoryId,
        latitude,
        longitude,
        address: address || null,
        images: {
          create: files.map((f, i) => ({
            url: `/uploads/${f.filename}`,
            isPrimary: i === 0,
          })),
        },
        statusHistory: {
          create: {
            changedById: userId,
            fromStatus: ComplaintStatus.PENDING,
            toStatus: ComplaintStatus.PENDING,
            comment: "Shikoyat yaratildi",
          },
        },
      },
      include: publicInclude,
    });

    if (files.length) {
      this.runAiAnalysis(complaint.id, title, description, files).catch((err) =>
        console.warn("AI analysis background error:", err)
      );
    } else {
      this.runAiAnalysis(complaint.id, title, description, []).catch((err) =>
        console.warn("AI analysis background error:", err)
      );
    }

    return complaint;
  }

  async runAiAnalysis(complaintId, title, description, files) {
    const result = await aiService.analyzeComplaint({
      title,
      description,
      images: files.map((f) => f.path),
    });

    if (result.blocked) {
      const complaint = await prisma.complaint.update({
        where: { id: complaintId },
        data: {
          status: ComplaintStatus.BLOCKED,
          aiDecision: AiDecision.BLOCKED,
          aiAnalysis: result,
        },
        include: publicInclude,
      });
      return { blocked: true, complaint };
    }

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        aiDecision: AiDecision.APPROVED,
        aiAnalysis: result,
      },
    });
    return { blocked: false };
  }

  async list({ page = 1, limit = 20, status, categoryId, search, sort }) {
    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = {};
    if (sort === "votes") {
      orderBy.votes = { _count: "desc" };
    } else if (sort === "newest") {
      orderBy.createdAt = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: publicInclude,
        orderBy,
      }),
      prisma.complaint.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async mapList() {
    return prisma.complaint.findMany({
      where: { status: { not: ComplaintStatus.BLOCKED } },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        status: true,
        categoryId: true,
        createdAt: true,
        _count: { select: { votes: true } },
      },
    });
  }

  async getById(id) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        ...publicInclude,
        statusHistory: {
          include: { changedBy: { select: { id: true, firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");
    return complaint;
  }

  async update(userId, id, data) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");
    if (complaint.userId !== userId) throw ApiError.forbidden("Faqat muallif o'zgartira oladi");
    if (complaint.status !== ComplaintStatus.PENDING) {
      throw ApiError.badRequest("Faqat PENDING holatidagi shikoyatni tahrirlash mumkin");
    }
    return prisma.complaint.update({
      where: { id },
      data,
      include: publicInclude,
    });
  }

  async addImages(complaintId, files = []) {
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");
    return prisma.complaintImage.createMany({
      data: files.map((f) => ({
        complaintId,
        url: `/uploads/${f.filename}`,
      })),
    });
  }

  async remove(user, id) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");

    const isOwner = complaint.userId === user.id;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);

    if (!isOwner && !isAdmin) throw ApiError.forbidden();
    if (isOwner && complaint.status !== ComplaintStatus.PENDING && !isAdmin) {
      throw ApiError.badRequest("Faqat PENDING holatidagi shikoyatni o'chirish mumkin");
    }

    await prisma.complaint.delete({ where: { id } });
  }

  async changeStatus(user, id, { status, comment }) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");

    if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      throw ApiError.forbidden("Statusni faqat admin o'zgartira oladi");
    }

    const allowed = STATUS_FLOW[complaint.status] ?? [];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(
        `${complaint.status} -> ${status} o'tish mumkin emas. Ruxsat etilgan: ${allowed.join(", ")}`
      );
    }

    return prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === ComplaintStatus.RESOLVED ? new Date() : null,
        statusHistory: {
          create: {
            changedById: user.id,
            fromStatus: complaint.status,
            toStatus: status,
            comment: comment || null,
          },
        },
      },
      include: publicInclude,
    });
  }
}

export const complaintService = new ComplaintService();
