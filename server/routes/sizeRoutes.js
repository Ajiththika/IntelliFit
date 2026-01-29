const express = require('express');
const router = express.Router();
const { generateSizing, saveSizeProfile, updateSizeProfile, getSizeProfile, getSizeHistory } = require('../controllers/sizeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateSizing);
router.post('/save', protect, saveSizeProfile);
router.patch('/update', protect, updateSizeProfile);
router.get('/history', protect, getSizeHistory);
router.get('/profile', protect, getSizeProfile);

module.exports = router;
