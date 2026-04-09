const headService = require('../service/head.service');
const courseService = require('../service/services');
const { createCourseSchema } = require('../validations/validation');

exports.createInstructor = async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        const instructor = await headService.createInstructor(
            { email, password, name, phone, address },
            req.user
        );

        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: instructor
        });
    } catch (error) {
        console.error('Error creating instructor:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { email, password, name, phone, address, semester } = req.body;

        const student = await headService.createStudent(
            { email, password, name, phone, address, semester },
            req.user
        );

        res.status(201).json({
            success: true,
            message: 'Student created and added to department successfully',
            data: student
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { error, value } = createCourseSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const course = await courseService.createCourse({
            user: req.user,
            ...value
        });

        await course.populate([
            { path: 'department', select: 'name code building' },
            { path: 'instructors', select: 'name email employeeId' },
            { path: 'prerequisites', select: 'title code' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

exports.assignCourseToInstructorr = async (req, res) => {
    try {
        const { instructorId, courseId } = req.body;

        const result = await headService.assignCourseToInstructorr(
            { instructorId, courseId },
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Course assigned to instructor successfully",
            data: result
        });
    } catch (error) {
        console.error("Error assigning course:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
            error: error.message
        });
    }
};

exports.getDepartmentStats = async (req, res) => {
    try {
        const stats = await headService.getDepartmentStats(req.user);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching department statistics:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getuserr = async (req, res) => {
    try {
        const { role } = req.query;

        const users = await headService.getuserr({ role }, req.user);

        res.status(200).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)}s fetched successfully`,
            data: users
        });
    } catch (error) {
        console.error('Error while getting user:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getHeadDepartmentStats = async (req, res) => {
    try {
        const stats = await headService.getHeadDepartmentStats(req.user);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching department statistics:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getDepartmentCourses = async (req, res) => {
    try {
        const courses = await headService.getDepartmentCourses(req.user);

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error('Error fetching department courses:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.toggleCourseRegistration = async (req, res) => {
    try {
        const { courseId } = req.params;

        const result = await headService.toggleCourseRegistration(courseId, req.user);

        res.status(200).json({
            success: true,
            message: 'Course registration toggled',
            data: result
        });
    } catch (error) {
        console.error('Error toggling course registration:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.toggleDepartmentRegistration = async (req, res) => {
    try {
        const { open } = req.body;

        const result = await headService.toggleDepartmentRegistration({ open }, req.user);

        res.status(200).json({
            success: true,
            message: `Department courses registration set to ${result.newState}`
        });
    } catch (error) {
        console.error('Error toggling department registration:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.departmentupdate = async (req, res) => {
    try {
        const { id } = req.body;

        const updatedUser = await headService.departmentupdate({ id }, req.user);

        res.status(200).json({
            success: true,
            message: 'User department updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.createChallan = async (req, res) => {
    try {
        const { semester, description, dueDate, fineAfterDueDate } = req.body;

        const newChallan = await headService.createChallan(
            { semester, description, dueDate, fineAfterDueDate },
            req.user
        );

        res.status(201).json({
            success: true,
            message: 'Challan created successfully',
            data: newChallan
        });
    } catch (error) {
        console.error('Error creating challan:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.assignChallanToSemester = async (req, res) => {
    try {
        const { challanId, semester } = req.body;

        const result = await headService.assignChallanToSemester(
            { challanId, semester },
            req.user
        );

        res.status(200).json({
            success: true,
            message: `Challan assigned successfully to ${result.totalStudentsAssigned} students of semester ${result.semester}`,
            data: result
        });
    } catch (error) {
        console.error('Error assigning challan to semester:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getDepartmentChallans = async (req, res) => {
    try {
        const challans = await headService.getDepartmentChallans(req.user);

        res.status(200).json({
            success: true,
            data: challans
        });
    } catch (error) {
        console.error('Error fetching department challans:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getAllDepartmentStudents = async (req, res) => {
    try {
        const students = await headService.getAllDepartmentStudents(req.user);

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching department students:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.updateStudentChallanToPaid = async (req, res) => {
    try {
        const { challanId, studentId } = req.body;

        const result = await headService.updateStudentChallanToPaid(
            { challanId, studentId },
            req.user
        );

        res.status(200).json({
            success: true,
            message: 'Student challan status updated to paid successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating student challan status:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.sendMessageToInstructor = async (req, res) => {
    try {
        const { instructorId, subject, message } = req.body;

        const newMessage = await headService.sendMessageToInstructor(
            { instructorId, subject, message },
            req.user
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error sending message to instructor:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.sendMessageToAllInstructors = async (req, res) => {
    try {
        const { subject, message } = req.body;

        const result = await headService.sendMessageToAllInstructors(
            { subject, message },
            req.user
        );

        res.status(201).json({
            success: true,
            message: `Message sent successfully to ${result.count} instructor(s)`,
            data: result
        });
    } catch (error) {
        console.error('Error sending messages to all instructors:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'One or more recipients are invalid or no longer instructors.'
            });
        }
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getHeadSentMessages = async (req, res) => {
    try {
        const { page, limit } = req.query;

        const result = await headService.getHeadSentMessages(
            { page, limit },
            req.user
        );

        res.status(200).json({
            success: true,
            data: result.messages,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        await headService.deleteMessage(messageId, req.user);

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
