import cron from "node-cron";
import Booking from "../models/Booking.js";
import { parseShowTime } from "../utils/parseShowTime.js";
import { sendEmail } from "../config/brevoEmail.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking movie reminders...");

  const bookings = await Booking.find({
    bookingStatus: "Confirmed",
    reminderSent: false
  }).populate("user");

  const now = new Date();

  for (const booking of bookings) {
    const showDate = parseShowTime(booking.showTime);

    const diffMinutes = (showDate - now) / 60000;

    if (diffMinutes > 9 && diffMinutes < 11) {

      await sendEmail({
        to: booking.user.email,
        subject: "🎬 Movie starting in 10 minutes!",
        html: `
          <h2>Hello ${booking.user.name}</h2>
          <p>Your movie <b>${booking.movie}</b> starts soon.</p>
          <p><b>Showtime:</b> ${booking.showTime}</p>
          <p>Please reach theatre on time 🍿</p>
        `
      });
      
      booking.reminderSent = true;
      await booking.save();
          
      console.log("✅ Reminder sent to", booking.user.email);
    }
  }
});
