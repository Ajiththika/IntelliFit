const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
            enum: ['APPROVE_ROLE', 'REJECT_ROLE', 'SUSPEND_USER', 'ACTIVATE_USER', 'DELETE_USER', 'UPDATE_SETTINGS'],
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        targetResource: {
            type: String, // e.g., 'Order', 'TailorProfile'
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        details: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
