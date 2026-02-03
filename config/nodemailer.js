import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.EMAIL_PORT) || 587;
const secure = port === 465;

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

if (process.env.NODE_ENV !== "production") {
    transporter.verify((err) => {
        if (err) console.error("SMTP Error:", err);
        else console.log("SMTP Ready");
    });
}

export default transporter;
