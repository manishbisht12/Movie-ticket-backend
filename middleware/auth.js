// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const isAuthenticated = async (req, res, next) => {
//   try {
    
//     const { token } = req.cookies;

//     if (!token) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Login first to access this resource" 
//       });
//     }


//     const decodedData = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");


//     req.user = await User.findById(decodedData.id);

//     if (!req.user) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "User no longer exists" 
//       });
//     }

//     next(); 
//   } catch (error) {
//     res.status(401).json({ 
//       success: false, 
//       message: "Invalid or expired token. Please login again." 
//     });
//   }
// };

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: "Login required" });
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
     
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

