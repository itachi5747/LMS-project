// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');
// require('dotenv').config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     // secure: true
// });

// const assignmentStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => ({
//         folder: 'legend',
//         resource_type: 'auto',
//         type: 'upload',           // explicitly set delivery type to public upload
//         access_mode: 'public',    // now properly passed per-upload
//         format: undefined,        // let Cloudinary keep original format
//     })
// })
// const uploadAssignment = multer({
//     storage: assignmentStorage,
//     limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
// });

// const submissionStorage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'submissions',
//         resource_type: 'auto',
//         allowed_formats: ['pdf', 'doc', 'docx', 'cpp', 'py', 'java', 'js', 'ts', 'c', 'h', 'hpp', 'cs', 'rb', 'go', 'rs', 'php', 'swift', 'kt', 'r', 'sql', 'html', 'css', 'txt', 'zip', 'rar']
//     }
// });

// const uploadSubmission = multer({
//     storage: submissionStorage,
//     limits: { fileSize: 10 * 1024 * 1024 }
// });

// module.exports = { cloudinary, uploadAssignment, uploadSubmission };
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Just store file in memory, we'll upload manually
const uploadAssignment = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadSubmission = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Helper to upload buffer directly to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'raw',
                type: 'upload',
                access_mode: 'public',
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

module.exports = { cloudinary, uploadAssignment, uploadSubmission, uploadToCloudinary };