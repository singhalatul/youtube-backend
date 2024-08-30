import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Like} from '../models/like.model.js';
import {Video} from '../models/video.model.js';
import {User} from '../models/user.model.js';
import {Comment} from '../models/comment.model.js'
import {Tweet} from '../models/tweets.model.js'
import mongoose from 'mongoose';

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const { videoId } = req.params;
    const user = req.user; // Assuming req.user is set by authentication middleware

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, 'Video not found');
    }

    try {
        // Check if the user has already liked the video
        const existingLike = await Like.findOne({ likedBy: user._id, video: video._id });

        if (existingLike) {
            // If a like exists, remove it
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(
                new ApiResponse(200, false, 'Video like removed')
            );
        } else {
            // If no like exists, create a new one
            await Like.create({
                likedBy: user._id,
                video: video._id
            });
            return res.status(200).json(
                new ApiResponse(200, true, 'Video liked')
            );
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(
            new ApiResponse(500, false, 'Server error')
        );
    }
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const { commentId } = req.params;
    const user = req.user; // Assuming req.user is set by authentication middleware

    // Find the tweet by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400, 'comment not found');
    }

    try {
        // Check if the user has already liked the comment
        const existingLike = await Like.findOne({ likedBy: user._id, comment: comment._id });

        if (existingLike) {
            // If a like exists, remove it
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(
                new ApiResponse(200, false, 'comment like removed')
            );
        } else {
            // If no like exists, create a new one
            await Like.create({
                likedBy: user._id,
                comment: comment._id
            });
            return res.status(200).json(
                new ApiResponse(200, true, 'comment liked')
            );
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(
            new ApiResponse(500, false, 'Server error')
        );
    }
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
    const { tweetId } = req.params;
    const user = req.user; // Assuming req.user is set by authentication middleware

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, 'tweet not found');
    }

    try {
        // Check if the user has already liked the tweet
        const existingLike = await Like.findOne({ likedBy: user._id, tweet: tweet._id });

        if (existingLike) {
            // If a like exists, remove it
            await Like.deleteOne({ _id: existingLike._id });
            return res.status(200).json(
                new ApiResponse(200, false, 'tweet like removed')
            );
        } else {
            // If no like exists, create a new one
            await Like.create({
                likedBy: user._id,
                tweet: tweet._id
            });
            return res.status(200).json(
                new ApiResponse(200, true, 'tweet liked')
            );
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(
            new ApiResponse(500, false, 'Server error')
        );
    }

})

const getAllLikedVideos = asyncHandler(async(req,res)=>{

    const likeVideo = await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'video',
                foreignField:'_id',
                as:'videoData',  
                pipeline:[
                    {
                        $project:{
                            _id:1
                        }
                    },
                ] 
            }, 
        },
        {
            $addFields:{
                videoData:{
                    $first:"$videoData"
                }
            }
        },
    ])

    console.log(likeVideo)

    return res.status(200).json(
        new ApiResponse(200,
            likeVideo,
            "getting all videos successfully"
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideos
}