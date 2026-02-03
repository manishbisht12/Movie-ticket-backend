import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    // Ensure API Key is set from env
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    if (!apiKey.apiKey || apiKey.apiKey.includes("YOUR_API_KEY")) {
        console.error("❌ BREVO_API_KEY is missing or invalid in .env");
        throw new Error("Email configuration error: API Key missing");
    }

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Configure Sender
    sendSmtpEmail.sender = {
        name: "MovieBooking App",
        email: process.env.EMAIL_USER || "no-reply@moviebooking.com"
    };

    // Configure To
    sendSmtpEmail.to = [{ email: to }];

    // Configure Content
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    if (text) sendSmtpEmail.textContent = text;

    // Configure Attachments
    if (attachments && Array.isArray(attachments)) {
        sendSmtpEmail.attachment = attachments;
    }

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Brevo Email Sent Successfully. MessageId:', data.messageId);
        return data;
    } catch (error) {
        console.error('❌ Brevo Email Error Context:', {
            to,
            sender: sendSmtpEmail.sender.email,
            error: error.response ? error.response.body : error.message
        });
        throw error;
    }
};

export default { sendEmail };
