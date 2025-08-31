import mongoose from "mongoose";
import configDotenv from "dotenv";

export const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/MERNAUTH`);
        console.log("Connected to the database");
    } catch (error) {
        console.log("Error Connecting to the database\n"+error);
    }
}