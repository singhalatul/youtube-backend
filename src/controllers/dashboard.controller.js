import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.params.channelId
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(404,"channel not found");
    }

    const videos = await Video.find({
        owner:channelId
    })
    const video = await videos.map((vid)=>vid) 
    const totalVideos = video.length
    
    if(!totalVideos){
        throw new ApiError(404,'video not found')
    }
    const totalViewsResult = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId) , isPublished:true
            }
        },
        {
            $group:{
             _id:null,
             totalViews:{$sum:"$views"}
            }
        }
    ])
    const totalViews = totalViewsResult[0]?.totalViews || 0

    const totalSubscribers = await Subscription.countDocuments({
        channel:channelId
    })

    const totalLikeResult = await Like.aggregate([
        {
            $lookup:{
                from:'videos',
                localField:'video',
                foreignField:'_id',
                as:'videoDetails',
                
            }
        },
        {
            $addFields:{
                videoDetails:{
                    $first:"$videoDetails"
                }
            }
        },
        {
            $match:{
                'videoDetails.owner':new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:null ,
                totalLike:{$sum:1}
            }
        }
    ])
    const totalLikes = totalLikeResult[0]?.totalLike || 0

    const channelStats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };

    return res.status(200).json(
        new ApiResponse(200,
            channelStats,
            "getting all stats successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.params.channelId
    const {page=1,limit=10} = req.query

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(404,"channel not found");
    }

    // const options = {
    //     page:parseInt(page,10),
    //     limit:parseInt(limit,10),
    //     sort:{createdAt : -1} 
    // }

   const result = await Video.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(channelId),
            isPublished:true
        }
    },
    {
        $skip:(page-1)*limit
    },
    {
        $limit:limit
    }
   ])

    if(!result.length){
        throw new ApiError(404,'video not found on this channel')
    }
 
    return res.status(200).json(
        new ApiResponse(200,
            result,
            "getting All video Successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }