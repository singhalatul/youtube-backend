// require ('dotenv').config({path:'../env'})
import dotenv from "dotenv";
import connectDB from './db/db.js';

dotenv.config({
    path:'../env'
})


connectDB();


















/*
import express from 'express';
const app = express();

( async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("err",()=>{
        console.log(err)
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on ${process.env.PORT} `)
        })
    }
    catch(err){
        console.error("Error :",err)
        throw err
        
    }
})()
*/