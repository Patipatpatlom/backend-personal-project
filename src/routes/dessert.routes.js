import express from "express";
import {
  getDessertsController,
  getDessertController,
  createDessertController,
  deleteDessertController,
  updateDessertController,
} from "../controllers/dessert.controller.js";
import { upload } from "../utils/upload.js";


const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded 💀",
    });
  }

  // Cloudinary returns the URL in req.file.path
  res.json({
    image: req.file.path,
  });
});

router.get("/", getDessertsController);
router.get("/:id", getDessertController);
router.post("/", createDessertController);
router.put("/:id", updateDessertController); 
router.delete("/:id", deleteDessertController);

export default router;