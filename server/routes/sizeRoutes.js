const express = require('express');
const router = express.Router();
const { generateSize, getSizeProfile } = require('../controllers/sizeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateSize);
router.get('/profile', protect, getSizeProfile);

module.exports = router;
