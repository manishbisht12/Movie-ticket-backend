import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log("--- Testing Email Confirmation Locally ---");
console.log("User:", process.env.EMAIL_USER);
// Mask password
const pass = process.env.EMAIL_PASS || "";
console.log("Pass:", pass.substring(0, 3) + "..." + pass.substring(pass.length - 3));
console.log("Host:", process.env.EMAIL_HOST);
console.log("Port:", process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log(" Connection Failed!");
        console.error(error);
    } else {
        console.log("✅ Connection Successful! Server is ready to take our messages");

        // Try sending a real email to self
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Test Email from Localhost",
            text: "If you see this, Nodemailer is working correctly!"
        }).then(info => {
            console.log(" Test Email Sent!", info.messageId);
        }).catch(err => {
            console.log(" Sending Failed!");
            console.error(err);
        });
    }
});
