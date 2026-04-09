const teacherService = require('../service/teacher.service');

exports.getAssignedCourses = async (req, res) => {
    try {
        const courses = await teacherService.getAssignedCourses(req.user._id);

        res.status(200).json({
            success: true,
            data: courses,
            message: 'Assigned courses retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching assigned courses:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while fetching courses'
        });
    }
};

exports.getEnrolledStudents = async (req, res) => {
    try {
        const students = await teacherService.getEnrolledStudents(req.user._id);

        res.status(200).json({
            success: true,
            data: students,
            message: 'Enrolled students retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching enrolled students:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while fetching students'
        });
    }
};

exports.markGrade = async (req, res) => {
    try {
        const { studentId, courseId, grade, gradePoint, semester, remarks } = req.body;

        const result = await teacherService.markGrade(
            { studentId, courseId, grade, gradePoint, semester, remarks },
            req.user._id
        );

        res.status(200).json({
            success: true,
            data: result,
            message: 'Grade marked successfully'
        });
    } catch (error) {
        console.error('Error marking grade:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Grade already exists for this student-course-semester combination'
            });
        }
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while marking grade'
        });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, deadline, submissionType } = req.body;

        const assignment = await teacherService.createAssignment(
            { courseId, title, description, deadline, submissionType, file: req.file },
            req.user._id
        );

        res.status(201).json({
            success: true,
            data: assignment,
            message: 'Assignment created successfully'
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while creating assignment'
        });
    }
};

exports.getTeacherAssignments = async (req, res) => {
    try {
        const assignments = await teacherService.getTeacherAssignments(req.user._id);

        res.status(200).json({
            success: true,
            data: assignments,
            message: 'Assignments retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while fetching assignments'
        });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, attendanceRecords } = req.body;

        const attendanceResults = await teacherService.markAttendance(
            { courseId, date, attendanceRecords },
            req.user._id
        );

        res.status(200).json({
            success: true,
            data: attendanceResults,
            message: 'Attendance marked successfully'
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Server error while marking attendance'
        });
    }
};

exports.getReceivedMessages = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const result = await teacherService.getReceivedMessages({ page, limit }, req.user);

        res.status(200).json({
            success: true,
            data: result.messages,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error fetching received messages:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getUnreadMessageCount = async (req, res) => {
    try {
        const result = await teacherService.getUnreadMessageCount(req.user);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await teacherService.markMessageAsRead(messageId, req.user);

        res.status(200).json({
            success: true,
            data: message,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.markAllMessagesAsRead = async (req, res) => {
    try {
        const result = await teacherService.markAllMessagesAsRead(req.user);

        res.status(200).json({
            success: true,
            data: result,
            message: `${result.modifiedCount} message(s) marked as read`
        });
    } catch (error) {
        console.error('Error marking all messages as read:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.deleteReceivedMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        await teacherService.deleteReceivedMessage(messageId, req.user);

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};
