const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 2,
            maxlength: 10
        },
        description: {
            type: String,
            required: true
        },
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function(value) {
                    const user = await mongoose.model('User').findById(value);
                    return user && (user.role === 'headDept' || user.role === 'admin');
                },
                message: 'Department head must be an instructor or admin'
            }
        },
        // These arrays will be populated automatically based on user assignments
        students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        instructors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        establishedDate: {
            type: Date,
            default: Date.now
        },
        // Additional useful fields
        building: {
            type: String,
            required: true
        },
        contactEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        contactPhone: {
            type: String
        }
    },
    { timestamps: true }
);

// Index for better query performance
departmentSchema.index({ code: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

// Virtuals for counts
departmentSchema.virtual('studentCount').get(function() {
    return this.students.length;
});

departmentSchema.virtual('instructorCount').get(function() {
    return this.instructors.length;
});

departmentSchema.virtual('courseCount').get(function() {
    return this.courses.length;
});

module.exports = mongoose.model('Department', departmentSchema);