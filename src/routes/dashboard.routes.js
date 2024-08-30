import Router from 'express';
import { getChannelStats, getChannelVideos } from '../controllers/dashboard.controller.js';

const router = Router();

router.route('/getstats/:channelId').get(getChannelStats)
router.route('/videos/:channelId').get(getChannelVideos)

export default router;