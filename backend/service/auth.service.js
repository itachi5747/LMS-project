const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const User = require('../models/user.model.js');
const { sendPasswordResetEmail, sendResetSuccessEmail } = require("../mailtrap.js/email.js");

/**
 * Register a new admin user
 */
exports.signUpAdmin = async ({ name, email, password, employeeId }) => {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
        const error = new Error('Admin with this email already exists');
        error.status = 400;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create admin
    const adminUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        employeeId
    });

    await adminUser.save();

    return {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
    };
};

/**
 * Login user
 */
exports.login = async ({ email, password }) => {
    // Validate required fields
    if (!email || !password) {
        const error = new Error('Email and password are required');
        error.status = 400;
        throw error;
    }

    // Find user by email (case insensitive) and populate department
    const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true
    }).populate('department', 'name code');

    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 400;
        throw error;
    }

    // Check if password is valid
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid credentials');
        error.status = 400;
        throw error;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Build response data
    const responseData = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    // Add role-specific fields
    if (user.role === 'student') {
        responseData.studentId = user.studentId;
        responseData.semester = user.semester;
        responseData.department = user.department?.name;
        responseData.enrolledCoursesCount = user.enrolledCourses.length;
    } else if (user.role === 'instructor' || user.role === 'headDept') {
        responseData.employeeId = user.employeeId;
        responseData.department = user.department;
        responseData.teachingCoursesCount = user.teachingCourses.length;
    } else if (user.role === 'admin') {
        responseData.employeeId = user.employeeId;
    }

    return responseData;
};

/**
 * Request password reset
 */
exports.forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error('User not found');
        error.status = 400;
        throw error;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    return { resetToken };
};

/**
 * Reset password with token
 */
exports.resetPassword = async ({ token, password }) => {
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
        const error = new Error('Invalid or expired reset token');
        error.status = 400;
        throw error;
    }

    // Update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    return { userId: user._id };
};

/**
 * Get authenticated user data
 */
exports.checkAuth = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    return user;
};
