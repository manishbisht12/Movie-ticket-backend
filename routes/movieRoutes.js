import express from "express";
import { addMovie, getAllMovies, getMovieById } from "../controllers/movieController.js";
import { upload } from "../middleware/multer.js"; 

const router = express.Router();

router.post("/add", upload.single("poster"), addMovie); 
router.get("/all", getAllMovies);
router.get("/:id", getMovieById);

export default router;