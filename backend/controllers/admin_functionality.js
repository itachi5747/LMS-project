const adminService = require('../service/admin.service');

exports.createHeadInstructor = async (req, res) => {
    try {
        const { email, password, name, phone, address } = req.body;

        const instructor = await adminService.createHeadInstructor(
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

exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description, headId, building, contactEmail, contactPhone } = req.body;

        const department = await adminService.createDepartment(
            { name, code, description, headId, building, contactEmail, contactPhone },
            req.user
        );

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.addInstructorToDepartment = async (req, res) => {
    try {
        const { instructorId, departmentId } = req.body;

        const result = await adminService.addInstructorToDepartment(
            { instructorId, departmentId },
            req.user
        );

        res.status(200).json({
            success: true,
            message: 'Instructor successfully added to department',
            data: result
        });
    } catch (error) {
        console.error('Error adding instructor to department:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getuser = async (req, res) => {
    try {
        const { role } = req.query;

        const users = await adminService.getUsersByRole(role, req.user);

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

exports.getUserByNameAndId = async (req, res) => {
    try {
        const { id, name } = req.query;

        const users = await adminService.getUserByNameAndId({ id, name }, req.user);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await adminService.getUserProfile(id);

        res.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            data: profile,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message,
        });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await adminService.getAllDepartments();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching departments", error: error.message });
    }
};

exports.getDepartmentStats = async (req, res) => {
    try {
        const { id } = req.params;

        const stats = await adminService.getDepartmentStats(id);

        res.status(200).json(stats);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || "Error fetching department statistics",
            error: error.message
        });
    }
};

exports.getAllDepartmentsWithStats = async (req, res) => {
    try {
        const departmentStats = await adminService.getAllDepartmentsWithStats(req.user);

        res.status(200).json({
            success: true,
            message: "Departments with stats retrieved successfully",
            data: departmentStats
        });
    } catch (error) {
        console.error('Error fetching departments with stats:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.getUniversityStats = async (req, res) => {
    try {
        const stats = await adminService.getUniversityStats(req.user);

        res.status(200).json({
            success: true,
            message: "University stats retrieved successfully",
            data: stats
        });
    } catch (error) {
        console.error('Error fetching university stats:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const updatedStudent = await adminService.updateStudent(studentId, req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.updateInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const updatedInstructor = await adminService.updateInstructor(instructorId, req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Instructor updated successfully',
            data: updatedInstructor
        });
    } catch (error) {
        console.error('Error updating instructor:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const updatedCourse = await adminService.updateCourse(courseId, req.body, req.user);

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Internal server error',
            error: error.message
        });
    }
};

exports.assignCourseToInstructor = async (req, res) => {
    try {
        const { instructorId, courseId } = req.body;

        const result = await adminService.assignCourseToInstructor(
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

exports.unassignCourseFromInstructor = async (req, res) => {
    try {
        const { instructorId, courseId } = req.body;

        const result = await adminService.unassignCourseFromInstructor(
            { instructorId, courseId },
            req.user
        );

        res.status(200).json({
            success: true,
            message: "Instructor unassigned from course successfully",
            data: result
        });
    } catch (error) {
        console.error("Error unassigning course:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
            error: error.message
        });
    }
};
