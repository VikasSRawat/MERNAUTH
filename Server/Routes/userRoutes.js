import express from 'express';
import { userAuth } from '../Middleware/userAuth.js';
import { getUserData } from '../Controllers/userController.js';

const userRouter = express.Router();

//? userRouter.get("/data", userAuth,()=>{console.log("Api getting hit here in userRoutes")},getUserData);

userRouter.get("/data", userAuth, (req, res, next) => {
  console.log("Api getting hit here in userRoutes");
  next();
}, getUserData);



export default userRouter;