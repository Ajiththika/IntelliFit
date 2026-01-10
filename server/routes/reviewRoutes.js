const express = require('express');
const router = express.Router();
const { createReview, getTailorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createReview);
router.route('/:tailorId').get(getTailorReviews);

module.exports = router;
