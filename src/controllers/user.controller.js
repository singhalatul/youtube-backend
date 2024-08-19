import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler( async (req,res)=>{
  //get user data from frontend
   //validation
   //check if user already exist
   //check for images , chack for avatar
   //upload them to cloudinary,check upload
   //update in datatbase
   //remove pass and refresh token filed from res
   //check for user creation
   //response

   const {username,
    age,
    email,
    password,
    fullName} = req.body
    console.log(email)

    if(
        [fullName,email,age,password,username].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")  
    }

    const existedUser = User.findOne({
        $or: [{username} , {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"avatar not found")
    }

    const user = await User.create({
        fullName,
        age,
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase()
    })

    const createdUser = await User.findOne(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500,"something went wrong")
    }

     return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
})


export  {registerUser}