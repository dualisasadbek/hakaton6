import { prisma } from "../config/database.js";

class AdminService {
  async publicStats() {
    const [totalComplaints, pendingComplaints, resolvedComplaints, totalVotes] =
      await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: "PENDING" } }),
        prisma.complaint.count({ where: { status: "RESOLVED" } }),
        prisma.vote.count(),
      ]);
    return { totalComplaints, pendingComplaints, resolvedComplaints, totalVotes };
  }

  async stats() {
    const [
      totalUsers,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      blockedComplaints,
      totalVotes,
      complaintsByStatus,
      complaintsByCategory,
      recentComplaints,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: "PENDING" } }),
      prisma.complaint.count({ where: { status: "RESOLVED" } }),
      prisma.complaint.count({ where: { status: "BLOCKED" } }),
      prisma.vote.count(),
      prisma.complaint.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.complaint.groupBy({ by: ["categoryId"], _count: { _all: true } }),
      prisma.complaint.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          category: true,
        },
      }),
    ]);

    const categoryNames = await prisma.category.findMany({
      where: { id: { in: complaintsByCategory.map((c) => c.categoryId) } },
      select: { id: true, name: true },
    });
    const nameMap = new Map(categoryNames.map((c) => [c.id, c.name]));

    return {
      totalUsers,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      blockedComplaints,
      totalVotes,
      complaintsByStatus: complaintsByStatus.map((c) => ({
        status: c.status,
        count: c._count._all,
      })),
      complaintsByCategory: complaintsByCategory.map((c) => ({
        categoryId: c.categoryId,
        categoryName: nameMap.get(c.categoryId) || "Noma'lum",
        count: c._count._all,
      })),
      recentComplaints,
    };
  }
}

export const adminService = new AdminService();
