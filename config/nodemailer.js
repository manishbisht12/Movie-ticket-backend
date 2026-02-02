import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Shared Nodemailer Transporter
 * 
 * Configures the email transport based on environment variables.
 * Automatically handles the 'secure' flag based on the port.
 */

// Determine if we should use 'secure' (SSL) or not (STARTTLS)
// Port 465 -> secure: true
// Port 587 -> secure: false
const port = parseInt(process.env.EMAIL_PORT) || 587;
const isSecure = port === 465;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: port,
    secure: isSecure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ specific Nodemailer Error:", error);
    } else {
        console.log("✅ Nodemailer Server is ready to take our messages");
    }
});

export default transporter;
