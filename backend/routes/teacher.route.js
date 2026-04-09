const express = require('express');
const { verifyToken } = require('../middleware/verifyToken.js');
const { requireInstructor } = require('../middleware/roleCheck.js');
const {
    getAssignedCourses,
    getEnrolledStudents,
    markGrade,
    markAttendance,
    createAssignment,
    getTeacherAssignments,
    getReceivedMessages,
    getUnreadMessageCount,
    markMessageAsRead,
    markAllMessagesAsRead,
    deleteReceivedMessage
} = require('../controllers/teacher_functionality.js');
const { uploadAssignment } = require('../config/cloudinary.js');

const router = express.Router();

/* =========================================================================================================
                                        Teacher Routes - INSTRUCTOR OR HEAD DEPT ACCESS
==========================================================================================================*/

// Get all courses assigned to the teacher
router.get('/teacher/courses', verifyToken, requireInstructor, getAssignedCourses);

// Get all students enrolled in teacher's courses
router.get('/teacher/students', verifyToken, requireInstructor, getEnrolledStudents);

// Mark grade for a student
router.post('/teacher/mark-grade', verifyToken, requireInstructor, markGrade);

// Mark attendance for students
router.post('/teacher/mark-attendance', verifyToken, requireInstructor, markAttendance);

// Create assignment for a course
router.post('/teacher/create-assignment', verifyToken, requireInstructor, (req, res, next) => {
    uploadAssignment.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        next();
    });
}, createAssignment);

// Get all assignments by the teacher
router.get('/teacher/assignments', verifyToken, requireInstructor, getTeacherAssignments);

/* =========================================================================================================
                                    Teacher Message Routes - INSTRUCTOR ONLY
==========================================================================================================*/

// Get all messages received by the teacher
router.get('/teacher/messages', verifyToken, requireInstructor, getReceivedMessages);

// Get unread message count
router.get('/teacher/messages/unread-count', verifyToken, requireInstructor, getUnreadMessageCount);

// Mark a specific message as read
router.put('/teacher/messages/:messageId/mark-read', verifyToken, requireInstructor, markMessageAsRead);

// Mark all messages as read
router.put('/teacher/messages/mark-all-read', verifyToken, requireInstructor, markAllMessagesAsRead);

// Delete a received message
router.delete('/teacher/messages/:messageId', verifyToken, requireInstructor, deleteReceivedMessage);

module.exports = router;
