import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from '../models/video.model.js';
// import {User} from '../models/user.model.js';
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js";


const publishVideo = asyncHandler(async(req,res)=>{
    const {title,description,thumbnail} = req.body;

    const videoFilePath = req.file?.path;

    if(!videoFilePath){
        throw new ApiError(400,"video not found")
    }

    const owner  = req.user._id;
        
    try {
        const video = await uploadOnCloudinary(videoFilePath)
    
        if(!video.url){
            throw new ApiError(401,"video not found")
        }
        console.log(video.url)
    
        const newVideo = await Video.create({
            title,
            description,
            thumbnail,
            videoFile:video.url,
            duration:video.duration,
            owner:owner,
            publicId:video.public_id
        })
    
    
        return res.status(200).json(
            new ApiResponse(200,
               { data:newVideo},
                "video upload successfully"
            )
        )
    } catch (error) {
        console.log(error.message || "file uploading error")
    }
})

const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10,search,sortBy='createdAt',sortOrder='desc'} = req.query;

    if(page<1 || limit<1){
        throw new ApiError(400,'Invalid page or limit values');
    }

    const videos = await Video.aggregate([
        {
             $match: {
            // owner: new mongoose.Types.ObjectId(userId),
            ...(search ? { title: { $regex: search, $options: 'i' } } : {}),
             }
        },
        {
            $sort:{
                [sortBy] : sortOrder === 'asc'? 1 :-1
            }
        },
        {
            $skip:(page - 1)*limit
        },
        {
            $limit:limit
        }
    ])

    // console.log(videos.map((video)=>video));

    if(!videos?.length){
        throw new ApiError(400,"videos not found")
    }

   return res.status(200).json(
       new ApiResponse( 200,
        videos,
        "videos loaded successfully"    
      )
    )

})

const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    const video = await Video.findById(videoId)

    console.log(video);

    if(!video){
        throw new ApiError(400,'video not found');
    }

    return res.status(200).json(
        new ApiResponse(200,
            video,
            "video fetched Successfully"
        )
    )
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const videofile = await Video.findById(videoId)
    const videoPath = req.file?.path
    if(!videoPath){
        throw new ApiError(400,"video not available")
    }
//    const publicId =  videofile.publicId
   console.log(videofile.publicId)
    await deleteFromCloudinary(videofile.publicId);

    const video = await uploadOnCloudinary(videoPath)

    if(!video.url){
        throw new ApiError(400,"video not available on cloudinary");
    }

    const newVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
               videoFile: video.url,
               publicId:video.public_id
            }
        },
        {
            new:true
        }
    )
    
    return res.status(200).json(
        new ApiResponse(200,
            newVideo,
            "Video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    const videoFile = await Video.findByIdAndDelete(videoId);
    await deleteFromCloudinary(videoFile.publicId)

    return res.status(200).json(
        new ApiResponse(200,
            {},
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const videoFile = await Video.findById(videoId)

    if(!videoFile){
        throw new ApiError(400,"video not found")
    }
    videoFile.isPublished = !videoFile.isPublished;
    await videoFile.save()

    return res.status(200).json(
        new ApiResponse(200,
            videoFile.isPublished,
            "status fetched Successfully"
        )
    )

})

export {publishVideo,
getAllVideos,
getVideoById,
updateVideo,
deleteVideo,
togglePublishStatus
}