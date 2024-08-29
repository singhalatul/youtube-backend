import Router from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.js';

const router = Router();
router.route('/get').get(getVideoComments)
router.route('/add/:videoId').post(verifyJWT,addComment)
router.route('/update/:commentId').patch(updateComment)
router.route('/delete/:commentId/:videoId').delete(verifyJWT,deleteComment)


export default router;