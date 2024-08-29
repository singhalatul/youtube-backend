import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PlayList } from "../models/playlist.model.js";
import {Video} from '../models/video.model.js';

const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body;
    const playlistName = await PlayList.findOne({
        name:name
    })
    if(playlistName){
        throw new ApiError(300,'playlist alredy available')
    }
    else{
        const newDoc = await PlayList.create({
            name,
            description,
            owner:req.user._id
        })
        return res.status(200).json(
       new ApiResponse(200,
           newDoc,
           "playlist create successfully"
       )
    )
    }

})

const getUserPlaylists = asyncHandler(async(req,res) => {
    const {userId} = req.params
    
    const playlists = await PlayList.find({
        owner:userId
    })

    if(!playlists){
        throw new ApiError(400,'playlists not found')
    }
    
    return res.status(200).json(
        new ApiResponse(200,
            playlists,
            "fetch user playlist successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
   
    const playlist = await PlayList.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,'playlist not found')
    }

    return res.status(200).json(
        new ApiResponse(200,
            playlist,
            "playlist fetch successfully"
        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(401,"video not found");
    }

    const playlist = await PlayList.findById(playlistId)

    if(!playlist){
        throw new ApiError(401,"playlist not found");
    }

    if(!playlist.video.includes(videoId)){
        playlist.video.push(videoId);
        await playlist.save();
    }

    return res.status(200).json(
        new ApiResponse(200,
            playlist.video.map((video)=>video),
            "playlist create successfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    const playlist = await PlayList.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,'playlist not found')
    }

    const video = playlist.video.indexOf(videoId)

    if(video == -1){
        throw new ApiError(404,'video not found')
    }

    playlist.video.splice(video,1)
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200,
            {},
            "video removed from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    const playlist = await PlayList.findOneAndDelete({
        _id:playlistId
    })

    if(!playlist){
        throw new ApiError(400,'playlist not found');
    }

    return res.status(200).json(
        new ApiResponse(200,
            {},
            "playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!name && !description){
        throw new ApiError(400,"All fields are required")
    }
    const playlist = await PlayList.findByIdAndUpdate(playlistId,
        {
            $set:{
                name,
                description
            }
        },
        {
            new :true
        }
    )
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200,
            playlist,
            "playlist updated successfully"
        )
    )

})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}