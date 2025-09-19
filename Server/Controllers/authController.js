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

        //* Generating the token with the automated user Id in the json
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
            from : process.env.GMAIL_EMAIL,
            to : email,
            subject : 'Welcome to MERN AUTH',
            text : `Welcome to MERN AUTH website, your account has been created with email id : ${email}`
        }

        //* Sending the email to the user with the help of transporter
        await transporter.sendMail(mailOptions);

        return res.json({success:true});

    } catch (error) {
        console.log("catch error ",error);
        res.status(403).json({success:false,message:error.message})
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


//* Send OTP to users for verification
export const sendVerifyOTP = async(req,res)=>{
    try {
        const {userId} = req.body; 
        const user = await userModel.findById(userId);
        
        if(user.isAccountVerified){
            return res.json({success:false,message:"User already verified"});
        }
        
        //* Script to generate a 6 digit random otp
        const otp = String(Math.floor(100000 + Math.random()*900000))

        user.verifyOtp = otp;

        //* The expiry date of the otp will only be valid for one day
        user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;

        await user.save();


        //* Creating the welcome email
        const mailOptions = {
            from : process.env.GMAIL_EMAIL,
            to : user.email,
            subject : 'Account verification otp',
            text : `Your otp is ${otp}. Please verify the otp using this.`
        }   

        //* Sending the user otp to the mail
        await transporter.sendMail(mailOptions);

        res.json({success:true,message : 'Verification OTP sent on email'});

        //? verifyUser();

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}

//* Verifying the email using the otp sent to the user's email
export const verifyEmail = async(req,res)=>{
    const {userId,otp} = req.body;

    if(!userId || !otp){
        return res.json({success:false,message:"Missing details"});
    }

    try {
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:"User not found"});
        }

        
        if(user.verifyOtp == '' || user.verifyOtp != otp){
            return res.json({success:false,message:'Invalid otp'})
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success:false,message:"OTP Already expired"});
            //? sendVerifyOTP();
        }

        

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({success:true,message:'email verified successfully'});


    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}


//* Verifying if user is already authenticated, this function will only execute after the user has been authenticated

export const isAuthenticated = async (req,res)=>{

    try {
        return res.json({success:true});
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}




export const sendResetOTP = async(req,res)=>{
    console.log("sendResetOTP Hit");
    const {email} = req.body;
    if(!email){
        return res.status(401).json({success:false,message:"Email missing"});
    }
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({success:false,message:"user not found"});
        }
        const otp = String(Math.floor(100000+Math.random()*900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15*60*1000;

        await user.save();

        //* Creating the welcome email
        const mailOptions = {
            from : process.env.GMAIL_EMAIL,
            to : user.email,
            subject : 'reset password otp',
            text : `Your otp is ${otp}. Please reset password using the otp using this.`
        }   

        //* Sending the user otp to the mail
        await transporter.sendMail(mailOptions);

        res.json({success:true,message : 'reset password OTP sent on email'});

    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}



//* Reseting the user password

export const resetPassword = async(req,res)=>{
    const {email,otp,newPassword} = req.body;
    
    if(!email || ! otp || newPassword){
        return res.json({success:false,message:"Missing Information",email,otp,newPassword});
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"User not found"});
        }

        if(user.resetOtp === '' || user.resetOtp != otp){
            return res.status(403).json({success:false,message:"Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.status(403).json({success:false,message:"Expired OTP"});
        }

        const hashedPassword = await bcrypt.hash(resetPassword,10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        
        await user.save();

        res.status(200).json({success:true,message:"Password has been reset"});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}