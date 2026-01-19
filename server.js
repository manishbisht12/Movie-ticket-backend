import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";


dotenv.config();

connectDB();

const app = express();



// app.use(cors({
//   origin: "*", 
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true, 
// }));


app.use(cors({
  // Aapne specific frontend URL dena hoga
  origin: "https://movie-ticket-topaz.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/uploads", express.static("uploads"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/movies", movieRoutes);


app.get("/", (req, res) => {
  res.send("Movie Backend Running 🚀");
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});