import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {userModel} from './../Models/userModels.js';
import transporter from '../Config/nodeMailer.js';

export const register = async(req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
       return res.json({success:false,message:"Missing Details"});
    }
    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success:false,message:'User already exists'});
        }
        const hashedPassword = await bcrypt.hash(password,1,) //* Bigger the number, more the security, more time it takes to create
        const user = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        });

        await user.save();

        //* Generating the token
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        //* Adding the token to the cookie of the client
        res.cookie('token',token,{
            httpOnly:true, //* Only http request can access this cookie
            secure: process.env.NODE_ENV=='production'?true:false, //* This will be true on production server otherwise false
            sameSite: process.env.NODE_ENV == 'production'?'none':'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });
        
        //* Creating the welcome email
        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : email,
            subject : 'Welcome to MERN AUTH',
            text : `Welcome to MERN AUTH website, your account has been created with email id : ${email}`
        }

        //* Sending the email to the user with the help of transporter
        await transporter.sendMail(mailOptions);

        return res.json({success:true});

    } catch (error) {
        console.log("catch error ",error);
        res.json({success:false,message:error.message})
    }
}




export const login = async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password)
        return res.json({success:false,message:"Missing Credentials"});

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"Invalid Email"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        //? console.log(isMatch);
        if(!isMatch){
            return res.json({success:false,message:"Invalid Password"});
        }

        //* Generating the token
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        //* Adding the token to the cookie of the client
        res.cookie('token',token,{
            httpOnly:true, //* Only http request can access this cookie
            secure: process.env.NODE_ENV=='production'?true:false, //* This will be true on production server otherwise false
            sameSite: process.env.NODE_ENV == 'production'?'none':'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success:true,message:"Successfully logged in"});

    } catch (error) {
        //? console.error(error);
        return res.json({success:false,message:error.message});
    }
}




export const logout = async(req,res)=>{
    try {
        //* We are clearing the cookie with the token
        res.clearCookie('Cookie',{
            httpOnly:true,
            secure: process.env.NODE_ENV=='production'?true:false, //* This will be true on production server otherwise false
            sameSite: process.env.NODE_ENV == 'production'?'none':'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000
        })
        return res.json({success:true,message:"logged out"})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}