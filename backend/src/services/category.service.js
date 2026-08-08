import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

class CategoryService {
  async list({ includeInactive = false } = {}) {
    return prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { complaints: true } } },
    });
  }

  async getById(id) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.notFound("Kategoriya topilmadi");
    return category;
  }

  async create({ name, slug, icon }) {
    const finalSlug = slug || slugify(name);
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug: finalSlug }] },
    });
    if (existing) throw ApiError.conflict("Bunday kategoriya mavjud");
    return prisma.category.create({ data: { name, slug: finalSlug, icon } });
  }

  async update(id, data) {
    await this.getById(id);
    if (data.name || data.slug) {
      const finalSlug = data.slug || slugify(data.name || "");
      const existing = await prisma.category.findFirst({
        where: { OR: [{ name: data.name }, { slug: finalSlug }], NOT: { id } },
      });
      if (existing) throw ApiError.conflict("Bunday kategoriya mavjud");
      data.slug = finalSlug;
    }
    return prisma.category.update({ where: { id }, data });
  }

  async remove(id) {
    await this.getById(id);
    const count = await prisma.complaint.count({ where: { categoryId: id } });
    if (count > 0) {
      throw ApiError.conflict("Kategoriyaga shikoyatlar biriktirilgan, o'chirib bo'lmaydi");
    }
    await prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();
