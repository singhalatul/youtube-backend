import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Comment} from '../models/comment.model.js';
import {Video} from '../models/video.model.js';

const getVideoComments = asyncHandler(async(req,res)=>{
    const{page=1,limit=10,search}=req.query

    const comment = await Comment.aggregate([
        {
            $match:{
                ...(search ? { title : {$regex:search, $options:'i'}}:{})
            }
        },
        {
           $skip:(page-1)*limit
        },
        {
            $limit:limit
        }
    ])

    if(!comment){
        throw new ApiError(400,"comment not found")
    }

    return res.status(200).json(
        new ApiResponse(200,
            comment,
            "getting all comment successfully"
        )
    )
})

const addComment = asyncHandler(async(req,res)=>{
    const {con} = req.body;
    const user = req.user._id;
    const {videoId} = req.params;
   
    const video =  await Video.findById(videoId)
   
   if(!video){
    throw new ApiError(400,'video not found');
   }

    const newDoc = await Comment.create({
        content:con,
        owner:user._id,
        video:videoId
    })

    res.status(200).json(
        new ApiResponse(200,
            newDoc,
            "comment successfully"
        )
    )

})

const updateComment = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const {commentId} = req.params

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set:
            {
                content:content
            },
        },
        {
            new:true
        }
    )

    if(!comment){
        throw new ApiError(400,"comment not found");
    }
    comment.save();

    return res.status(200).json(
        new ApiResponse(200,
            comment,
            "comment successfully update"
        )
    )
    
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId,videoId} = req.params;

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(401,"video not found")
    }
    
    const comment = await Comment.findOneAndDelete({
        _id:commentId,
        video:videoId
    })

    if(!comment){
        throw new ApiError(400,'comment not found')
    }
    
    return res.status(200).json(
        new ApiResponse(200,
            {},
            "comment delete successfully"
        )
    )

})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment 
}