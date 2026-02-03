import express from "express";
// import transporter from "../config/nodemailer.js"; // Removed


const router = express.Router();

router.get("/test-email", async (req, res) => {
    try {
        console.log("🔍 Testing Brevo Connection...");

        console.log("Brevo API Key:", process.env.BREVO_API_KEY ? "✅ Present" : "❌ Missing");
        console.log("Sender Email:", process.env.EMAIL_USER || "Not Set");

        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing in environment variables");
        }

        const SibApiV3Sdk = (await import('sib-api-v3-sdk')).default;
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.AccountApi();
        const accountData = await apiInstance.getAccount();

        console.log("✅ Brevo Account Verified:", accountData.email);

        res.json({
            success: true,
            message: "Brevo configuration is valid!",
            account: {
                email: accountData.email,
                firstName: accountData.firstName,
                plan: accountData.plan
            }
        });
    } catch (error) {
        console.error("❌ Brevo Connection Failed:", error);
        res.status(500).json({
            success: false,
            message: "Brevo configuration failed",
            error: error.message,
            stack: error.stack
        });
    }
});

export default router;
