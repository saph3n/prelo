import { CategoryModel } from "../models/categoryModel.js";

export const CategoryController = {
  async create(req, res) {
    try {
      const category = await CategoryModel.create(req.body.name);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      res.json(await CategoryModel.getAll());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      res.json(await CategoryModel.getById(req.params.id));
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      res.json(await CategoryModel.update(req.params.id, req.body.name));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      res.json(await CategoryModel.remove(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};