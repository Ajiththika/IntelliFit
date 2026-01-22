const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, requestRoleChange, switchRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/request-role').post(protect, requestRoleChange);
router.route('/switch-role').post(protect, switchRole);

module.exports = router;
