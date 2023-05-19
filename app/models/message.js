const mongoose = require('../database');

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  matchId: {
    type: String,
    required: true
  },
  // socketId: {
  //   type: String,
  //   required: true
  // }
});

const Message = mongoose.model('Message', messageSchema, 'message');

module.exports = Message;
