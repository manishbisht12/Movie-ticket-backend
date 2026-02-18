

export const parseShowTime = (showTimeStr) => {
  try {
    if (!showTimeStr) return null;

    const parts = showTimeStr.split("|");

    const datePart = parts[0].trim();   // 15 Jan
    const timePart = parts[1].trim();   // 10:00 AM

    const currentYear = new Date().getFullYear();

    const fullDate = `${datePart} ${currentYear} ${timePart}`;

    const parsedDate = new Date(fullDate);

    if (isNaN(parsedDate)) return null;

    return parsedDate;

  } catch (error) {
    console.log("❌ ShowTime parse error:", error);
    return null;
  }
};

