import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Check if uploads directory exists, if not, create it
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads'); // Aapka path
    },
    filename: function (req, file, cb) {
        // Sirf Date.now() mat use karein, saath mein random number bhi dalein
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        // File ka extension nikalne ke liye
        const ext = path.extname(file.originalname); 
        
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    // Check file type (only images allowed)
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        // If the file is not an image, return an error message
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Multer configuration with file size limit (optional, 10MB here)
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB size limit (adjust as needed)
    }
});

// Middleware to handle Multer errors
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors (like file size limit or field name mismatch)
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // Other errors (like file filter rejection)
        return res.status(400).json({ message: 'An error occurred during file upload', error: err.message });
    }
    next(); // Pass to the next middleware if no errors
};

// export { upload, multerErrorHandler };
export default upload;
