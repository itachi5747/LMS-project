const Course = require('../models/course.model');
const User = require('../models/user.model');
const Result = require('../models/result.model');
const Attendance = require('../models/attendance.model');
const Assignment = require('../models/assignment.model');
const Message = require('../models/message.model');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * Get all courses assigned to the teacher
 */
exports.getAssignedCourses = async (teacherId) => {
    const courses = await Course.find({
        instructors: teacherId
    })
        .populate('department', 'name code')
        .populate('instructors', 'name email')
        .select('title code description department instructors credits semester capacity enrolledStudents isRegistrationOpen');

    return courses;
};

/**
 * Get all students enrolled in teacher's courses
 */
exports.getEnrolledStudents = async (teacherId) => {
    // First get courses taught by this teacher
    const courses = await Course.find({
        instructors: teacherId
    }).populate({
        path: 'enrolledStudents.student',
        select: 'name email studentId phone semester'
    }).select('title code enrolledStudents');

    // Flatten the students from all courses
    const studentsMap = new Map();

    courses.forEach(course => {
        course.enrolledStudents.forEach(enrollment => {
            if (enrollment.status === 'enrolled') {
                const student = enrollment.student;
                if (!studentsMap.has(student._id.toString())) {
                    studentsMap.set(student._id.toString(), {
                        ...student.toObject(),
                        enrolledCourses: []
                    });
                }
                studentsMap.get(student._id.toString()).enrolledCourses.push({
                    courseId: course._id,
                    courseTitle: course.title,
                    courseCode: course.code,
                    enrollmentDate: enrollment.enrollmentDate,
                    status: enrollment.status
                });
            }
        });
    });

    return Array.from(studentsMap.values());
};

/**
 * Mark grade for a student
 */
exports.markGrade = async ({ studentId, courseId, grade, gradePoint, semester, remarks }, teacherId) => {
    // Validate required fields
    if (!studentId || !courseId || !grade || !gradePoint || !semester) {
        const error = new Error('Student ID, Course ID, grade, grade point, and semester are required');
        error.status = 400;
        throw error;
    }

    // Check if the course is assigned to this teacher
    const course = await Course.findOne({
        _id: courseId,
        instructors: teacherId
    });

    if (!course) {
        const error = new Error('You are not authorized to grade this course');
        error.status = 403;
        throw error;
    }

    // Check if student is enrolled in this course
    const isEnrolled = course.enrolledStudents.some(
        enrollment => enrollment.student.toString() === studentId && enrollment.status === 'enrolled'
    );

    if (!isEnrolled) {
        const error = new Error('Student is not enrolled in this course');
        error.status = 400;
        throw error;
    }

    // Create or update result
    const result = await Result.findOneAndUpdate(
        { student: studentId, course: courseId, semester },
        {
            grade,
            gradePoint,
            uploadedBy: teacherId,
            remarks,
            uploadedAt: new Date()
        },
        { upsert: true, new: true }
    )
        .populate('student', 'name email studentId')
        .populate('course', 'title code')
        .populate('uploadedBy', 'name');

    return result;
};

/**
 * Create assignment for a course
 */
exports.createAssignment = async ({ courseId, title, description, deadline, submissionType, file }, teacherId) => {
    if (!courseId || !title || !deadline || !submissionType) {
        const error = new Error('Course, title, deadline, and submission type are required');
        error.status = 400;
        throw error;
    }

    if (!file) {
        const error = new Error('Assignment file (PDF/DOC) is required');
        error.status = 400;
        throw error;
    }

    if (!['dashboard', 'class'].includes(submissionType)) {
        const error = new Error('Submission type must be either "dashboard" or "class"');
        error.status = 400;
        throw error;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
        const error = new Error('Deadline must be a future date');
        error.status = 400;
        throw error;
    }

    const course = await Course.findOne({ _id: courseId, instructors: teacherId });
    if (!course) {
        const error = new Error('You are not authorized to create assignments for this course');
        error.status = 403;
        throw error;
    }

    // Upload directly to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer, 'legend');

    const assignment = await Assignment.create({
        title,
        description: description || '',
        course: courseId,
        fileUrl: uploadResult.secure_url,
        filePublicId: uploadResult.public_id,
        deadline: deadlineDate,
        submissionType,
        createdBy: teacherId
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
        .populate('course', 'title code')
        .populate('createdBy', 'name email');

    return populatedAssignment;
};

/**
 * Get all assignments created by the teacher
 */
exports.getTeacherAssignments = async (teacherId) => {
    const assignments = await Assignment.find({ createdBy: teacherId })
        .populate('course', 'title code')
        .sort({ createdAt: -1 });

    return assignments;
};

/**
 * Mark attendance for students
 */
exports.markAttendance = async ({ courseId, date, attendanceRecords }, teacherId) => {
    // Validate required fields
    if (!courseId || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
        const error = new Error('Course ID, date, and attendance records array are required');
        error.status = 400;
        throw error;
    }

    // Check if the course is assigned to this teacher
    const course = await Course.findOne({
        _id: courseId,
        instructors: teacherId
    });

    if (!course) {
        const error = new Error('You are not authorized to mark attendance for this course');
        error.status = 403;
        throw error;
    }

    // Process attendance records
    const attendancePromises = attendanceRecords.map(async (record) => {
        const { studentId, status, remarks } = record;

        // Check if student is enrolled
        const isEnrolled = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === studentId && enrollment.status === 'enrolled'
        );

        if (!isEnrolled) {
            throw new Error(`Student ${studentId} is not enrolled in this course`);
        }

        // Create or update attendance
        return Attendance.findOneAndUpdate(
            { student: studentId, course: courseId, date: new Date(date) },
            {
                status,
                markedBy: teacherId,
                remarks
            },
            { upsert: true, new: true }
        );
    });

    const attendanceResults = await Promise.all(attendancePromises);

    return attendanceResults;
};

// ============================================
//    TEACHER MESSAGE FUNCTIONALITY
// ============================================

/**
 * Get all messages received by the teacher
 */
exports.getReceivedMessages = async ({ page = 1, limit = 10 }, user) => {
    // Verify user is an instructor
    if (user.role !== 'instructor') {
        const error = new Error('Access denied. Only instructors can receive messages.');
        error.status = 403;
        throw error;
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ recipient: user._id })
        .populate('sender', 'name email')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Message.countDocuments({ recipient: user._id });

    return {
        messages,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get unread message count
 */
exports.getUnreadMessageCount = async (user) => {
    // Verify user is an instructor
    if (user.role !== 'instructor') {
        const error = new Error('Access denied. Only instructors can receive messages.');
        error.status = 403;
        throw error;
    }

    const unreadCount = await Message.countDocuments({
        recipient: user._id,
        isRead: false
    });

    return { unreadCount };
};

/**
 * Mark a message as read
 */
exports.markMessageAsRead = async (messageId, user) => {
    // Verify user is an instructor
    if (user.role !== 'instructor') {
        const error = new Error('Access denied. Only instructors can mark messages as read.');
        error.status = 403;
        throw error;
    }

    const message = await Message.findById(messageId);
    if (!message) {
        const error = new Error('Message not found');
        error.status = 404;
        throw error;
    }

    // Verify the message is for the current user
    if (message.recipient.toString() !== user._id.toString()) {
        const error = new Error('You can only mark your own messages as read');
        error.status = 403;
        throw error;
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    await message.populate('sender', 'name email');
    await message.populate('department', 'name code');

    return message;
};

/**
 * Mark all messages as read
 */
exports.markAllMessagesAsRead = async (user) => {
    // Verify user is an instructor
    if (user.role !== 'instructor') {
        const error = new Error('Access denied. Only instructors can mark messages as read.');
        error.status = 403;
        throw error;
    }

    const result = await Message.updateMany(
        { recipient: user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );

    return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a received message
 */
exports.deleteReceivedMessage = async (messageId, user) => {
    // Verify user is an instructor
    if (user.role !== 'instructor') {
        const error = new Error('Access denied. Only instructors can delete received messages.');
        error.status = 403;
        throw error;
    }

    const message = await Message.findById(messageId);
    if (!message) {
        const error = new Error('Message not found');
        error.status = 404;
        throw error;
    }

    // Verify the message is for the current user
    if (message.recipient.toString() !== user._id.toString()) {
        const error = new Error('You can only delete your own messages');
        error.status = 403;
        throw error;
    }

    await Message.findByIdAndDelete(messageId);

    return { deleted: true };
};
