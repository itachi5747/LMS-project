const mongoose = require('mongoose');
const User = require('../models/user.model')
const Department = require('../models/department.model')
const Course = require('../models/course.model');

exports.createCourse = async ({
    user,
    title,
    code,
    description,
    departmentId,
    instructorId,
    credits,
    semester,
    prerequisites = []
}) => {
    if (!user || user.role !== 'headDept') {
        throw { status: 403, message: 'Only department head can create courses' };
    }

    try {
        const normalizedCode = code.trim().toUpperCase();

        const existingCourse = await Course.findOne({ code: normalizedCode });
        if (existingCourse) {
            throw { status: 409, message: 'Course with this code already exists' };
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            throw { status: 404, message: 'Department not found' };
        }

        if (!department.isActive) {
            throw { status: 400, message: 'Department is inactive' };
        }

        // OPTIONAL SECURITY CHECK
        // if (department.head.toString() !== user._id.toString()) {
        //     throw { status: 403, message: 'Not your department' };
        // }

        // Validate all instructors
        const instructorDocs = [];
        for (const instrId of instructorId) {
            const instructor = await User.findById(instrId);
            if (!instructor) {
                throw { status: 404, message: `Instructor with ID ${instrId} not found` };
            }
            if (instructor.role !== 'instructor' && instructor.role !== 'headDept') {
                throw { status: 400, message: `User with ID ${instrId} is not an instructor` };
            }
            if (!instructor.isActive) {
                throw { status: 400, message: `Instructor with ID ${instrId} is inactive` };
            }
            instructorDocs.push(instructor);
        }

        if (prerequisites.length > 0) {
            const prereqCourses = await Course.find({
                _id: { $in: prerequisites }
            });

            if (prereqCourses.length !== prerequisites.length) {
                throw { status: 400, message: 'Invalid prerequisites provided' };
            }
        }

        const course = await Course.create({
            title,
            code: normalizedCode,
            description,
            department: departmentId,
            instructors: instructorId,
            credits,
            semester,
            prerequisites
        });

        // Add course to each instructor's teachingCourses
        for (const instructor of instructorDocs) {
            if (!instructor.teachingCourses.includes(course._id)) {
                instructor.teachingCourses.push(course._id);
                await instructor.save();
            }
        }

        if (!department.courses.includes(course._id)) {
            department.courses.push(course._id);
            await department.save();
        }

        return course;

    } catch (error) {
        throw error;
    }
};
