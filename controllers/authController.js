import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    console.log("Attempting to send OTP to:", email);

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Send Email
    const mailOptions = {
      from: `"MovieBooking Support" <${process.env.EMAIL_USER}>`, 
      to: email.toLowerCase().trim(),
       subject: "Confirm your MovieBooking registration",
      text: `Hello ${name}, your MovieBooking verification code is ${otp}. It will expire in 5 minutes.`, 
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #ef4444;">Welcome to MovieBooking</h2>
          <p>Hello ${name},</p>
          <p>Your OTP for account verification is:</p>
          <h1 style="letter-spacing: 5px; color: #111;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    await User.create({
      name,
      email,
      phone,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, message: "Verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Verification required" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.json({ success: true, user: { name: user.name, email: user.email } });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Development ke liye false hi rakhein
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/" // Ensure cookie is available everywhere
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out" });
};

// Add this to the bottom of authController.js

export const getUserDetails = async (req, res) => {
  try {
    // req.user.id comes from your verifyToken middleware
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};