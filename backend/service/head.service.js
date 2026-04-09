const bcryptjs = require("bcryptjs");
const User = require('../models/user.model');
const Department = require('../models/department.model');
const Course = require('../models/course.model');
const Challan = require('../models/challan.model');
const Message = require('../models/message.model');
const { generateInstructorId, generateStudentId } = require("../utilis/idgenerator");

/**
 * Create instructor (by head of department)
 */
exports.createInstructor = async ({ email, password, name, phone, address }, headUser) => {
    // Check if user is headDept
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only Head department can create Instructor.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

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
        role: 'instructor',
        employeeId,
        phone,
        address,
        createdBy: headUser._id,
        department: departmentId
    });

    await instructor.save();
    await Department.findByIdAndUpdate(departmentId, { $push: { instructors: instructor._id } });

    // Remove password from response
    const instructorResponse = instructor.toObject();
    delete instructorResponse.password;

    return instructorResponse;
};

/**
 * Create student (by head of department)
 */
exports.createStudent = async ({ email, password, name, phone, address, semester }, headUser) => {
    // Check if user is department head
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only department head can create students.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Validate required fields
    if (!email || !password || !name || !phone || !address || !semester) {
        const error = new Error('All fields are required: email, password, name, phone, address, semester');
        error.status = 400;
        throw error;
    }

    // Validate semester range
    if (semester < 1 || semester > 8) {
        const error = new Error('Semester must be between 1 and 8');
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

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
        const error = new Error('Department not found. Please create the department first.');
        error.status = 404;
        throw error;
    }

    if (!department.isActive) {
        const error = new Error('Cannot add student to inactive department');
        error.status = 400;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    const student_id = await generateStudentId(department.code);

    // Create student
    const student = new User({
        email,
        password: hashedPassword,
        name,
        role: 'student',
        studentId: student_id,
        phone,
        address,
        semester,
        department: departmentId,
        createdBy: headUser._id
    });

    await student.save();

    // Add student to department's students array
    department.students.push(student._id);
    await department.save();

    // Automatically add student to all existing semester challans
    try {
        const semesterChallans = await Challan.find({
            department: departmentId,
            semester: semester,
            status: 'active'
        });

        for (const challan of semesterChallans) {
            const alreadyAssigned = challan.assignedStudents.some(
                (assigned) => assigned.student?.toString() === student._id.toString()
            );

            if (!alreadyAssigned) {
                challan.assignedStudents.push({
                    student: student._id,
                    assignedDate: new Date(),
                    status: 'pending'
                });
                await challan.save();
            }
        }
    } catch (challanError) {
        console.error('Error assigning student to existing challans:', challanError);
    }

    // Populate department information in response
    await student.populate('department', 'name code building');

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    return studentResponse;
};

/**
 * Assign course to instructor (by head)
 */
exports.assignCourseToInstructorr = async ({ instructorId, courseId }, headUser) => {
    // Only headDept can assign
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head dept can assign courses.');
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
 * Get department statistics
 */
exports.getDepartmentStats = async (headUser) => {
    const departmentId = headUser.department;

    // Get department with populated arrays
    const department = await Department.findById(departmentId)
        .populate('students', 'name email studentId semester')
        .populate('instructors', 'name email employeeId')
        .populate('courses', 'title code isActive');

    if (!department) {
        const error = new Error('Department not found');
        error.status = 404;
        throw error;
    }

    // Calculate counts
    const totalStudents = department.students.length;
    const totalInstructors = department.instructors.length;
    const totalCourses = department.courses.length;
    const activeCourses = department.courses.filter(course => course.isActive !== false).length;

    return {
        totalStudents,
        totalInstructors,
        totalCourses,
        activeCourses,
        enrolledStudents: totalStudents,
        availableInstructors: totalInstructors,
        departmentName: department.name,
        departmentCode: department.code
    };
};

/**
 * Get users by role (for head)
 */
exports.getuserr = async ({ role }, headUser) => {
    // Only headDept can view
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only headdept can view users.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Validate role parameter
    if (!role || !['student', 'instructor', 'headDept', 'all'].includes(role)) {
        const error = new Error('Invalid or missing role. Must be student, instructor, or admin.');
        error.status = 400;
        throw error;
    }

    let users;
    if (role === "all") {
        users = await User.find({ role: { $ne: 'admin' }, department: departmentId })
            .select('name email studentId employeeId department semester role')
            .populate('department', 'name code');
    } else {
        users = await User.find({ role, department: departmentId })
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
 * Get head department statistics
 */
exports.getHeadDepartmentStats = async (headUser) => {
    const departmentId = headUser.department;

    // Get department with populated arrays
    const department = await Department.findById(departmentId)
        .populate('students', 'name email studentId semester')
        .populate('instructors', 'name email employeeId')
        .populate('courses', 'title code isActive');

    if (!department) {
        const error = new Error('Department not found');
        error.status = 404;
        throw error;
    }

    // Calculate counts
    const totalStudents = department.students.length;
    const totalInstructors = department.instructors.length;
    const totalCourses = department.courses.length;
    const activeCourses = department.courses.filter(course => course.isActive !== false).length;

    return {
        totalStudents,
        totalInstructors,
        totalCourses,
        activeCourses,
        enrolledStudents: totalStudents,
        availableInstructors: totalInstructors,
        departmentName: department.name,
        departmentCode: department.code
    };
};

/**
 * Get department courses
 */
exports.getDepartmentCourses = async (headUser) => {
    const departmentId = headUser.department;

    // Get courses for the department
    const courses = await Course.find({ department: departmentId })
        .select('title code description credits semester isRegistrationOpen capacity')
        .sort({ title: 1 });

    return courses;
};

/**
 * Toggle course registration
 */
exports.toggleCourseRegistration = async (courseId, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only headDept can perform this action.');
        error.status = 403;
        throw error;
    }

    if (!courseId) {
        const error = new Error('Course ID is required');
        error.status = 400;
        throw error;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Ensure course belongs to the head's department
    if (course.department.toString() !== headUser.department.toString()) {
        const error = new Error('You can only modify courses in your department');
        error.status = 403;
        throw error;
    }

    course.isRegistrationOpen = !course.isRegistrationOpen;
    await course.save();

    return { id: course._id, isRegistrationOpen: course.isRegistrationOpen };
};

/**
 * Toggle department registration
 */
exports.toggleDepartmentRegistration = async ({ open }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only headDept can perform this action.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    if (open === undefined) {
        // If no explicit value provided, infer by flipping current aggregate state.
        const anyClosed = await Course.exists({ department: departmentId, isRegistrationOpen: false });
        const newState = anyClosed ? true : false;
        await Course.updateMany({ department: departmentId }, { $set: { isRegistrationOpen: newState } });
        return { newState };
    }

    if (typeof open !== 'boolean') {
        const error = new Error('Invalid value for open. Must be boolean.');
        error.status = 400;
        throw error;
    }

    await Course.updateMany({ department: departmentId }, { $set: { isRegistrationOpen: open } });
    return { newState: open };
};

/**
 * Update user department
 */
exports.departmentupdate = async ({ id }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only headDept can update users.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { department: departmentId },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    return updatedUser;
};

/**
 * Create challan
 */
exports.createChallan = async ({ semester, description, dueDate, fineAfterDueDate }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only Head of Department can create challan.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Validate required fields
    if (!semester || !description || !dueDate || fineAfterDueDate === undefined) {
        const error = new Error('All fields are required: semester, description, dueDate, fineAfterDueDate');
        error.status = 400;
        throw error;
    }

    // Validate semester range
    if (semester < 1 || semester > 8) {
        const error = new Error('Semester must be between 1 and 8');
        error.status = 400;
        throw error;
    }

    // Validate due date is in the future
    const dueDateTime = new Date(dueDate);
    if (dueDateTime <= new Date()) {
        const error = new Error('Due date must be in the future');
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

    // Calculate challan amount based on semester
    const amount = Challan.calculateAmount(semester);

    // Generate unique challan number
    const challanNumber = `CHALLAN-${department.code}-SEM${semester}-${Date.now()}`;

    // Create new challan
    const newChallan = new Challan({
        challanNumber,
        department: departmentId,
        semester,
        amount,
        description,
        dueDate: dueDateTime,
        fineAfterDueDate,
        createdBy: headUser._id
    });

    await newChallan.save();

    return {
        id: newChallan._id,
        challanNumber: newChallan.challanNumber,
        semester: newChallan.semester,
        amount: newChallan.amount,
        description: newChallan.description,
        dueDate: newChallan.dueDate,
        fineAfterDueDate: newChallan.fineAfterDueDate,
        status: newChallan.status
    };
};

/**
 * Assign challan to semester
 */
exports.assignChallanToSemester = async ({ challanId, semester }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only Head of Department can assign challan.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Validate required fields
    if (!challanId || !semester) {
        const error = new Error('Challan ID and semester are required');
        error.status = 400;
        throw error;
    }

    // Validate semester range
    if (semester < 1 || semester > 8) {
        const error = new Error('Semester must be between 1 and 8');
        error.status = 400;
        throw error;
    }

    // Find the challan
    const challan = await Challan.findById(challanId);
    if (!challan) {
        const error = new Error('Challan not found');
        error.status = 404;
        throw error;
    }

    // Verify challan belongs to the department
    if (challan.department.toString() !== departmentId.toString()) {
        const error = new Error('You can only assign challan to your department');
        error.status = 403;
        throw error;
    }

    // Check if challan is already assigned
    if (challan.isAssigned) {
        const error = new Error('This challan has already been assigned to a semester');
        error.status = 400;
        throw error;
    }

    // Find all students of the specified semester in the department
    const students = await User.find({
        role: 'student',
        semester: semester,
        department: departmentId
    }).select('_id name email');

    if (students.length === 0) {
        const error = new Error(`No students found for semester ${semester} in this department`);
        error.status = 404;
        throw error;
    }

    // Add all students to the challan's assignedStudents array
    const assignedStudentsList = students.map(student => ({
        student: student._id,
        assignedDate: new Date(),
        status: 'pending',
        paidDate: null,
        amountPaid: 0
    }));

    challan.assignedStudents = assignedStudentsList;
    challan.isAssigned = true;
    challan.assignedDate = new Date();

    await challan.save();

    return {
        challanId: challan._id,
        challanNumber: challan.challanNumber,
        semester: challan.semester,
        amount: challan.amount,
        totalStudentsAssigned: students.length,
        students: students.map(s => ({
            id: s._id,
            name: s.name,
            email: s.email
        })),
        assignedDate: challan.assignedDate
    };
};

/**
 * Get department challans
 */
exports.getDepartmentChallans = async (headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only Head of Department can view challans.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Fetch challans for this department, newest first
    const challans = await Challan.find({ department: departmentId })
        .sort({ createdAt: -1 })
        .lean();

    return challans;
};

/**
 * Get all department students with challans
 */
exports.getAllDepartmentStudents = async (headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head department can access this.');
        error.status = 403;
        throw error;
    }

    const departmentId = headUser.department;

    // Fetch all students in the department with semester info
    const students = await User.find({
        department: departmentId,
        role: 'student'
    })
        .select('_id name email studentId semester')
        .lean();

    // Auto-enroll students in missing semester challans
    try {
        for (const student of students) {
            const semesterChallans = await Challan.find({
                department: departmentId,
                semester: student.semester,
                status: 'active'
            });

            for (const challan of semesterChallans) {
                const isAssigned = challan.assignedStudents.some(
                    (assigned) => assigned.student?.toString() === student._id.toString()
                );

                if (!isAssigned) {
                    challan.assignedStudents.push({
                        student: student._id,
                        assignedDate: new Date(),
                        status: 'pending'
                    });
                    await challan.save();
                }
            }
        }
    } catch (autoEnrollError) {
        console.error('Error auto-enrolling students in challans:', autoEnrollError);
    }

    // For each student, fetch their assigned challans
    const studentsWithChallans = await Promise.all(
        students.map(async (student) => {
            const challans = await Challan.find({
                'assignedStudents.student': student._id,
                department: departmentId
            })
                .select('_id challanNumber semester amount dueDate fineAfterDueDate assignedStudents');

            const assignedChallans = challans.map(challan => {
                const assignment = challan.assignedStudents?.find(
                    s => s.student?.toString() === student._id.toString()
                );
                return {
                    challan: {
                        _id: challan._id,
                        challanNumber: challan.challanNumber,
                        semester: challan.semester,
                        amount: challan.amount,
                        dueDate: challan.dueDate,
                        fineAfterDueDate: challan.fineAfterDueDate
                    },
                    status: assignment?.status || 'pending',
                    assignedDate: assignment?.assignedDate,
                    paidDate: assignment?.paidDate,
                    amountPaid: assignment?.amountPaid || 0
                };
            });

            return {
                _id: student._id,
                name: student.name,
                email: student.email,
                studentId: student.studentId,
                assignedChallans: assignedChallans
            };
        })
    );

    return studentsWithChallans;
};

/**
 * Update student challan status to paid
 */
exports.updateStudentChallanToPaid = async ({ challanId, studentId }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head department can update challan status.');
        error.status = 403;
        throw error;
    }

    if (!challanId || !studentId) {
        const error = new Error('challanId and studentId are required');
        error.status = 400;
        throw error;
    }

    // Find the challan
    const challan = await Challan.findById(challanId);
    if (!challan) {
        const error = new Error('Challan not found');
        error.status = 404;
        throw error;
    }

    // Check if student is assigned to this challan
    const studentChallan = challan.assignedStudents.find(
        (student) => student.student.toString() === studentId
    );

    if (!studentChallan) {
        const error = new Error('Student is not assigned to this challan');
        error.status = 404;
        throw error;
    }

    // Update student challan status to paid
    studentChallan.status = 'paid';
    studentChallan.paidDate = new Date();

    await challan.save();

    return {
        challanId: challan._id,
        studentId: studentId,
        status: studentChallan.status,
        paidDate: studentChallan.paidDate
    };
};

/**
 * Send message to a single instructor
 */
exports.sendMessageToInstructor = async ({ instructorId, subject, message }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head of department can send messages.');
        error.status = 403;
        throw error;
    }

    if (!instructorId || !subject || !message) {
        const error = new Error('All fields are required: instructorId, subject, message');
        error.status = 400;
        throw error;
    }

    // Get department head's department
    const department = await Department.findOne({ head: headUser._id });
    if (!department) {
        const error = new Error('Department not found for this head');
        error.status = 404;
        throw error;
    }

    // Verify instructor exists and belongs to the same department
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
        const error = new Error('Instructor not found');
        error.status = 404;
        throw error;
    }

    // Check if instructor belongs to the same department
    if (!department.instructors.includes(instructorId)) {
        const error = new Error('Instructor does not belong to your department');
        error.status = 403;
        throw error;
    }

    // Create message
    const newMessage = new Message({
        sender: headUser._id,
        recipient: instructorId,
        department: department._id,
        subject: subject.trim(),
        message: message.trim()
    });

    await newMessage.save();

    await newMessage.populate('sender', 'name email');
    await newMessage.populate('recipient', 'name email');

    return newMessage;
};

/**
 * Send message to all instructors
 */
exports.sendMessageToAllInstructors = async ({ subject, message }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head of department can send messages.');
        error.status = 403;
        throw error;
    }

    if (!subject || !message) {
        const error = new Error('All fields are required: subject, message');
        error.status = 400;
        throw error;
    }

    // Get department head's department
    const department = await Department.findOne({ head: headUser._id });
    if (!department) {
        const error = new Error('Department not found for this head');
        error.status = 404;
        throw error;
    }

    // Load only valid instructor users
    const validInstructors = await User.find({
        _id: { $in: department.instructors },
        role: 'instructor'
    }).select('_id');

    if (validInstructors.length === 0) {
        const error = new Error('No valid instructors found in your department');
        error.status = 400;
        throw error;
    }

    const messages = validInstructors.map(({ _id }) => ({
        sender: headUser._id,
        recipient: _id,
        department: department._id,
        subject: subject.trim(),
        message: message.trim()
    }));

    const createdMessages = await Message.insertMany(messages, { ordered: false });

    await Message.populate(createdMessages, [
        { path: 'sender', select: 'name email' },
        { path: 'recipient', select: 'name email' }
    ]);

    return {
        count: createdMessages.length,
        messages: createdMessages
    };
};

/**
 * Get head sent messages
 */
exports.getHeadSentMessages = async ({ page = 1, limit = 10 }, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head of department can view sent messages.');
        error.status = 403;
        throw error;
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ sender: headUser._id })
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Message.countDocuments({ sender: headUser._id });

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
 * Delete a sent message
 */
exports.deleteMessage = async (messageId, headUser) => {
    if (headUser.role !== 'headDept') {
        const error = new Error('Access denied. Only head of department can delete messages.');
        error.status = 403;
        throw error;
    }

    const message = await Message.findById(messageId);
    if (!message) {
        const error = new Error('Message not found');
        error.status = 404;
        throw error;
    }

    // Verify the message was sent by the current user
    if (message.sender.toString() !== headUser._id.toString()) {
        const error = new Error('You can only delete your own messages');
        error.status = 403;
        throw error;
    }

    await Message.findByIdAndDelete(messageId);

    return { deleted: true };
};
