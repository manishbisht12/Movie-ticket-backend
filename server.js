import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Load Environment Variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- MIDDLEWARES ---

// 1. CORS Configuration (Zaroori: Razorpay aur Frontend connectivity ke liye)
app.use(cors({
  origin: "http://localhost:3000", // Aapka frontend port
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Cookies aur Auth headers ke liye
}));

// 2. Body Parsers (Zaroori: req.body read karne ke liye)
app.use(express.json()); // JSON data ke liye
app.use(express.urlencoded({ extended: true })); // Form data ke liye

// 3. Cookie Parser
app.use(cookieParser());

// --- ROUTES ---

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.send("Movie Backend Running 🚀");
});

// --- GLOBAL ERROR HANDLER ---
// Agar koi route crash hota hai toh server band nahi hoga
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