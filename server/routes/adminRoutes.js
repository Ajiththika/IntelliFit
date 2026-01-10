const express = require('express');
const router = express.Router();
const { getAllUsers, getPlatformStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getPlatformStats);

module.exports = router;
