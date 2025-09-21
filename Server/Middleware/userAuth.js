import jwt from "jsonwebtoken";


//! This is just for sending the id of the token which was set in the register function i.e., the 
//! the user Id mongodb set for the data when stored in the database

export const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.status(400).json({success:false,message:'Not Authorized Login Again'})
    }

    try {
        //* Decoding the token
        const tokenDecoded = jwt.verify(token,process.env.JWT_SECRET);

        //* If Id exists, insert it in the req body
        if(tokenDecoded.id){
            req.body.userId = tokenDecoded.id;
        }
        else{
            return res.status(400).json({success:false,message:'Not Authorized login again'});
        }
        next();
    } catch (error) {
        res.status(400).json({success:false,message:error.message});
    }
}