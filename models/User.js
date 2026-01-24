// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: false, 
//     },

//     otp: {
//       type: String,
//       required: false,
//     },

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     otpExpiresAt: {
//       type: Date,
//       required: false, 
//     },
//   },
//   {
//     timestamps: true, 
//   }
// );

// export default mongoose.model("User", userSchema);


//firebase

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: true, // Firebase already verified
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
