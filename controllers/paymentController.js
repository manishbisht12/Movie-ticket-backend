import Razorpay from "razorpay";

export const checkout = async (req, res) => {
  try {
    const instance = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};


