import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 

// Updated Transporter: Port/Host ke jhanjhat se bachne ke liye 'service' use karein
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Server logs ke liye useful hai
    console.log(`Registration attempt: ${email}`);

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const mailOptions = {
      from: `"MovieBooking Support" <${process.env.EMAIL_USER}>`, 
      to: email.toLowerCase().trim(),
      subject: "Confirm your MovieBooking registration",
      text: `Hello ${name}, your MovieBooking verification code is ${otp}.`, 
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

    // Note: transporter.verify() ko skip kar rahe hain taaki timeout ka risk kam ho
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent successfully");

    // Database mein entry tabhi banayein jab email chala jaye
    await User.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Registration/Email Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Email service connection timed out. Please try again.", 
      error: error.message 
    });
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

    res.json({ success: true, message: "Verified successfully" });
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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    // Live environment ke liye settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,   // HTTPS mandatory for Vercel
      sameSite: "none", // Required for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/" 
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  res.cookie("token", "", { 
    httpOnly: true, 
    secure: true, 
    sameSite: "none", 
    expires: new Date(0) 
  });
  res.json({ success: true, message: "Logged out" });
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};