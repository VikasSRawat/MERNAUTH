import { userModel } from "../Models/userModels.js";

export const getUserData = async(req,res)=>{
    console.log("API Getting hit here");
    try {
        const {userId} = req.body;
        const user = await userModel.findById({userId});
        if(!user){
            return res.status(404).json({success:false,message:"user not found"});
        }

        res.status(200).json({success:true,userData:{
            name : user.name,
            isAccountVerified : user.isAccountVerified
        }});
    } catch (error) {
        res.status(400).json({success:false,message:error.message});
    }
}