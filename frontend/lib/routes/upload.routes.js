import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { upload, uploadImage, deleteImage } from '../controllers/upload.controller.js';

const router = express.Router();

// Upload single image - requires authentication
router.post('/image', protect, upload.single('image'), uploadImage);

// Delete image - requires authentication
router.delete('/image/:filename', protect, deleteImage);

export default router;
