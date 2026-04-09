const Course = require('../models/course.model');
const User = require('../models/user.model');
const Challan = require('../models/challan.model');
const Result = require('../models/result.model');
const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const { cloudinary } = require('../config/cloudinary');

/**
 * Get all courses with full details for enrollment
 */
exports.getAllCourses = async (studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const courses = await Course.find({})
        .populate('instructors', 'name email employeeId')
        .populate('prerequisites', 'title code')
        .lean();

    const studentResults = await Result.find({ student: studentUser._id }).lean();
    const passedCourseIds = new Set(
        studentResults
            .filter(r => r.grade && r.grade.toUpperCase() !== 'F')
            .map(r => r.course.toString())
    );

    return courses.map(c => {
        const prereqs = (c.prerequisites || []).map(prereq => ({
            _id: prereq._id,
            title: prereq.title,
            code: prereq.code,
            passed: passedCourseIds.has(prereq._id.toString())
        }));

        return {
            _id: c._id,
            title: c.title,
            code: c.code,
            credits: c.credits,
            description: c.description,
            semester: c.semester,
            instructors: c.instructors || [],
            capacity: c.capacity || 0,
            enrolledCount: c.enrolledStudents ? c.enrolledStudents.filter(es => es.status === 'enrolled').length : 0,
            isRegistrationOpen: c.isRegistrationOpen,
            prerequisites: prereqs,
            prerequisitesMet: prereqs.length === 0 || prereqs.every(p => p.passed)
        };
    });
};

/**
 * Download assignment file
 */
exports.downloadAssignment = async (assignmentId, studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    if (!assignmentId) {
        const error = new Error('assignmentId is required');
        error.status = 400;
        throw error;
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        const error = new Error('Assignment not found');
        error.status = 404;
        throw error;
    }

    const publicId = assignment.filePublicId;
    if (!publicId || typeof publicId !== 'string') {
        if (assignment.fileUrl) {
            return { redirectUrl: assignment.fileUrl };
        }
        const error = new Error('No file available for this assignment');
        error.status = 404;
        throw error;
    }

    const url = cloudinary.url(publicId, { resource_type: 'raw', secure: true });
    return { redirectUrl: url };
};

/**
 * Enroll student in a course
 */
exports.enrollInCourse = async (courseId, studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;

    if (!courseId) {
        const error = new Error('courseId is required');
        error.status = 400;
        throw error;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Check if registration is open
    if (!course.isRegistrationOpen) {
        const error = new Error('Registration is closed for this course');
        error.status = 400;
        throw error;
    }

    // Check if already enrolled
    const already = course.enrolledStudents.some(es => es.student && es.student.toString() === studentId.toString() && es.status === 'enrolled');
    if (already) {
        const error = new Error('Already enrolled in this course');
        error.status = 400;
        throw error;
    }

    // Check if student's challan (semester fee) is paid
    const studentSemester = studentUser.semester;
    const studentDepartment = studentUser.department;
    if (!studentSemester || !studentDepartment) {
        const error = new Error('Student semester or department not set');
        error.status = 400;
        throw error;
    }

    const challan = await Challan.findOne({
        department: studentDepartment,
        semester: studentSemester,
        assignedStudents: {
            $elemMatch: { student: studentId, status: 'paid' }
        }
    });

    if (!challan) {
        const error = new Error('You must pay your semester fee (challan) before enrolling in courses');
        error.status = 400;
        throw error;
    }

    // Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
        const prereqResults = await Result.find({
            student: studentId,
            course: { $in: course.prerequisites }
        });

        const passedCourseIds = new Set(
            prereqResults
                .filter(r => r.grade && r.grade.toUpperCase() !== 'F')
                .map(r => r.course.toString())
        );

        const missingPrereqs = course.prerequisites.filter(
            pr => !passedCourseIds.has(pr.toString())
        );

        if (missingPrereqs.length > 0) {
            const missingCourses = await Course.find({ _id: { $in: missingPrereqs } }).select('title code');
            const missingNames = missingCourses.map(c => `${c.title} (${c.code})`).join(', ');
            const error = new Error(`You must pass the following prerequisites (grade other than F): ${missingNames}`);
            error.status = 400;
            throw error;
        }
    }

    // Check capacity
    const enrolledCount = course.enrolledStudents.filter(es => es.status === 'enrolled').length;
    if (course.capacity && enrolledCount >= course.capacity) {
        const error = new Error('Course is full');
        error.status = 400;
        throw error;
    }

    // Add enrollment record to course and to user
    course.enrolledStudents.push({ student: studentId });
    await course.save();

    const user = await User.findById(studentId);
    user.enrolledCourses.push({ course: course._id });
    await user.save();

    return { enrolled: true };
};

/**
 * Unenroll student from a course
 */
exports.unregisterFromCourse = async (courseId, studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;

    if (!courseId) {
        const error = new Error('courseId is required');
        error.status = 400;
        throw error;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        error.status = 404;
        throw error;
    }

    // Check if registration/unregistration is open
    if (!course.isRegistrationOpen) {
        const error = new Error('Unregistration is closed for this course');
        error.status = 400;
        throw error;
    }

    // Check if student is enrolled
    const enrollmentIndex = course.enrolledStudents.findIndex(
        es => es.student && es.student.toString() === studentId.toString() && es.status === 'enrolled'
    );
    if (enrollmentIndex === -1) {
        const error = new Error('Student is not enrolled in this course');
        error.status = 400;
        throw error;
    }

    // Remove enrollment from course
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // Remove enrollment from user
    const user = await User.findById(studentId);
    const userEnrollmentIndex = user.enrolledCourses.findIndex(
        ec => ec.course && ec.course.toString() === courseId.toString() && ec.status === 'enrolled'
    );
    if (userEnrollmentIndex !== -1) {
        user.enrolledCourses.splice(userEnrollmentIndex, 1);
        await user.save();
    }

    return { unregistered: true };
};

/**
 * Get enrolled courses for student
 */
exports.getEnrolledCourses = async (studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const user = await User.findById(studentUser._id)
        .populate({
            path: 'enrolledCourses.course',
            select: '_id code title credits instructors description semester',
            populate: {
                path: 'instructors',
                select: 'name email employeeId'
            }
        });

    const enrolledCourses = user.enrolledCourses.filter(ec => ec.status === 'enrolled').map(ec => ({
        course: ec.course
    }));

    return enrolledCourses;
};

/**
 * View student challans
 */
exports.viewStudentChallans = async (studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;
    const semester = studentUser.semester;
    const departmentId = studentUser.department;

    if (!semester || !departmentId) {
        const error = new Error('Student semester or department not set');
        error.status = 400;
        throw error;
    }

    // Fetch challans for the student's department and semester
    const challans = await Challan.find({ department: departmentId, semester })
        .select('-__v')
        .lean();

    if (!challans || challans.length === 0) {
        const error = new Error('No challans found for your semester');
        error.status = 404;
        throw error;
    }

    // Attach assignment info (if any) relevant to this student
    return challans.map(ch => {
        const assigned = (ch.assignedStudents || []).find(a => String(a.student) === String(studentId));
        return {
            id: ch._id,
            challanNumber: ch.challanNumber,
            semester: ch.semester,
            amount: ch.amount,
            description: ch.description,
            dueDate: ch.dueDate,
            fineAfterDueDate: ch.fineAfterDueDate,
            status: ch.status,
            isAssigned: ch.isAssigned,
            assignedInfo: assigned ? {
                status: assigned.status,
                assignedDate: assigned.assignedDate,
                paidDate: assigned.paidDate,
                amountPaid: assigned.amountPaid
            } : null,
            createdAt: ch.createdAt
        };
    });
};

/**
 * View student grades
 */
exports.viewStudentGrades = async (studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;

    // Get all results for this student
    const results = await Result.find({ student: studentId })
        .populate('course', 'title code credits semester')
        .populate('uploadedBy', 'name')
        .sort({ semester: -1, createdAt: -1 });

    // Get enrolled courses to show courses without grades
    const user = await User.findById(studentId).populate({
        path: 'enrolledCourses.course',
        select: 'title code credits semester'
    });

    const enrolledCourses = user.enrolledCourses.filter(ec => ec.status === 'enrolled');

    // Create a map of course results
    const resultsMap = new Map();
    results.forEach(result => {
        const key = `${result.course._id}-${result.semester}`;
        resultsMap.set(key, result);
    });

    // Build the response with all enrolled courses and their grades
    return enrolledCourses.map(enrollment => {
        const course = enrollment.course;
        const key = `${course._id}-${course.semester}`;
        const result = resultsMap.get(key);

        return {
            course: {
                _id: course._id,
                title: course.title,
                code: course.code,
                credits: course.credits,
                semester: course.semester
            },
            grade: result ? {
                grade: result.grade,
                gradePoint: result.gradePoint,
                semester: result.semester,
                uploadedBy: result.uploadedBy.name,
                uploadedAt: result.uploadedAt,
                remarks: result.remarks
            } : null,
            message: result ? null : 'Grade has not been updated yet'
        };
    });
};

/**
 * Get student assignments
 */
exports.getStudentAssignments = async (studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;

    const user = await User.findById(studentId);
    const enrolledCourseIds = user.enrolledCourses
        .filter(ec => ec.status === 'enrolled')
        .map(ec => ec.course);

    if (enrolledCourseIds.length === 0) {
        return [];
    }

    const assignments = await Assignment.find({ course: { $in: enrolledCourseIds } })
        .populate('course', 'title code')
        .populate('createdBy', 'name email')
        .sort({ deadline: 1 });

    const submissions = await Submission.find({
        student: studentId,
        assignment: { $in: assignments.map(a => a._id) }
    });

    const submissionMap = new Map();
    submissions.forEach(sub => {
        submissionMap.set(sub.assignment.toString(), sub);
    });

    return assignments.map(assignment => {
        const submission = submissionMap.get(assignment._id.toString());
        return {
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            course: assignment.course,
            fileUrl: assignment.fileUrl,
            deadline: assignment.deadline,
            submissionType: assignment.submissionType,
            createdBy: assignment.createdBy,
            createdAt: assignment.createdAt,
            isOverdue: new Date(assignment.deadline) < new Date(),
            submission: submission ? {
                _id: submission._id,
                fileUrl: submission.fileUrl,
                fileName: submission.fileName,
                submittedAt: submission.submittedAt
            } : null
        };
    });
};

/**
 * Submit assignment
 */
exports.submitAssignment = async (assignmentId, file, studentUser) => {
    if (!studentUser || studentUser.role !== 'student') {
        if (file?.filename) {
            await cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
        }
        const error = new Error('Access denied');
        error.status = 403;
        throw error;
    }

    const studentId = studentUser._id;

    if (!file) {
        const error = new Error('File is required');
        error.status = 400;
        throw error;
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
        const error = new Error('Assignment not found');
        error.status = 404;
        throw error;
    }

    if (assignment.submissionType !== 'dashboard') {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
        const error = new Error('This assignment does not accept online submissions');
        error.status = 400;
        throw error;
    }

    if (new Date(assignment.deadline) < new Date()) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
        const error = new Error('Deadline has passed. Submissions are closed.');
        error.status = 400;
        throw error;
    }

    const user = await User.findById(studentId);
    const isEnrolled = user.enrolledCourses.some(
        ec => ec.course.toString() === assignment.course.toString() && ec.status === 'enrolled'
    );
    if (!isEnrolled) {
        await cloudinary.uploader.destroy(file.filename, { resource_type: 'auto' }).catch(() => {});
        const error = new Error('You are not enrolled in this course');
        error.status = 403;
        throw error;
    }

    const existingSubmission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (existingSubmission) {
        if (existingSubmission.filePublicId) {
            await cloudinary.uploader.destroy(existingSubmission.filePublicId, { resource_type: 'auto' }).catch(() => {});
        }
        existingSubmission.fileUrl = file.path;
        existingSubmission.filePublicId = file.filename;
        existingSubmission.fileName = file.originalname;
        existingSubmission.submittedAt = new Date();
        await existingSubmission.save();

        return { submission: existingSubmission, isResubmission: true };
    }

    const submission = await Submission.create({
        assignment: assignmentId,
        student: studentId,
        course: assignment.course,
        fileUrl: file.path,
        filePublicId: file.filename,
        fileName: file.originalname
    });

    return { submission, isResubmission: false };
};
