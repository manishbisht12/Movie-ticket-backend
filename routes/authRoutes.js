// import express from "express";
// import {
//   registerUser,
//   verifyOtp,
//   setPassword,
//   loginUser,
//   logoutUser,
//   getUserDetails 
// } from "../controllers/authController.js";
// import { isAuthenticated } from "../middleware/auth.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/verify-otp", verifyOtp);
// router.post("/set-password", setPassword);
// router.post("/login", loginUser);
// router.get("/logout", logoutUser);

// // Protected Route
// router.get("/me", isAuthenticated, getUserDetails);

// export default router;




//firebase

import express from "express";
import {
  firebaseLogin,
  logoutUser,
  getUserDetails,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/firebase-login", firebaseLogin);
router.get("/logout", logoutUser);
router.get("/me", isAuthenticated, getUserDetails);

export default router;
