// import Booking from "../models/Booking.js";
// import PDFDocument from "pdfkit";
// import User from "../models/User.js";

// export const downloadTicket = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     // Fetch booking details from DB (Mocking the data here for example)
//     // const booking = await Booking.findById(bookingId).populate('user');
    
//     const booking = {
//       movie: "Spider-Man: No Way Home",
//       seats: ["Gold-12", "Gold-13"],
//       showTime: "2026-01-15 | 06:00 PM | Cinema PVR",
//       totalPrice: 500,
//       userName: "Mani Bisht",
//       bookingId: bookingId
//     };

//     const doc = new PDFDocument({ size: "A6", margin: 30 });

//     // Set headers for PDF download
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=Ticket-${bookingId}.pdf`);

//     doc.pipe(res);

//     // --- Design the Ticket ---
    
//     // Background Border
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#1a1a1a");
//     doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke("#ef4444");

//     // Movie Title
//     doc.fillColor("#ef4444").fontSize(18).text(booking.movie.toUpperCase(), { align: "center" });
//     doc.moveDown();

//     // Line separator
//     doc.moveTo(20, 70).lineTo(280, 70).strokeColor("#333").stroke();
//     doc.moveDown();

//     // Ticket Details
//     doc.fillColor("#ffffff").fontSize(10);
//     doc.text(`DATE & TIME:`, { continued: true }).fillColor("#aaa").text(` ${booking.showTime}`);
//     doc.moveDown(0.5);
    
//     doc.fillColor("#ffffff").text(`SEATS:`, { continued: true }).fillColor("#ef4444").text(` ${booking.seats.join(", ")}`);
//     doc.moveDown(0.5);

//     doc.fillColor("#ffffff").text(`BOOKED BY:`, { continued: true }).fillColor("#aaa").text(` ${booking.userName}`);
//     doc.moveDown(2);

//     // Total Price Box
//     doc.rect(30, 200, 240, 40).fill("#333");
//     doc.fillColor("#ffffff").fontSize(14).text(`TOTAL PAID: INR ${booking.totalPrice}`, 40, 212, { align: "center" });

//     // Footer / Booking ID
//     doc.fontSize(8).fillColor("#555").text(`Booking ID: ${booking.bookingId}`, 20, 380, { align: "center" });

//     doc.end();
//   } catch (error) {
//     res.status(500).json({ message: "Error generating ticket" });
//   }
// };

// export const createBooking = async (req, res) => {
//   try {
//     const { movie, seats, showTime, totalPrice, paymentId } = req.body;

//     // Check if fields are missing
//     if (!movie || !seats || !showTime || !paymentId) {
//       return res.status(400).json({ success: false, message: "Missing required booking details" });
//     }

//     const booking = await Booking.create({
//       user: req.user._id, // Ensure your isAuthenticated middleware provides this
//       movie,
//       seats,
//       showTime,
//       totalPrice,
//       paymentId
//     });

//     res.status(201).json({ success: true, booking });
//   } catch (error) {
//     console.error("SERVER ERROR:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get all booked seats for a specific show
// // @route   GET /api/bookings/booked-seats
// export const getBookedSeats = async (req, res) => {
//   try {
//     const { movie, showTime } = req.query;

//     if (!movie || !showTime) {
//       return res.status(400).json({ success: false, message: "Movie and showTime are required" });
//     }

//     const bookings = await Booking.find({ movie, showTime });
    
//     // Sabhi bookings se seats ko ek single array mein merge karna
//     const allBookedSeats = bookings.reduce((acc, curr) => acc.concat(curr.seats), []);
    
//     res.status(200).json({ 
//       success: true, 
//       bookedSeats: allBookedSeats 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

import Booking from "../models/Booking.js";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

// Helper function: Email bhejne ke liye
const sendTicketEmail = async (userEmail, userName, booking, pdfBuffer) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Movie Magic" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${booking.movie}`,
      text: `Hi ${userName},\n\nYour booking for ${booking.movie} is successful. Please find your ticket attached.\n\nSeats: ${booking.seats.join(", ")}\nShow: ${booking.showTime}`,
      attachments: [
        {
          filename: `Ticket-${booking._id}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", userEmail);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

// 1. Create Booking (Exports exactly as 'createBooking')
// export const createBooking = async (req, res) => {
//   try {
//     const { movie, seats, showTime, totalPrice, paymentId } = req.body;

//     if (!movie || !seats || !showTime || !paymentId) {
//       return res.status(400).json({ success: false, message: "Missing fields" });
//     }

//     const booking = await Booking.create({
//       user: req.user._id,
//       movie,
//       seats,
//       showTime,
//       totalPrice,
//       paymentId
//     });

//     // Memory mein PDF banana email ke liye
//     const doc = new PDFDocument({ size: "A6", margin: 30 });
//     let buffers = [];
//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", async () => {
//       const pdfBuffer = Buffer.concat(buffers);
//       await sendTicketEmail(req.user.email, req.user.name, booking, pdfBuffer);
//     });

//     // PDF Design
//     doc.rect(0, 0, doc.page.width, doc.page.height).fill("#1a1a1a");
//     doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke("#ef4444");
//     doc.fillColor("#ef4444").fontSize(16).font("Helvetica-Bold").text("MOVIE MAGIC", { align: "center" });
//     doc.moveDown(0.5);
//     doc.fillColor("#ffffff").fontSize(12).text(movie.toUpperCase(), { align: "center" });
//     doc.moveDown();
//     doc.fontSize(10).font("Helvetica").fillColor("#ffffff").text(`DATE: ${showTime}`);
//     doc.text(`SEATS: ${seats.join(", ")}`);
//     doc.fillColor("#ffffff").text(`Name: `, { continued: true }).fillColor("#aaa").text(req.user.name); 
//     doc.moveDown();
//     doc.rect(25, 200, 250, 40).fill("#333");
//     doc.fillColor("#ffffff").text(`PAID: INR ${totalPrice}`, 25, 215, { align: "center" });
//     doc.end();

//     res.status(201).json({ success: true, message: "Ticket sent to email!" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const createBooking = async (req, res) => {
  try {
    const { movie, seats, showTime, totalPrice, paymentId } = req.body;

    if (!movie || !seats || !showTime || !paymentId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      movie,
      seats,
      showTime,
      totalPrice,
      paymentId
    });

    const doc = new PDFDocument({ size: "A6", margin: 0 }); // Margin 0 for full design
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      await sendTicketEmail(req.user.email, req.user.name, booking, pdfBuffer);
    });

    // --- START PREMIUM DESIGN ---
    
    // 1. Background (Dark Theme)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#121212");

    // 2. Header Accent (Red Bar)
    doc.rect(0, 0, doc.page.width, 40).fill("#dc2626");
    doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text("MOVIE MAGIC PASS", 0, 15, { align: "center" });

    // 3. Ticket Main Border
    doc.rect(10, 50, doc.page.width - 20, doc.page.height - 60).stroke("#333333");

    // 4. Movie Title (Big & Bold)
    doc.moveDown(2.5);
    doc.fillColor("#dc2626").fontSize(18).font("Helvetica-Bold").text(movie.toUpperCase(), { align: "center" });
    
    // Subtle Divider
    doc.moveDown(0.5);
    doc.moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).strokeColor("#222").stroke();
    doc.moveDown(1);

    // 5. Info Section
    const leftCol = 25;
    const labelColor = "#888888";
    const valueColor = "#ffffff";

    // Date & Time
    doc.fontSize(8).fillColor(labelColor).text("DATE & SHOWTIME", leftCol);
    doc.fontSize(10).fillColor(valueColor).font("Helvetica-Bold").text(showTime);
    doc.moveDown();

    // Seats
    doc.fontSize(8).fillColor(labelColor).text("RESERVED SEATS", leftCol);
    doc.fontSize(12).fillColor("#dc2626").font("Helvetica-Bold").text(seats.join(", "));
    doc.moveDown();

    // Booked By
    doc.fontSize(8).fillColor(labelColor).text("BOOKED BY", leftCol);
    doc.fontSize(10).fillColor(valueColor).font("Helvetica").text(req.user.name);
    doc.moveDown(1.5);

    // 6. Payment Box (High Contrast)
    doc.rect(20, doc.y, doc.page.width - 40, 45).fill("#1a1a1a");
    doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold").text(`TOTAL PAID: INR ${totalPrice}`, 20, doc.y + 15, { align: "center" });

    // 7. Booking ID (Footer)
    doc.fontSize(7).fillColor("#444").font("Helvetica").text(`ID: ${booking._id} | Payment: ${paymentId}`, 0, doc.page.height - 20, { align: "center" });

    // 8. Cut Line (Visual effect)
    doc.circle(0, doc.page.height / 1.5, 10).fill("#121212");
    doc.circle(doc.page.width, doc.page.height / 1.5, 10).fill("#121212");

    doc.end();

    res.status(201).json({ success: true, message: "Ticket sent to email!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 2. Get Booked Seats (Exports exactly as 'getBookedSeats')
export const getBookedSeats = async (req, res) => {
  try {
    const { movie, showTime } = req.query;
    const bookings = await Booking.find({ movie, showTime });
    const allBookedSeats = bookings.reduce((acc, curr) => acc.concat(curr.seats), []);
    res.status(200).json({ success: true, bookedSeats: allBookedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Agar routes mein downloadTicket import hai, toh empty function rakhte hain crash na ho
export const downloadTicket = (req, res) => {
    res.status(400).send("Please check your email for the ticket.");
};