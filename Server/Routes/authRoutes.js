import express from 'express';
import { isAuthenticated, login, logout, register, sendVerifyOTP, verifyEmail } from '../Controllers/AuthController.js';
import { userAuth } from '../Middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.post("/logout",logout);
authRouter.post("/send-Verify-Otp",userAuth,sendVerifyOTP)
authRouter.post("/Verify-Account",userAuth,verifyEmail)
authRouter.post("/is-auth",isAuthenticated,verifyEmail)
authRouter.post("/resetPassword",isAuthenticated,verifyEmail)

export default authRouter;