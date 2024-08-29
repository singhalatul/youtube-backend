import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Subscription} from '../models/subscription.model.js'


const toggleSubscription = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
   try {
     const channel = await Subscription.findOne({
         channel:channelId,
         subscriber:req.user._id
     })
 
     if(channel){
         await channel.deleteOne({
            _id:channel._id
         })
         return res.status(200).json(
             new ApiResponse(200,
             false,
             "subscribe"
             )
         )
     }
     else{
          await Subscription.create({
             channel:channelId,
             subscriber:req.user._id
         })
        return res.status(200).json(
             new ApiResponse(200,
             true,
             "subscribed"
             )
         )
     }
   } catch (error) {
    return res.status(500).json(
        new ApiResponse(500, false, 'Server error')
    )
   }

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const channel = await Subscription.find({
        channel:channelId});
    if (!channel) {
       throw new ApiError(400,'channel not found');
    }

    const subscriber = await channel.map((subs)=>subs)

    if(!subscriber.length){
        throw new ApiError(404,'No subscribers found for this channel')
    }

    console.log(subscriber)

    return res.status(200).json(
        new ApiResponse(200,
        {subscriber,
        count :subscriber.length},
        "subscribed"
        )
    )

})
// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscriber = await Subscription.find({
        subscriber:subscriberId
    })

    if (!subscriber) {
        throw new ApiError(400,'no channel is subscribed');
     }

     const channel = await subscriber.map((subs)=>subs)

    if(!subscriber.length){
        throw new ApiError(404,'No subscribers found for this channel')
    }

    return res.status(200).json(
        new ApiResponse(200,
        channel,channel.length,
        "subscribed"
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
