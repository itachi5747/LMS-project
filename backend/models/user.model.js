const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        role: {
            type: String,
            enum: ["student", "instructor", "admin", "headDept"],
            required: true,
            default: "student"
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: function() {
                return this.role === 'student';
            }
        },
        headDepartment : {
            type : String
        },
        // For students - courses they are enrolled in
        enrolledCourses: [{
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            enrollmentDate: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['enrolled', 'completed', 'dropped', 'suspended'],
                default: 'enrolled'
            }
        }],
        
        // For instructors - courses they teach
        teachingCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
        
        // Student specific fields
        studentId: {
            type: String,
            unique: true,
            sparse: true, // Allows null values while maintaining uniqueness
            required: function() {
                return this.role === 'student';
            }
        },
        
        // Instructor/Admin specific fields
        employeeId: {
            type: String,
            unique: true,
            sparse: true,
            required: function() {
                return this.role === 'instructor' || this.role === 'admin';
            }
        },
        
        // Contact information
        phone: {
            type: String,
            required: function() {
                return this.role === 'student' || this.role === 'instructor';
            }
        },
        address: {
            type: String,
            required: function() {
                return this.role === 'student' || this.role === 'instructor';
            }
        },
        
        // Academic information for students
        semester: {
            type: Number,
            min: 1,
            max: 8,
            required: function() {
                return this.role === 'student';
            }
        },
        
        // Account status
        isActive: {
            type: Boolean,
            default: true
        },
        
        // Admin who created this account (optional for admin)
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: function() {
                return this.role !== 'admin';
            }
        },
        
        // Verification fields (keep these for email verification if needed)
        isVerified: {
            type: Boolean,
            default: true // Admin creates verified accounts
        },
        verificationToken: String,
        verificationTokenExpiresAt: Date,
        
        // Password reset
        resetPasswordToken: String,
        resetPasswordExpiresAt: Date,
    },
    { timestamps: true }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ isActive: 1 });

// Virtual to get enrolled courses count for students
userSchema.virtual('activeEnrolledCount').get(function() {
    if (this.role !== 'student') return 0;
    return this.enrolledCourses.filter(enrollment => enrollment.status === 'enrolled').length;
});

// Virtual to get teaching courses count for instructors
userSchema.virtual('teachingCoursesCount').get(function() {
    if (this.role !== 'instructor') return 0;
    return this.teachingCourses.length;
});

module.exports = mongoose.model("User", userSchema);