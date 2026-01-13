import express from "express";
import { createBooking, getBookedSeats ,downloadTicket} from "../controllers/bookingController.js";
import { isAuthenticated } from "../middleware/auth.js"; // Aapka middleware

const router = express.Router();

// 1. Sirf logged-in users booking kar sakte hain
router.post("/new", isAuthenticated, createBooking);

// 2. Booked seats koi bhi dekh sakta hai (Public)
router.get("/booked-seats", getBookedSeats);
router.get("/download-ticket/:bookingId", isAuthenticated, downloadTicket);

export default router;