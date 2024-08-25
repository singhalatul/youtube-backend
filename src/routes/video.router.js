import {Router} from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from '../controllers/video.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';


const router = Router();
router.route('/publish').post(verifyJWT,upload.single("videoFile"),publishVideo)
router.route('/videos').get(getAllVideos)
router.route('/videos/:videoId').get(getVideoById)
router.route('/update/:videoId').patch(upload.single("videoFile"),updateVideo)
router.route('delete/:videoId').delete(deleteVideo)
router.route('/toggle/:videoId').get(togglePublishStatus)





export default router;