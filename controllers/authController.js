import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/brevoEmail.js"; // Import Brevo sender
import dotenv from "dotenv";

dotenv.config();

// --- EMAIL WRAPPER (Optional now, but kept for compatibility) ---
// The imported sendEmail function already handles the logic.


// --- REGISTER USER ---
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    console.log(`Attempting registration for: ${email}`);

    const normalizedEmail = email.toLowerCase().trim();

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ success: false, message: "User already exists with this email" });
      }
      return res.status(400).json({ success: false, message: "User already exists with this phone number" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const mailOptions = {
      from: `"MovieBooking Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your MovieBooking OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e50914;">Verification Code</h2>
          <p>Hello <b>${name}</b>,</p>
          <p>Your OTP for registration is: <span style="font-size: 20px; font-weight: bold; color: #333;">${otp}</span></p>
          <p>This code is valid for 5 minutes.</p>
        </div>
      `,
    };

    // --- SEND EMAIL ---
    try {
      await sendEmail(mailOptions);
      console.log("✅ OTP Email sent successfully");
    } catch (mailError) {
      console.error("❌ Email Delivery Error:", mailError);
      return res.status(500).json({
        success: false,
        message: "Email delivery failed. Please check your email or try again later.",
        error: mailError.message
      });
    }

    // Create User only if email succeeds
    await User.create({
      name,
      email: normalizedEmail,
      phone,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "OTP sent to your email inbox!" });

  } catch (error) {
    console.error("❌ Register Global Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// --- LOGIN USER ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true for production (Vercel/Render)
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- VERIFY OTP ---
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, message: "Verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SET PASSWORD ---
export const setPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user || !user.isVerified) {
      return res.status(400).json({ success: false, message: "Verification required" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ success: true, message: "Password set successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- LOGOUT ---
export const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0)
  });
  res.json({ success: true, message: "Logged out" });
};

// --- GET DETAILS ---
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
