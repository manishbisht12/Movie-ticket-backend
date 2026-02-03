import express from "express";
import transporter from "../config/nodemailer.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
    try {
        console.log("🔍 Testing Email Connection...");


        console.log("Configured User:", process.env.EMAIL_USER ? "✅ Present" : "❌ Missing");
        console.log("Configured Pass:", process.env.EMAIL_PASS ? "✅ Present" : "❌ Missing");
        console.log("Configured Host:", process.env.EMAIL_HOST);

        const verify = await transporter.verify();
        console.log("✅ Email Connection Verified:", verify);

        res.json({
            success: true,
            message: "Email configuration is valid!",
            config: {
                user: process.env.EMAIL_USER ? "HIDDEN" : "MISSING",
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT
            }
        });
    } catch (error) {
        console.error("❌ Email Connection Failed:", error);
        res.status(500).json({
            success: false,
            message: "Email configuration failed",
            error: error.message,
            stack: error.stack
        });
    }
});

export default router;
