import Router from 'express';
import { 
    addVideoToPlaylist,
     createPlaylist, 
     deletePlaylist, 
     getPlaylistById, 
     getUserPlaylists, 
     removeVideoFromPlaylist, 
     updatePlaylist } from '../controllers/playlist.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = Router();
router.route('/create').post(verifyJWT,createPlaylist)
router.route('/user/:userId').get(getUserPlaylists)
router.route('/p/:playlistId').get(getPlaylistById)
router.route('/add/:playlistId/:videoId').post(addVideoToPlaylist)
router.route('/remove/:playlistId/:videoId').delete(removeVideoFromPlaylist)
router.route('/delete/:playlistId').delete(deletePlaylist)
router.route('/update/:playlistId').patch(updatePlaylist)


export default router;