const User = require('../models/user.js');
const Match = require('../models/match.js');
const Message = require('../models/message');

const messageController = {
    
    // GET last messages
    getLastMessage : async (req, res) => {

        const matchId  = req.params.matchId;

        try {
            const messages = await Message.find({ matchId }).sort({ date : -1 }).limit(1);
            if (messages.length === 0) {
                return res.status(404).json({ error: 'Message not found' });
              }

            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get messages' });
        }

    }
}

module.exports = messageController;