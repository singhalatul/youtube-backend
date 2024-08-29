import Router from 'express';
import { getUserChannelSubscribers, toggleSubscription,getSubscribedChannels } from '../controllers/subscription.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/toggle/:channelId').post(verifyJWT,toggleSubscription)
router.route('/subscriber/:channelId').get(getUserChannelSubscribers)
router.route('/channel/:channelId').get(getSubscribedChannels)


export default router;