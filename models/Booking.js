import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // User model se link
    required: true,
  },
  movie: {
    type: String, // Ya Movie ID agar aapne movie model banaya hai
    required: true,
  },
  seats: {
    type: [String], // Array of seats like ["A1", "A2"]
    required: true,
  },
  showTime: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;