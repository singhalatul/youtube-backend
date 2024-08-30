import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';

const router = Router()
router.route('/create').post(verifyJWT,createTweet)
router.route('/getTweet/:userId').get(getUserTweets)
router.route('/update/:tweetId').patch(updateTweet)
router.route('/delete/:tweetId').delete(deleteTweet)


export default router;