import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const playListSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    video:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

playListSchema.plugin(mongooseAggregatePaginate);

export const PlayList = mongoose.model("playList",playListSchema);