const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { filterContent } = require('../utils/contentFilter');

// @desc    Get or Create Conversation
// @route   POST /api/messages/conversation
// @access  Private
const getOrCreateConversation = async (req, res) => {
    const { recipientId, orderId } = req.body;

    if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
    }

    try {
        // Check if conversation exists
        let query = {
            participants: { $all: [req.user._id, recipientId] },
            orderId: orderId || null
        };

        let conversation = await Conversation.findOne(query)
            .populate('participants', 'name avatar role')
            .populate('orderId', 'garmentType status price');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, recipientId],
                orderId: orderId || null,
                unreadCounts: {
                    [req.user._id]: 0,
                    [recipientId]: 0
                }
            });
            // Re-fetch to populate
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'name avatar role')
                .populate('orderId', 'garmentType status price');
        }

        res.json(conversation);
    } catch (error) {
        console.error("Conversation creation failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Conversations for User
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate('participants', 'name avatar role')
            .populate('orderId', 'garmentType status price')
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error("Fetch conversations failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Messages for a Conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
    try {
        // Verify membership
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Not Found' });

        // Admin override or Participant check
        const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
        const isParticipant = conversation.participants.some(p => p.equals(req.user._id));

        if (!isParticipant && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate('sender', 'name avatar role')
            .sort({ createdAt: 1 });

        // Reset unread count for viewer
        if (isParticipant) {
            const key = `unreadCounts.${req.user._id}`;
            await Conversation.findByIdAndUpdate(req.params.conversationId, {
                $set: { [key]: 0 }
            });
        }

        res.json(messages);
    } catch (error) {
        console.error("Fetch messages failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send Message
// @route   POST /api/messages/:conversationId/send
// @access  Private
const sendMessage = async (req, res) => {
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content required' });

    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        // Check if participant
        if (!conversation.participants.some(p => p.equals(req.user._id))) {
            return res.status(403).json({ message: 'Not a participant' });
        }

        // Filter Content
        const filterResult = filterContent(content);

        // Save Message
        const message = await Message.create({
            conversationId: conversation._id,
            sender: req.user._id,
            content: filterResult.redacted,
            isRedacted: filterResult.isRedacted,
            flags: filterResult.flags
        });

        // Update Conversation (Last Message & Unread Counts)
        const recipientId = conversation.participants.find(p => !p.equals(req.user._id));

        // Increment recipient unread. Note: Mixed type Map handling in Mongoose can be tricky with $inc on nested fields if strict.
        // Easiest is to read, update map, save.

        // Re-fetch to get Map object properly if needed, but atomic update is better.
        // Construct update object
        const update = {
            lastMessage: {
                content: filterResult.redacted.substring(0, 50) + (filterResult.redacted.length > 50 ? '...' : ''),
                sender: req.user._id,
                timestamp: new Date()
            }
        };

        // Dynamic key update for $inc
        const incKey = `unreadCounts.${recipientId}`;

        await Conversation.findByIdAndUpdate(conversation._id, {
            $set: update,
            $inc: { [incKey]: 1 }
        });

        // Populate sender for immediate UI display
        await message.populate('sender', 'name avatar');

        res.json(message);

    } catch (error) {
        console.error("Send message failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getOrCreateConversation,
    getConversations,
    getMessages,
    sendMessage
};
