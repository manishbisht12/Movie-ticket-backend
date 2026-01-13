import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true }, 
  genre: { type: String, required: true },
  language: { type: String, required: true },
  rating: { type: Number, default: 0 },
  description: { type: String },
  releaseDate: { type: Date },
}, { timestamps: true });

export default mongoose.model("Movie", movieSchema);