const studentService = require('../service/student.service');

const getAllCourses = async (req, res) => {
    try {
        const result = await studentService.getAllCourses(req.user);

        return res.json({ success: true, data: result });
    } catch (err) {
        console.error('getAllCourses error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const downloadAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const result = await studentService.downloadAssignment(assignmentId, req.user);

        if (result.redirectUrl) {
            return res.redirect(result.redirectUrl);
        }
    } catch (err) {
        console.error('downloadAssignment error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const enrollInCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId || req.body.courseId;

        await studentService.enrollInCourse(courseId, req.user);

        return res.json({ success: true, message: 'Enrolled successfully' });
    } catch (err) {
        console.error('enrollInCourse error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const unregisterFromCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId || req.body.courseId;

        await studentService.unregisterFromCourse(courseId, req.user);

        return res.json({ success: true, message: 'Unregistered successfully' });
    } catch (err) {
        console.error('unregisterFromCourse error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const getEnrolledCourses = async (req, res) => {
    try {
        const enrolledCourses = await studentService.getEnrolledCourses(req.user);

        return res.json({ success: true, enrolledCourses });
    } catch (err) {
        console.error('getEnrolledCourses error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const viewStudentChallans = async (req, res) => {
    try {
        const results = await studentService.viewStudentChallans(req.user);

        return res.status(200).json({ success: true, data: results });
    } catch (err) {
        console.error('viewStudentChallans error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const viewStudentGrades = async (req, res) => {
    try {
        const gradesData = await studentService.viewStudentGrades(req.user);

        return res.status(200).json({
            success: true,
            data: gradesData,
            message: gradesData.length > 0 ? 'Grades retrieved successfully' : 'No enrolled courses found'
        });
    } catch (err) {
        console.error('viewStudentGrades error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const getStudentAssignments = async (req, res) => {
    try {
        const result = await studentService.getStudentAssignments(req.user);

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('getStudentAssignments error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const result = await studentService.submitAssignment(assignmentId, req.file, req.user);

        if (result.isResubmission) {
            return res.status(200).json({
                success: true,
                data: result.submission,
                message: 'Assignment resubmitted successfully'
            });
        }

        return res.status(201).json({
            success: true,
            data: result.submission,
            message: 'Assignment submitted successfully'
        });
    } catch (err) {
        console.error('submitAssignment error:', err);
        return res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
    }
};

module.exports = {
    getAllCourses,
    enrollInCourse,
    unregisterFromCourse,
    getEnrolledCourses,
    viewStudentChallans,
    viewStudentGrades,
    getStudentAssignments,
    submitAssignment,
    downloadAssignment
};
