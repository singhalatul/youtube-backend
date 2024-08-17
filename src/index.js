// require ('dotenv').config({path:'../env'})
import dotenv from "dotenv";
import connectDB from './db/db.js';
import app from './app.js';

dotenv.config({
    path:'../env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`app is successfully listen on ${process.env.PORT}`)
        app.on("err",(err)=>{
            console.log("Express error :",err);
            throw err;
        })
    })
})
.catch((err)=>{
    console.log("MONGODB connection Error !!!",err)
})


















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