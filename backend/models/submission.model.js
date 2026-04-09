const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
        fileName: {
            type: String,
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1 });
submissionSchema.index({ course: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
