import express from "express";
import { ProductController } from "../controllers/productController.js";

const router = express.Router();

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", ProductController.create);
router.put("/:id", ProductController.update);
router.post("/:id/buy", ProductController.buy);
router.delete("/:id", ProductController.remove);
router.patch("/:id/restore", ProductController.restore);
router.post("/:id/restore", ProductController.restore);

export default router;
