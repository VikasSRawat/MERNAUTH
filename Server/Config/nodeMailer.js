import nodemailer from 'nodemailer';
import configDotenv from 'dotenv';
//* Creating the transporter
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user : process.env.GMAIL_EMAIL,
        pass : process.env.GMAIL_PASS,
    }
});


export default transporter;