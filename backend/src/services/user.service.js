import { prisma } from "../config/database.js";
import { authService } from "./auth.service.js";
import { ApiError } from "../utils/ApiError.js";

class UserService {
  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Foydalanuvchi topilmadi");
    return authService.sanitize(user);
  }

  async updateMe(userId, data) {
    const updateData = { ...data };
    if (data.password) {
      updateData.passwordHash = await authService.hashPassword(data.password);
      delete updateData.password;
    }
    const user = await prisma.user.update({ where: { id: userId }, data: updateData });
    return authService.sanitize(user);
  }

  async list({ page = 1, limit = 20, search, role }) {
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isBlocked: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { complaints: true, votes: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items: users, total, page, limit };
  }

  async setBlocked(userId, isBlocked) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Foydalanuvchi topilmadi");
    if (user.role === "SUPER_ADMIN") {
      throw ApiError.forbidden("Super adminni bloklab bo'lmaydi");
    }
    return authService.sanitize(
      await prisma.user.update({ where: { id: userId }, data: { isBlocked } })
    );
  }

  async setRole(userId, role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Foydalanuvchi topilmadi");
    if (user.role === "SUPER_ADMIN") {
      throw ApiError.forbidden("Super admin rolini o'zgartirib bo'lmaydi");
    }
    return authService.sanitize(
      await prisma.user.update({ where: { id: userId }, data: { role } })
    );
  }

  async delete(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("Foydalanuvchi topilmadi");
    if (user.role === "SUPER_ADMIN") {
      throw ApiError.forbidden("Super adminni o'chirib bo'lmaydi");
    }
    await prisma.user.delete({ where: { id: userId } });
  }
}

export const userService = new UserService();
