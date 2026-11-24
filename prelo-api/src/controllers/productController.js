import { ProductModel } from "../models/productModel.js";

export const ProductController = {
  async getAll(req, res) {
    try {
      const { category_id, q, archived } = req.query;
      res.json(await ProductModel.getAll({ category_id, q, archived }));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const { allow_archived } = req.query;
      res.json(
        await ProductModel.getById(req.params.id, {
          allowArchived: allow_archived === "true",
        })
      );
    } catch (err) {
      res
        .status(err.status || 404)
        .json({ error: err.message, isDeleted: err.isDeleted || false });
    }
  },

  async create(req, res) {
    try {
      res.status(201).json(await ProductModel.create(req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      res.json(await ProductModel.update(req.params.id, req.body));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      res.json(await ProductModel.remove(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async restore(req, res) {
    try {
      res.json(await ProductModel.restore(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};
