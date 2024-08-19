import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//for security purpose 
//we can also use bodyparser
//data enters from the form element
app.use(express.json({limit:"16kb"}))
//data enters from url
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//public assests which is use to store pdfs and other files on server
app.use(express.static("public"))

//secure cookies which is used by server 
//only server can access it 
app.use(cookieParser());

export default app;

//v8