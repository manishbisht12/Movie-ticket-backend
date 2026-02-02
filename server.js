import express from "express";
import dotenv from "dotenv";
// import "dotenv/config";

import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import fs from "fs";
import path from "path";


dotenv.config();

connectDB();

const app = express();



// app.use(cors({
//   origin: "*", 
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true, 
// }));


// app.use(cors({
//   origin: "https://movie-ticket-topaz.vercel.app", 
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true, 
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));


const allowedOrigins = [
  "https://movie-ticket-topaz.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 VERY IMPORTANT (Preflight fix)
// app.options("*", cors());


app.use("/uploads", express.static("uploads"));

app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const uploadDir = path.join(process.cwd(), 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Error reading uploads');
    const file = files.find(f => f.endsWith(`-${filename}`));
    if (!file) return res.status(404).send('File not found');
    res.sendFile(path.join(uploadDir, file));
  });
});

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

