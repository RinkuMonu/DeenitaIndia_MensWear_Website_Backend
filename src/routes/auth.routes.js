import express from "express";
import { registerUser, logInUser, updateUserRole, editProfile, logoutUser, adminLogin, getAllUsers, getUserDetails, requestPasswordReset, resetPassword, googleSignIn, sendOtpLogin, verifyOtpAndLogin  } from "../controller/auth.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { verifyToken } from "../middleware/verifyToken.js";
// import { requestPasswordReset, resetPassword } from "../controller/Product.controller.js";

const authRoutes = express.Router();

authRoutes.use(express.urlencoded({ extended: true }));
authRoutes.use(express.json());

authRoutes.post("/signUp", registerUser);
authRoutes.post("/logIn", logInUser);


authRoutes.post("/send-otp-login", sendOtpLogin);
authRoutes.post("/verify-otp-login", verifyOtpAndLogin);

authRoutes.post("/admin_login", adminLogin)
authRoutes.get("/userInfo", verifyToken, getUserDetails)
authRoutes.get("/logOut", logoutUser);
authRoutes.post("/update", verifyToken, editProfile);
authRoutes.get("/allusers", isAdmin, getAllUsers)
authRoutes.put('/updateRole/:userId', isAdmin, updateUserRole);
authRoutes.post('/request-reset', requestPasswordReset);
authRoutes.post('/reset-password', resetPassword);
authRoutes.post("/google", googleSignIn);

export default authRoutes;
