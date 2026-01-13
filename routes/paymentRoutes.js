

import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Route handler
router.post("/checkout", async (req, res) => {
  try {
    // Instance yahan create karne se process.env hamesha available rahega
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount } = req.body;

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Razorpay order creation failed",
      error: error.message 
    });
  }
});

export default router;