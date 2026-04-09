const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        filePublicId: {
            type: String,
            required: true
        },
        deadline: {
            type: Date,
            required: true
        },
        submissionType: {
            type: String,
            enum: ['dashboard', 'class'],
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

assignmentSchema.index({ course: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ deadline: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
