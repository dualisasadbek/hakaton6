import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

class AnnouncementService {
  async list({ includeInactive = false } = {}) {
    return prisma.announcement.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ fixAt: "asc" }, { createdAt: "desc" }],
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getById(id) {
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw ApiError.notFound("Yangilik topilmadi");
    return announcement;
  }

  async create(data, userId) {
    return prisma.announcement.create({
      data: { ...data, createdById: userId },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id, data) {
    await this.getById(id);
    return prisma.announcement.update({ where: { id }, data });
  }

  async remove(id) {
    await this.getById(id);
    await prisma.announcement.delete({ where: { id } });
  }
}

export const announcementService = new AnnouncementService();
