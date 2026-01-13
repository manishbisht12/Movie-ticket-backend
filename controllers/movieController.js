import Movie from "../models/Movie.js";


export const addMovie = async (req, res) => {
  try {
    const { title, genre, language, rating, description } = req.body;
    
   
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a poster" });
    }

    
    const posterURL = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const movie = await Movie.create({
      title,
      genre,
      language,
      rating,
      description,
      poster: posterURL, 
    });

    res.status(201).json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};