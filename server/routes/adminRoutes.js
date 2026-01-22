const express = require('express');
const router = express.Router();
const { getAllUsers, getPlatformStats, getRoleRequests, updateRoleStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/users', getAllUsers);
router.get('/stats', getPlatformStats);
router.get('/role-requests', getRoleRequests);
router.put('/role-requests/:id', updateRoleStatus);

module.exports = router;
