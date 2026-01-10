const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getTailors,
    getTailorById
} = require('../controllers/tailorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('tailor', 'admin'), createOrUpdateProfile) // Create/Update
    .get(getTailors); // List all

router.route('/:id')
    .get(getTailorById); // Get one

module.exports = router;
