import multer from 'multer';

// Use memory storage for serverless environments
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Configure multer upload with memory storage
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: imageFilter
});

// @desc   Upload single image (returns base64 data URL for serverless)
// @route  POST /api/upload/image
// @access Private (admin/editor)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Convert buffer to base64 data URL for serverless
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      success: true,
      url: dataUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc   Delete uploaded image (not available in serverless)
// @route  DELETE /api/upload/image/:filename
// @access Private (admin/editor)
export const deleteImage = async (req, res) => {
  // In serverless mode, images are returned as base64 data URLs
  // and not stored on the server, so delete is not applicable
  res.status(501).json({ 
    success: false, 
    message: 'Image deletion not supported in serverless mode. Images are stored as data URLs in the database.' 
  });
};
