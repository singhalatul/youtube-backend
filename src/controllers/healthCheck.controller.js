import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler (async(req,res)=>{

    try{

        return res.status(200).json(
            new ApiResponse(200,
            {},
            "Everything is ok"
            )
        )
    }catch(err){
        throw new ApiError(500,err.message||"internal server error")
    }
})



export {healthCheck}