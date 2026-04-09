const bcryptjs = require("bcryptjs");
const User = require('../models/user.model');
const Department = require('../models/department.model');
const Course = require('../models/course.model');
const { generateInstructorId } = require("../utilis/idgenerator");

/**
 * Create a head instructor
 */
exports.createHeadInstructor = async ({ email, password, name, phone, address }, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can create head.');
        error.status = 403;
        throw error;
    }

    // Validate required fields
    if (!email || !password || !name || !phone || !address) {
        const error = new Error('All fields are required: email, password, name, phone, address');
        error.status = 400;
        throw error;
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
        const error = new Error('Email already exists');
        error.status = 409;
        throw error;
    }

    // Generate new instructor ID
    const employeeId = await generateInstructorId();

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create instructor
    const instructor = new User({
        email,
        password: hashedPassword,
        name,
        role: 'headDept',
        employeeId,
        phone,
        address,
        createdBy: adminUser._id
    });

    await instructor.save();

    // Remove password from response
    const instructorResponse = instructor.toObject();
    delete instructorResponse.password;

    return instructorResponse;
};

/**
 * Create a department
 */
exports.createDepartment = async ({ name, code, description, headId, building, contactEmail, contactPhone }, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can create departments.');
        error.status = 403;
        throw error;
    }

    // Validate required fields
    if (!name || !code || !description || !headId || !building) {
        const error = new Error('Required fields: name, code, description, headId, building');
        error.status = 400;
        throw error;
    }

    // Check if department with same name or code already exists
    const existingDepartment = await Department.findOne({
        $or: [
            { name: name },
            { code: code.toUpperCase() }
        ]
    });

    if (existingDepartment) {
        const error = new Error('Department with this name or code already exists');
        error.status = 409;
        throw error;
    }

    // Check if head exists and is an instructor
    const head = await User.findById(headId);
    if (!head) {
        const error = new Error('Head instructor not found');
        error.status = 404;
        throw error;
    }

    if (head.role !== 'headDept' && head.role !== 'admin') {
        const error = new Error('Department head must be an instructor or admin');
        error.status = 400;
        throw error;
    }

    // Create department
    const department = new Department({
        name,
        code: code.toUpperCase(),
        description,
        head: headId,
        building,
        contactEmail,
        contactPhone,
        instructors: [headId]
    });

    await department.save();
    head.department = department._id;
    head.headDepartment = name;
    await head.save();

    await department.populate('head', 'name email employeeId role');

    return department;
};

/**
 * Add instructor to department
 */
exports.addInstructorToDepartment = async ({ instructorId, departmentId }, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can assign instructors to departments.');
        error.status = 403;
        throw error;
    }

    // Validate required fields
    if (!instructorId || !departmentId) {
        const error = new Error('Both instructorId and departmentId are required');
        error.status = 400;
        throw error;
    }

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor) {
        const error = new Error('Instructor not found');
        error.status = 404;
        throw error;
    }

    if (instructor.role !== 'instructor') {
        const error = new Error('Selected user must have instructor role');
        error.status = 400;
        throw error;
    }

    if (!instructor.isActive) {
        const error = new Error('Cannot assign inactive instructor to department');
        error.status = 400;
        throw error;
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
        const error = new Error('Department not found');
        error.status = 404;
        throw error;
    }

    if (!department.isActive) {
        const error = new Error('Cannot assign instructor to inactive department');
        error.status = 400;
        throw error;
    }

    // Check if instructor is already in this department
    if (instructor.department && instructor.department.toString() === departmentId) {
        const error = new Error('Instructor is already assigned to this department');
        error.status = 400;
        throw error;
    }

    // Check if instructor is already in the department's instructors array
    if (department.instructors.includes(instructorId)) {
        const error = new Error('Instructor is already in this department');
        error.status = 400;
        throw error;
    }

    // Remove instructor from previous department if exists
    if (instructor.department) {
        const previousDepartment = await Department.findById(instructor.department);
        if (previousDepartment) {
            previousDepartment.instructors = previousDepartment.instructors.filter(
                id => id.toString() !== instructorId
            );
            await previousDepartment.save();
        }
    }

    // Add instructor to new department
    instructor.department = departmentId;
    await instructor.save();

    // Add instructor to department's instructors array
    department.instructors.push(instructorId);
    await department.save();

    await instructor.populate('department', 'name code building');
    await department.populate('instructors', 'name email employeeId');

    return {
        instructor: {
            id: instructor._id,
            name: instructor.name,
            email: instructor.email,
            employeeId: instructor.employeeId,
            department: instructor.department
        },
        department: {
            id: department._id,
            name: department.name,
            code: department.code,
            instructorCount: department.instructors.length,
            instructors: department.instructors
        }
    };
};

/**
 * Get users by role
 */
exports.getUsersByRole = async (role, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can view users.');
        error.status = 403;
        throw error;
    }

    // Validate role parameter
    if (!role || !['student', 'instructor', 'headDept', 'all'].includes(role)) {
        const error = new Error('Invalid or missing role. Must be student, instructor, or admin.');
        error.status = 400;
        throw error;
    }

    let users;
    if (role === "all") {
        users = await User.find({ role: { $ne: 'admin' } })
            .select('name email studentId employeeId department semester role')
            .populate('department', 'name code');
    } else {
        users = await User.find({ role })
            .select(
                role === 'student'
                    ? 'name studentId department semester email role'
                    : role === 'instructor'
                        ? 'name employeeId department role'
                        : 'name employeeId department role'
            )
            .populate('department', 'name code');
    }

    return users;
};

/**
 * Search users by name or ID
 */
exports.getUserByNameAndId = async ({ id, name }, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can search users.');
        error.status = 403;
        throw error;
    }

    if (!id && !name) {
        const error = new Error('Please provide either an ID (studentId/employeeId) or a name');
        error.status = 400;
        throw error;
    }

    let filter = {};

    // Search by ID (studentId or employeeId)
    if (id) {
        filter.$or = [
            { studentId: id },
            { employeeId: id }
        ];
    }

    // Search by name (case-insensitive partial match)
    if (name) {
        filter.name = { $regex: name, $options: 'i' };
    }

    const users = await User.find(filter)
        .select('-password -resetPasswordToken -verificationToken')
        .populate('department', 'name code building')
        .lean();

    if (!users || users.length === 0) {
        const error = new Error('No users found with provided criteria');
        error.status = 404;
        throw error;
    }

    return users;
};

/**
 * Get user profile by ID
 */
exports.getUserProfile = async (userId) => {
    const user = await User.findById(userId)
        .select('-password -verificationToken -resetPasswordToken')
        .populate('department', 'name code building head')
        .populate({ path: 'enrolledCourses.course', select: '_id title code credits' })
        .populate('teachingCourses', 'title code');

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Base profile
    const profile = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
    };

    // Add role-specific details
    if (user.role === 'instructor') {
        profile.teachingCourses = user.teachingCourses || [];
        profile.employeeId = user.employeeId;
    } else if (user.role === 'student') {
        profile.enrolledCourses = user.enrolledCourses || [];
        profile.semester = user.semester;
        profile.studentId = user.studentId;
    }

    return profile;
};

/**
 * Get all departments
 */
exports.getAllDepartments = async () => {
    const departments = await Department.find({}, "name code building");
    return departments;
};

/**
 * Get department statistics
 */
exports.getDepartmentStats = async (departmentId) => {
    const department = await Department.findById(departmentId)
        .populate("students")
        .populate("instructors")
        .populate("courses");

    if (!department) {
        const error = new Error('Department not found');
        error.status = 404;
        throw error;
    }

    return {
        name: department.name,
        studentCount: department.studentCount,
        instructorCount: department.instructorCount,
        courseCount: department.courseCount,
    };
};

/**
 * Get all departments with statistics
 */
exports.getAllDepartmentsWithStats = async (adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can view departments stats.');
        error.status = 403;
        throw error;
    }

    const departments = await Department.find()
        .populate('head', 'name email role')
        .lean();

    // Attach stats for each department
    const departmentStats = await Promise.all(
        departments.map(async (dept) => {
            const totalStudents = await User.countDocuments({ department: dept._id, role: 'student' });
            const totalInstructors = await User.countDocuments({ department: dept._id, role: 'instructor' });
            const totalCourses = await Course.countDocuments({ department: dept._id });

            return {
                id: dept._id,
                name: dept.name,
                stats: {
                    totalStudents,
                    totalInstructors,
                    totalCourses
                }
            };
        })
    );

    return departmentStats;
};

/**
 * Get university statistics
 */
exports.getUniversityStats = async (adminUser) => {
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can view university stats.');
        error.status = 403;
        throw error;
    }

    const totalDepartments = await Department.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalHeadDept = await User.countDocuments({ role: 'headDept' });
    const totaladmin = await User.countDocuments({ role: 'admin' });

    // Breakdown: students per department
    const departmentBreakdown = await Department.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'department',
                as: 'users'
            }
        },
        {
            $project: {
                name: 1,
                studentCount: {
                    $size: {
                        $filter: {
                            input: "$users",
                            as: "user",
                            cond: { $eq: ["$$user.role", "student"] }
                        }
                    }
                }
            }
        }
    ]);

    return {
        totaladmin,
        totalDepartments,
        totalStudents,
        totalInstructors,
        totalHeadDept,
        departmentBreakdown
    };
};

/**
 * Update student
 */
exports.updateStudent = async (studentId, updateData, adminUser) => {
    // Check if user is admin or headDept
    if (adminUser.role !== 'admin' && adminUser.role !== 'headDept') {
        const error = new Error('Access denied. Only admins can update students.');
        error.status = 403;
        throw error;
    }

    if (!studentId) {
        const error = new Error('Student ID parameter is required');
        error.status = 400;
        throw error;
    }

    // Find the student
    const student = await User.findById(studentId);
    if (!student) {
        const error = new Error('Student not found');
        error.status = 404;
        throw error;
    }

    if (student.role !== 'student') {
        const error = new Error('User is not a student');
        error.status = 400;
        throw error;
    }

    const {
        email,
        password,
        name,
        studentId: newStudentId,
        phone,
        address,
        semester,
        departmentId,
        isActive
    } = updateData;

    // Check email uniqueness if email is being updated
    if (email && email !== student.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error('Email already exists');
            error.status = 409;
            throw error;
        }
    }

    // Check studentId uniqueness if studentId is being updated
    if (newStudentId && newStudentId !== student.studentId) {
        const existingStudent = await User.findOne({ studentId: newStudentId });
        if (existingStudent) {
            const error = new Error('Student ID already exists');
            error.status = 409;
            throw error;
        }
    }

    // Validate semester if provided
    if (semester !== undefined && (semester < 1 || semester > 8)) {
        const error = new Error('Semester must be between 1 and 8');
        error.status = 400;
        throw error;
    }

    // If department is being changed, validate new department
    let oldDepartment = null;
    let newDepartment = null;

    if (departmentId && departmentId !== student.department?.toString()) {
        newDepartment = await Department.findById(departmentId);
        if (!newDepartment) {
            const error = new Error('New department not found');
            error.status = 404;
            throw error;
        }

        if (!newDepartment.isActive) {
            const error = new Error('Cannot assign student to inactive department');
            error.status = 400;
            throw error;
        }

        if (student.department) {
            oldDepartment = await Department.findById(student.department);
        }
    }

    // Prepare update object
    const updateFields = {};
    if (email) updateFields.email = email.toLowerCase();
    if (name) updateFields.name = name;
    if (newStudentId) updateFields.studentId = newStudentId;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (semester !== undefined) updateFields.semester = semester;
    if (departmentId) updateFields.department = departmentId;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Hash password if provided
    if (password) {
        updateFields.password = await bcryptjs.hash(password, 10);
    }

    // Update student
    const updatedStudent = await User.findByIdAndUpdate(
        studentId,
        updateFields,
        { new: true, runValidators: true }
    ).populate('department', 'name code building');

    // Handle department change
    if (oldDepartment && newDepartment && oldDepartment._id.toString() !== newDepartment._id.toString()) {
        oldDepartment.students = oldDepartment.students.filter(
            id => id.toString() !== studentId
        );
        await oldDepartment.save();

        if (!newDepartment.students.includes(studentId)) {
            newDepartment.students.push(studentId);
            await newDepartment.save();
        }
    }

    // Remove sensitive data from response
    const studentResponse = updatedStudent.toObject();
    delete studentResponse.password;

    return studentResponse;
};

/**
 * Update instructor
 */
exports.updateInstructor = async (instructorId, updateData, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can update instructors.');
        error.status = 403;
        throw error;
    }

    if (!instructorId) {
        const error = new Error('Instructor ID parameter is required');
        error.status = 400;
        throw error;
    }

    // Find the instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
        const error = new Error('Instructor not found');
        error.status = 404;
        throw error;
    }

    if (instructor.role !== 'headDept' && instructor.role !== 'instructor') {
        const error = new Error('User is not an instructor');
        error.status = 400;
        throw error;
    }

    const {
        email,
        password,
        name,
        employeeId: newEmployeeId,
        phone,
        address,
        departmentId,
        isActive
    } = updateData;

    // Check email uniqueness if email is being updated
    if (email && email !== instructor.email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error('Email already exists');
            error.status = 409;
            throw error;
        }
    }

    // Check employeeId uniqueness if employeeId is being updated
    if (newEmployeeId && newEmployeeId !== instructor.employeeId) {
        const existingInstructor = await User.findOne({ employeeId: newEmployeeId });
        if (existingInstructor) {
            const error = new Error('Employee ID already exists');
            error.status = 409;
            throw error;
        }
    }

    // If department is being changed, validate new department
    let oldDepartment = null;
    let newDepartment = null;

    if (departmentId && departmentId !== instructor.department?.toString()) {
        newDepartment = await Department.findById(departmentId);
        if (!newDepartment) {
            const error = new Error('New department not found');
            error.status = 404;
            throw error;
        }

        if (!newDepartment.isActive) {
            const error = new Error('Cannot assign instructor to inactive department');
            error.status = 400;
            throw error;
        }

        if (instructor.department) {
            oldDepartment = await Department.findById(instructor.department);
        }
    }

    // Check if instructor is head of current department
    if (oldDepartment && oldDepartment.head.toString() === instructorId) {
        const error = new Error('Cannot change department of instructor who is head of current department. Please assign a new head first.');
        error.status = 400;
        throw error;
    }

    // Prepare update object
    const updateFields = {};
    if (email) updateFields.email = email.toLowerCase();
    if (name) updateFields.name = name;
    if (newEmployeeId) updateFields.employeeId = newEmployeeId;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (departmentId) updateFields.department = departmentId;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Hash password if provided
    if (password) {
        updateFields.password = await bcryptjs.hash(password, 10);
    }

    // Update instructor
    const updatedInstructor = await User.findByIdAndUpdate(
        instructorId,
        updateFields,
        { new: true, runValidators: true }
    ).populate('department', 'name code building');

    // Handle department change
    if (oldDepartment && newDepartment && oldDepartment._id.toString() !== newDepartment._id.toString()) {
        oldDepartment.instructors = oldDepartment.instructors.filter(
            id => id.toString() !== instructorId
        );
        await oldDepartment.save();

        if (!newDepartment.instructors.includes(instructorId)) {
            newDepartment.instructors.push(instructorId);
            await newDepartment.save();
        }
    }

    // Remove sensitive data from response
    const instructorResponse = updatedInstructor.toObject();
    delete instructorResponse.password;

    return instructorResponse;
};

/**
 * Update course
 */
exports.updateCourse = async (courseId, updateData, adminUser) => {
    // Check if user is admin
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can update courses.');
        error.status = 403;
        throw error;
    }

    if (!courseId) {
        const error = new Error('Course ID parameter is required');
        error.status = 400;
        throw error;
    }

    const {
        title,
        code,
        description,
        departmentId,
        instructorId,
        credits,
        semester,
        year,
        capacity,
        prerequisites
    } = updateData;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Check course code uniqueness if code is being updated
    if (code && code.toUpperCase() !== course.code) {
        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            const error = new Error('Course code already exists');
            error.status = 409;
            throw error;
        }
    }

    // Validate credits if provided
    if (credits !== undefined && (credits < 1 || credits > 3)) {
        const error = new Error('Credits must be between 1 and 3');
        error.status = 400;
        throw error;
    }

    // Validate capacity if provided
    if (capacity !== undefined && (capacity < 1 || capacity > 50)) {
        const error = new Error('Capacity must be between 1 and 50');
        error.status = 400;
        throw error;
    }

    // Check if new capacity is less than current enrolled students
    if (capacity !== undefined && capacity < course.enrolledStudents.filter(e => e.status === 'enrolled').length) {
        const error = new Error('New capacity cannot be less than currently enrolled students');
        error.status = 400;
        throw error;
    }

    // Validate year if provided
    if (year !== undefined && (year < 2020 || year > 2030)) {
        const error = new Error('Year must be between 2020 and 2030');
        error.status = 400;
        throw error;
    }

    // Validate department if being changed
    let oldDepartment = null;
    let newDepartment = null;

    if (departmentId && departmentId !== course.department.toString()) {
        newDepartment = await Department.findById(departmentId);
        if (!newDepartment) {
            const error = new Error('New department not found');
            error.status = 404;
            throw error;
        }

        if (!newDepartment.isActive) {
            const error = new Error('Cannot assign course to inactive department');
            error.status = 400;
            throw error;
        }

        oldDepartment = await Department.findById(course.department);
    }

    // Validate instructor if being changed
    let oldInstructor = null;
    let newInstructor = null;

    if (instructorId && instructorId !== course.instructor?.toString()) {
        newInstructor = await User.findById(instructorId);
        if (!newInstructor) {
            const error = new Error('New instructor not found');
            error.status = 404;
            throw error;
        }

        if (newInstructor.role !== 'instructor') {
            const error = new Error('Selected user must have instructor role');
            error.status = 400;
            throw error;
        }

        if (!newInstructor.isActive) {
            const error = new Error('Cannot assign course to inactive instructor');
            error.status = 400;
            throw error;
        }

        oldInstructor = await User.findById(course.instructor);
    }

    // Validate prerequisites if provided
    if (prerequisites && prerequisites.length > 0) {
        const prereqCourses = await Course.find({ _id: { $in: prerequisites } });
        if (prereqCourses.length !== prerequisites.length) {
            const error = new Error('One or more prerequisite courses not found');
            error.status = 400;
            throw error;
        }

        // Check for circular dependencies (course cannot be prerequisite of itself)
        if (prerequisites.includes(courseId)) {
            const error = new Error('Course cannot be a prerequisite of itself');
            error.status = 400;
            throw error;
        }
    }

    // Prepare update object
    const updateFields = {};
    if (title) updateFields.title = title;
    if (code) updateFields.code = code.toUpperCase();
    if (description) updateFields.description = description;
    if (departmentId) updateFields.department = departmentId;
    if (instructorId) updateFields.instructor = instructorId;
    if (credits !== undefined) updateFields.credits = credits;
    if (semester) updateFields.semester = semester;
    if (year !== undefined) updateFields.year = year;
    if (capacity !== undefined) updateFields.capacity = capacity;
    if (prerequisites !== undefined) updateFields.prerequisites = prerequisites || [];

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        updateFields,
        { new: true, runValidators: true }
    ).populate([
        { path: 'department', select: 'name code building' },
        { path: 'instructor', select: 'name email employeeId' },
        { path: 'prerequisites', select: 'title code' }
    ]);

    // Handle department change
    if (oldDepartment && newDepartment && oldDepartment._id.toString() !== newDepartment._id.toString()) {
        oldDepartment.courses = oldDepartment.courses.filter(
            id => id.toString() !== courseId
        );
        await oldDepartment.save();

        if (!newDepartment.courses.includes(courseId)) {
            newDepartment.courses.push(courseId);
            await newDepartment.save();
        }
    }

    // Handle instructor change
    if (oldInstructor && newInstructor && oldInstructor._id.toString() !== newInstructor._id.toString()) {
        oldInstructor.teachingCourses = oldInstructor.teachingCourses.filter(
            id => id.toString() !== courseId
        );
        await oldInstructor.save();

        if (!newInstructor.teachingCourses.includes(courseId)) {
            newInstructor.teachingCourses.push(courseId);
            await newInstructor.save();
        }
    }

    return updatedCourse;
};

/**
 * Assign course to instructor
 */
exports.assignCourseToInstructor = async ({ instructorId, courseId }, adminUser) => {
    // Only admins can assign
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can assign courses.');
        error.status = 403;
        throw error;
    }

    if (!instructorId || !courseId) {
        const error = new Error('Instructor ID and Course ID are required');
        error.status = 400;
        throw error;
    }

    // Find instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
        const error = new Error('Instructor not found');
        error.status = 404;
        throw error;
    }
    if (instructor.role !== 'instructor') {
        const error = new Error('User is not an instructor');
        error.status = 400;
        throw error;
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Assign course to instructor
    if (!instructor.teachingCourses.includes(courseId)) {
        instructor.teachingCourses.push(courseId);
        await instructor.save();
    }

    // Assign instructor to course
    if (!course.instructors.includes(instructorId)) {
        course.instructors.push(instructorId);
        await course.save();
    }

    return {
        instructor: {
            id: instructor._id,
            name: instructor.name,
            email: instructor.email,
            teachingCourses: instructor.teachingCourses,
        },
        course: {
            id: course._id,
            name: course.name,
            code: course.code,
            instructors: course.instructors
        }
    };
};

/**
 * Unassign course from instructor
 */
exports.unassignCourseFromInstructor = async ({ instructorId, courseId }, adminUser) => {
    // Only admin can unassign
    if (adminUser.role !== 'admin') {
        const error = new Error('Access denied. Only admins can unassign courses.');
        error.status = 403;
        throw error;
    }

    if (!instructorId || !courseId) {
        const error = new Error('Instructor ID and Course ID are required');
        error.status = 400;
        throw error;
    }

    // Find instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
        const error = new Error('Instructor not found');
        error.status = 404;
        throw error;
    }
    if (instructor.role !== 'instructor') {
        const error = new Error('User is not an instructor');
        error.status = 400;
        throw error;
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Remove course from instructor
    instructor.teachingCourses = instructor.teachingCourses.filter(
        (cId) => cId.toString() !== courseId
    );
    await instructor.save();

    // Remove instructor from course
    course.instructors = course.instructors.filter(
        (iId) => iId.toString() !== instructorId
    );
    await course.save();

    return {
        instructor: {
            id: instructor._id,
            name: instructor.name,
            email: instructor.email,
            teachingCourses: instructor.teachingCourses,
        },
        course: {
            id: course._id,
            name: course.name,
            code: course.code,
            instructors: course.instructors
        }
    };
};
