const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    gradePoint: {
      type: Number,
      min: 0,
      max: 4,
    },
    semester: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String
    }
  },
  { timestamps: true }
);

// Prevent duplicate result entries per student-course-semester
resultSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
