const express = require('express');
const router = express.Router();
const {
    createReview,
    getTailorReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Note: The user req asked for POST /api/orders/:orderId/review
// I can implement that here if I bind this router to /api/orders
// OR I can use a separate path structure.
// Let's try to stick to RESTful nesting or just map it explicitly.

// Option 1: Map /api/reviews
// router.post('/order/:orderId', protect, createReview);

// Option 2: The user strictly requested POST /api/orders/:orderId/review
// This implies orderRoutes.js might be the place OR I make a specific route here.

// But wait, the previous code for ReviewDialog used API.post('/reviews', body). 
// I should update ReviewDialog to match the requested API: POST /api/orders/:orderId/review.

// Let's put the route logic in correct files.
// 1. `POST /api/orders/:orderId/review` -> I will add this to `orderRoutes.js` and import controller from `reviewController`.
// 2. `GET /api/tailors/:id/reviews` -> I will add this to `tailorRoutes.js`.

// This file might be redundant if I scatter routes? 
// Actually, `server.js` has `app.use('/api/reviews', require('./routes/reviewRoutes'));`
// I can keep generic review routes here if needed, like "get all my reviews".
// But for the specific requirements, I will modify `orderRoutes` and `tailorRoutes`.

// Wait, standard practice often keeps resource controllers separate and just mounts them.
// I'll create this file but might not use it for everything if I follow strict nesting.
// Actually, I'll just use this file to export specific handlers if needed, or better yet:
// I'll put the routes where they semantically belong.

// HOWEVER, server.js explicitly mounts /api/reviews.
// The frontend in previous steps called `/reviews/${id}` (TailorPublicProfile).
// To satisfy "GET /api/tailors/:id/reviews", I should update `tailorRoutes.js`.
// To satisfy "POST /api/orders/:orderId/review", I should update `orderRoutes.js`.

// So I will write the controller, and then route it in those respective files.
// This `reviewRoutes.js` might be used for `GET /reviews/:id` (legacy/existing frontend call).
// Let's make it handle the existing frontend call to avoid breaking `TailorPublicProfile` before I update it.
// `TailorPublicProfile` calls `API.get('/reviews/${id}')`.
// I will map `/:id` here to `getTailorReviews`.

router.get('/:id', getTailorReviews);
// This handles GET /api/reviews/:id (Tailor ID)

module.exports = router;
