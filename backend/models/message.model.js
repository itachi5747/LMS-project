const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function(value) {
                    const user = await mongoose.model('User').findById(value);
                    return user && user.role === 'headDept';
                },
                message: 'Sender must be a head of department'
            }
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function(value) {
                    const user = await mongoose.model('User').findById(value);
                    return user && user.role === 'instructor';
                },
                message: 'Recipient must be an instructor'
            }
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Create index for better query performance
messageSchema.index({ sender: 1, department: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
