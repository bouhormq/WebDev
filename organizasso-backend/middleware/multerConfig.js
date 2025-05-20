import multer from 'multer';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

// --- Multer Setup for Profile Pictures ---
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Path relative to this file's location, then up one level to 'organizasso-backend', then 'uploads/profile-pics'
    const dest = path.join(__dirname, '..', 'uploads', 'profile-pics');
    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating profile-pics directory:', err);
        return cb(err, dest);
      }
      cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    // Ensure req.user.id is available, or use a fallback for safety if not (though 'protect' middleware should ensure it)
    const userId = req.user && req.user.id ? req.user.id : 'unknown_user';
    cb(null, 'profile-' + userId + '-' + uniqueSuffix + extension);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

export const uploadProfilePic = multer({
  storage: profilePicStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for profile pics
});

// --- Multer Setup for Content Images ---
const contentImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Path relative to this file's location, then up one level to 'organizasso-backend', then 'uploads/content-images'
    const dest = path.join(__dirname, '..', 'uploads', 'content-images');
    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating content-images directory:', err);
        return cb(err, dest);
      }
      cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const userId = req.user && req.user.id ? req.user.id : 'unknown_content_uploader';
    cb(null, 'content-' + userId + '-' + uniqueSuffix + extension);
  }
});

export const uploadContentImage = multer({
  storage: contentImageStorage,
  fileFilter: imageFileFilter, // Reusing the same image filter
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for content images
});
