const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  user1_id: {
    type: String,
    ref: 'User',
    required: true
  },
  user2_id: {
    type: String,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  accepted: {
    type: Boolean,
    default: false
  },
  blocked: {
    type: Boolean,
    default: false
  } 
});

const Match = mongoose.model('Match', matchSchema, 'match');

module.exports = Match;