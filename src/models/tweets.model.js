import mongoose from 'mongoose'

const tweetSchema = new Mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})

export const tweet = mongoose.model("Tweet",tweetSchema);