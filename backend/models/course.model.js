const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        instructors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            validate: {
                validator: async function (value) {
                    const user = await mongoose.model('User').findById(value);
                    return user && (user.role === 'instructor' || user.role === 'headDept');
                },
                message: 'Each assigned instructor must have instructor or headDept role'
            }
        }],
        enrolledStudents: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
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
        credits: {
            type: Number,
            required: true,
            min: 1,
            max: 3
        },
        semester: {
           type : String,
           required : true
        },
        
        capacity: {
            type: Number,
            // required: true,
            min: 1,
            max: 50
        },
        prerequisites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
        isRegistrationOpen: {
            type: Boolean,
            default: false,
            description: 'When true, students can register/unregister; when false, they cannot'
        }

    },
    { timestamps: true }
);

// Indexes for better query performance
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ instructors: 1 });
courseSchema.index({ semester: 1 });
// courseSchema.index({ isActive: 1 });

// Virtual to get enrolled student count
courseSchema.virtual('enrolledCount').get(function () {
    return this.enrolledStudents.filter(enrollment => enrollment.status === 'enrolled').length;
});

// Virtual to check if course is full
courseSchema.virtual('isFull').get(function () {
    return this.enrolledCount >= this.capacity;
});

// Virtual to get available spots
courseSchema.virtual('availableSpots').get(function () {
    return Math.max(0, this.capacity - this.enrolledCount);
});



module.exports = mongoose.model('Course', courseSchema);