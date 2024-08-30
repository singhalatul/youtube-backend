import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Tweet} from '../models/tweets.model.js';
import {User} from '../models/user.model.js';
import { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const userId = req.user._id

    if(!content){
        throw new ApiError(500,'all fileds are required')
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"user not found")
    }

    const newDoc = await Tweet.create({
        content,
        owner:userId
    })


    return res.status(200).json(
        new ApiResponse(200,
            newDoc,
            "tweet successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.params.userId;

    if(!isValidObjectId(userId)){
        throw new ApiError(400,'Invalid User Id')
    }

    const tweet = await Tweet.find({
        owner:userId
    })

    if(!tweet.length){
        throw new ApiError(400,"No tweet found")
    }

    return res.status(200).json(
        new ApiResponse(200,
        tweet,
        "getting all tweet successfully"
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalidd tweet id")
    }

    if(!content){
        throw new ApiError(500,'all fileds are required')
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!tweet){
        throw new ApiError(404,"No tweet found")
    }

    // await tweet.save();

    return res.status(200).json(
        new ApiResponse(200,
            tweet,
            "tweet updated sucessfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(500,"internal server error")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(404,"No tweet found")
    }

    return res.status(200).json(
        new ApiResponse(200,
            {},
            "tweet deleted sucessfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}