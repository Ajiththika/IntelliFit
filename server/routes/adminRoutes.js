const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPlatformStats,
    getRoleRequests,
    updateRoleStatus,
    suspendUser,
    getAuditLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.get('/stats', getPlatformStats);
router.get('/role-requests', getRoleRequests);
router.put('/role-requests/:id', updateRoleStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
