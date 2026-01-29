const express = require('express');
const router = express.Router();
const {
    getOrCreateConversation,
    getConversations,
    sendMessage,
    getMessages
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/:conversationId', getMessages);
router.post('/:conversationId/send', sendMessage);

module.exports = router;
