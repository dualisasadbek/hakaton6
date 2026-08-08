import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

class VoteService {
  async toggle(userId, complaintId) {
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!complaint) throw ApiError.notFound("Shikoyat topilmadi");

    const existing = await prisma.vote.findUnique({
      where: { userId_complaintId: { userId, complaintId } },
    });

    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
      return { voted: false };
    }

    await prisma.vote.create({ data: { userId, complaintId } });
    return { voted: true };
  }

  async count(complaintId) {
    return prisma.vote.count({ where: { complaintId } });
  }

  async hasVoted(userId, complaintId) {
    const vote = await prisma.vote.findUnique({
      where: { userId_complaintId: { userId, complaintId } },
    });
    return Boolean(vote);
  }
}

export const voteService = new VoteService();
