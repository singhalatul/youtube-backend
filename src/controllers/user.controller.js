import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        
        console.log(refreshToken);
        console.log(accessToken);

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken,refreshToken}

    }catch(err){
        throw new ApiError(500,"Somrthing went wrong")
    }
}

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
    console.log(req.body)

    if(
        [fullName,email,age,password,username].some
        ((field)=>field?.trim() === ""))
        {
        throw new ApiError(400,"All fields are required")  
    }

    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = (req.files?.coverImage[0]?.path) || "";
    // console.log(req.files?.avatar[0]);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);

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

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const verifiedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(verifiedToken?._id).select(
            "-password"
        )
    
        if(!user){
            throw new ApiError(401,"invalid token")
        }
    
        if(user?.refreshToken !== incomingRefreshToken){
    
           throw new ApiError(401,"refresh token is expired or used");
        }
    
        const options ={
            httpOnly:true,
            secure:true
        } 
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {accessToken,refreshToken:newRefreshToken},
                "token generated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const changeUserPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect){
    throw new ApiError(401,"incorrect password");
   }

   user.password = newPassword;
   await user.save({validateBeforeSave:false})

   return res.status(200)
   .json(
        new ApiResponse(200,{},"password change successfully")
   )
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    const userInfo = req.user
    return res.status(200).json(
        new ApiResponse(200,
        {
            userinfo
        },
        "getting user successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await findByIdAndUpdate(req.user?._id,
        {
            $set :{fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200,
        {
            user
        },
        "update name successfully"
    ))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError("401","Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password");

    if(!user){
        throw new ApiError(401,"invalid user")
    }

    user.remove(avatar.url)

    user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,
            {user},
            "avatar update successfully"
        )
    )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path
    
    if(!coverImageLocalPath){
        throw new ApiError("401","Avatar file is required")
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password");

    if(!user){
        throw new ApiError(401,"invalid user")
    }
    user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,
            {user},
            "coverImage update successfully"
        )
    )

})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new ApiError(400,"username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localfield:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount :{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount :{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond :{
                        if:{$in :[req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
    ])

    if(!channel){
        throw new ApiError(400,"channel does not exist")
    }

    return res.status(200).json(
        new ApiResponse(200,
            channel[0],
            " user channel fetch successfully"
        )
    )
})


export  {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}