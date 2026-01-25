const express = require('express');
const router = express.Router();
const { generateSize, getSizeProfile, updateManualMeasurements } = require('../controllers/sizeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateSize);
router.put('/manual', protect, updateManualMeasurements);
router.get('/profile', protect, getSizeProfile);

module.exports = router;
