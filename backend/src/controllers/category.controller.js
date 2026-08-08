import { categoryService } from "../services/category.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class CategoryController {
  async list(req, res) {
    const categories = await categoryService.list({
      includeInactive: req.query.includeInactive === "true",
    });
    res.json(ApiResponse.ok("Kategoriyalar ro'yxati", categories));
  }

  async create(req, res) {
    const category = await categoryService.create(req.body);
    res.status(201).json(ApiResponse.created("Kategoriya yaratildi", category));
  }

  async update(req, res) {
    const category = await categoryService.update(req.params.id, req.body);
    res.json(ApiResponse.ok("Kategoriya yangilandi", category));
  }

  async remove(req, res) {
    await categoryService.remove(req.params.id);
    res.json(ApiResponse.ok("Kategoriya o'chirildi"));
  }
}

export const categoryController = new CategoryController();
