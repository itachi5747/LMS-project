const express = require('express')
const { logout, login, forgotPassword, resetPassword, checkAuth } = require("../controllers/auth.js");
const { createDepartment, addInstructorToDepartment, getuser, getUserByNameAndId, getUserProfile, getAllDepartments, getDepartmentStats, getAllDepartmentsWithStats, getUniversityStats, updateStudent, updateInstructor, updateCourse, assignCourseToInstructor, unassignCourseFromInstructor, createHeadInstructor } = require('../controllers/admin_functionality.js')
const { verifyToken } = require('../middleware/verifyToken.js');
const { requireAdmin, requireHeadDept, requireStudent, requireAdminOrHead } = require('../middleware/roleCheck.js');
const { createInstructor, createStudent, createCourse, assignCourseToInstructorr, getHeadDepartmentStats, getDepartmentCourses, getuserr: getHeadUsers, departmentupdate, createChallan, assignChallanToSemester, getDepartmentChallans, toggleCourseRegistration, toggleDepartmentRegistration, getAllDepartmentStudents, updateStudentChallanToPaid, sendMessageToInstructor, sendMessageToAllInstructors, getHeadSentMessages, deleteMessage } = require('../controllers/head_functionality.js');
const { getAllCourses, enrollInCourse, unregisterFromCourse, getEnrolledCourses, viewStudentChallans, viewStudentGrades, getStudentAssignments, submitAssignment, downloadAssignment } = require('../controllers/student_functionalty.js');
const { uploadSubmission } = require('../config/cloudinary.js');

const router = express.Router();
/* =========================================================================================================
                                        Authentication Routes
==========================================================================================================*/
router.get("/check-auth", verifyToken, checkAuth);

// Note: Sign up removed - users are created by admin/head only
router.post("/login", login);
router.post("/logout", logout);

// router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

/* =========================================================================================================
                                        Admin Routes - ONLY ADMIN ACCESS
==========================================================================================================*/
router.post('/admin/add-instructor', verifyToken, requireAdmin, createHeadInstructor)
router.post('/admin/create-department', verifyToken, requireAdmin, createDepartment)
router.post('/admin/add-instructor-department', verifyToken, requireAdmin, addInstructorToDepartment)
router.get('/admin/get-user', verifyToken, requireAdmin, getuser)
router.get('/admin/search-user', verifyToken, requireAdmin, getUserByNameAndId)
router.get("/admin/departments/stats", verifyToken, requireAdmin, getAllDepartmentsWithStats);
router.get("/admin/university/stats", verifyToken, requireAdmin, getUniversityStats);
router.put("/admin/update-student/:studentId", verifyToken, requireAdmin, updateStudent);
router.put("/admin/update-instructor/:instructorId", verifyToken, requireAdmin, updateInstructor);
router.put("/admin/update-course/:courseId", verifyToken, requireAdmin, updateCourse);
router.post("/admin/assign-course-to-instructor", verifyToken, requireAdmin, assignCourseToInstructor);
router.post("/admin/unassign-instructor", verifyToken, requireAdmin, unassignCourseFromInstructor);

/* =========================================================================================================
                                        Department Head Routes - ONLY HEAD DEPT ACCESS
==========================================================================================================*/
router.post('/head-dept/create-instructor', verifyToken, requireHeadDept, createInstructor)
router.post('/head-dept/create-student', verifyToken, requireHeadDept, createStudent)
router.post('/head-dept/create-course', verifyToken, requireHeadDept, createCourse)
router.post('/head-dept/assign-course', verifyToken, requireHeadDept, assignCourseToInstructorr)
router.get('/head-dept/department-stats', verifyToken, requireHeadDept, getHeadDepartmentStats)
router.get('/head-dept/department-courses', verifyToken, requireHeadDept, getDepartmentCourses)
router.get('/head-dept/department-users', verifyToken, requireHeadDept, getHeadUsers)
router.put('/head-dept/nig', verifyToken, requireHeadDept, departmentupdate)
router.post('/head-dept/create-challan', verifyToken, requireHeadDept, createChallan)
router.post('/head-dept/assign-challan-to-semester', verifyToken, requireHeadDept, assignChallanToSemester)
router.get('/head-dept/challans', verifyToken, requireHeadDept, getDepartmentChallans)
router.get('/head-dept/get-all-students', verifyToken, requireHeadDept, getAllDepartmentStudents)
router.post('/head-dept/update-challan-to-paid', verifyToken, requireHeadDept, updateStudentChallanToPaid)
router.put('/head-dept/course/:courseId/toggle-registration', verifyToken, requireHeadDept, toggleCourseRegistration)
router.put('/head-dept/department-toggle-registration', verifyToken, requireHeadDept, toggleDepartmentRegistration)

// Messaging Routes - Head Dept only
router.post('/head-dept/send-message-to-instructor', verifyToken, requireHeadDept, sendMessageToInstructor)
router.post('/head-dept/send-message-to-all-instructors', verifyToken, requireHeadDept, sendMessageToAllInstructors)
router.get('/head-dept/sent-messages', verifyToken, requireHeadDept, getHeadSentMessages)
router.delete('/head-dept/messages/:messageId', verifyToken, requireHeadDept, deleteMessage)

/* =========================================================================================================
                                        Shared Routes - Admin OR Head Dept Access
==========================================================================================================*/
router.get('/admin/get-user', verifyToken, requireAdminOrHead, getHeadUsers)

/* =========================================================================================================
                                        Student Routes - ONLY STUDENT ACCESS
==========================================================================================================*/
router.get("/student/courses", verifyToken, requireStudent, getAllCourses);
router.post("/student/courses/:courseId/enroll", verifyToken, requireStudent, enrollInCourse);
router.post("/student/courses/:courseId/unregister", verifyToken, requireStudent, unregisterFromCourse);
router.get("/student/courses/enrolled", verifyToken, requireStudent, getEnrolledCourses);
router.get("/student/challans", verifyToken, requireStudent, viewStudentChallans);
router.get("/student/grades", verifyToken, requireStudent, viewStudentGrades);
router.get("/student/assignments", verifyToken, requireStudent, getStudentAssignments);
router.get("/student/assignments/:assignmentId/download", verifyToken, requireStudent, downloadAssignment);
router.post("/student/assignments/:assignmentId/submit", verifyToken, requireStudent, (req, res, next) => {
    uploadSubmission.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        next();
    });
}, submitAssignment);

/* =========================================================================================================
                                        Public/Shared Routes - Any Authenticated User
==========================================================================================================*/
router.get('/user-profile/:id', verifyToken, getUserProfile)
router.get("/departments", verifyToken, getAllDepartments);
router.get("/departments/:id", verifyToken, getDepartmentStats);

module.exports = router;
