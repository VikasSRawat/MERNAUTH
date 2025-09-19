import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail } from '../Controllers/authController.js';
import { userAuth } from '../Middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.post("/logout",logout);
authRouter.post("/send-Verify-Otp",userAuth,sendVerifyOTP)
authRouter.post("/Verify-Account",userAuth,verifyEmail)
authRouter.post("/is-auth",userAuth,isAuthenticated)
authRouter.post("/sendresetotp",sendResetOTP)
authRouter.post("/reset-Password",resetPassword)

export default authRouter;