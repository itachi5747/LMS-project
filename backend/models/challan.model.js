const mongoose = require('mongoose');

const challanSchema = new mongoose.Schema(
    {
        challanNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        // Challan amount: 70000 for semester 1, then +4000 for each next semester
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        fineAfterDueDate: {
            type: Number,
            required: true,
            default: 500, // Fine amount per day after due date
            min: 0
        },
        // For tracking which students have seen/paid this challan
        assignedStudents: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            assignedDate: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'notified', 'paid', 'overdue'],
                default: 'pending'
            },
            paidDate: {
                type: Date,
                default: null
            },
            amountPaid: {
                type: Number,
                default: 0
            }
        }],
        status: {
            type: String,
            enum: ['active', 'inactive', 'archived'],
            default: 'active'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isAssigned: {
            type: Boolean,
            default: false
        },
        assignedDate: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Index for better query performance
challanSchema.index({ department: 1 });
challanSchema.index({ semester: 1 });
challanSchema.index({ challanNumber: 1 });
challanSchema.index({ status: 1 });
challanSchema.index({ 'assignedStudents.student': 1 });

// Virtual to get total students assigned to this challan
challanSchema.virtual('totalAssignedStudents').get(function() {
    return this.assignedStudents ? this.assignedStudents.length : 0;
});

// Virtual to get pending payments count
challanSchema.virtual('pendingPayments').get(function() {
    if (!this.assignedStudents) return 0;
    return this.assignedStudents.filter(s => s.status === 'pending' || s.status === 'notified').length;
});

// Static method to calculate challan amount based on semester
challanSchema.statics.calculateAmount = function(semester) {
    const baseAmount = 70000; // 70k for semester 1
    const incrementPerSemester = 4000; // +4k for each next semester
    return baseAmount + ((semester - 1) * incrementPerSemester);
};

module.exports = mongoose.model("Challan", challanSchema);
