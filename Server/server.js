import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import {connectDB} from './Config/mongodb.js';
import authRouter from './Routes/authRoutes.js';


const app = express();

const PORT = process.env.PORT||4000;

connectDB();

app.use(express.json()); // All requests will be passed using json
app.use(cookieParser());
app.use(cors({credentials:true})); // Can send cookies in response from the server

//* API Endpoints
app.get("/",(req,res)=>{
    res.send("API Working");
})
app.use('/api/auth',authRouter);

app.listen(PORT,()=>{
    console.log(`Listening on http://localhost:${PORT}`);
})