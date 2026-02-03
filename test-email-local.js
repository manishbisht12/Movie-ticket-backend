import { sendEmail } from "./config/brevoEmail.js";
import dotenv from 'dotenv';
dotenv.config();

console.log("--- Testing Brevo Email Confirmation Locally ---");
console.log("Sender:", process.env.EMAIL_USER);
console.log("API Key Present:", !!process.env.BREVO_API_KEY);

const runTest = async () => {
    try {
        console.log("⏳ Sending test email...");
        const result = await sendEmail({
            to: process.env.EMAIL_USER,
            subject: "Test Email from Localhost (Brevo)",
            text: "If you see this, Brevo API is working correctly!",
            html: "<h3>Brevo Working!</h3><p>If you see this, Brevo API is working correctly!</p>"
        });
        console.log("✅ Test Email Sent!", result.messageId);
    } catch (error) {
        console.log("❌ Sending Failed!");
        console.error(error);
    }
};

runTest();
