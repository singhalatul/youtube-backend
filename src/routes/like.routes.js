import Router from "express";
import {toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideos
} from '../controllers/like.controller.js'
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();
router.route('/video/:videoId').post(verifyJWT,toggleVideoLike)
router.route('/comment/:commentId').post(verifyJWT,toggleCommentLike)
router.route('/tweet/:tweetId').post(verifyJWT,toggleTweetLike)
router.route('/allvideos').get(verifyJWT,getAllLikedVideos)


export default router;