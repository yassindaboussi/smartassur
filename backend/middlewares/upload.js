const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Augmenté à 10MB pour les PDF
  fileFilter: (req, file, cb) => {
    const allowedImages = /jpeg|jpg|png|gif/;
    const allowedDocs = /pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedImages.test(ext) || allowedDocs.test(ext)) {
      return cb(null, true);
    }
    cb(new Error('Seules les images et PDF sont acceptés'));
  }
});

module.exports = upload;