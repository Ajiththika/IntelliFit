const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getTailors,
    getTailorById,
    getTailorDashboardStats
} = require('../controllers/tailorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/dashboard/stats')
    .get(protect, authorize('tailor', 'admin'), getTailorDashboardStats);

router.route('/me')
    .patch(protect, authorize('tailor', 'admin'), createOrUpdateProfile);

router.route('/')
    .post(protect, authorize('tailor', 'admin'), createOrUpdateProfile) // Create/Update
    .get(getTailors); // List all

router.route('/:id')
    .get(getTailorById); // Get one

router.get('/:id/reviews', require('../controllers/reviewController').getTailorReviews);

module.exports = router;
