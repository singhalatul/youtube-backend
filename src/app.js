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



//routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.router.js';
import healthCheckRouter from './routes/healthCheck.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import tweetRouter from './routes/tweet.routes.js';

//routes declaration
app.use('/api/v1/users',userRouter);
app.use('/api/v1/users/video',videoRouter)
app.use('/api/v1/users/health',healthCheckRouter)
app.use('/api/v1/users/likes',likeRouter)
app.use('/api/v1/users/comments',commentRouter)
app.use('/api/v1/users/playlist',playlistRouter)
app.use('/api/v1/users/subscription',subscriptionRouter)
app.use('/api/v1/users/tweet',tweetRouter)



// app.listen(process.env.PORT,()=>{
//     console.log(`server is listening at ${process.env.PORT}`);
// })

export default app;

//v8