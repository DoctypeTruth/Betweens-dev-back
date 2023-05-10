const mongoose = require('../database');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    unique: true
  },
  pseudo: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  city: String,
  picture: String,
  password: {
    type: String,
    required: true
  },
  description: String,
  status: String,
  level: String,
  goals: [String],
  technology: {
    _id: {
      type: mongoose.Schema.Types.String,
      ref: 'Technology'
    },
    name: String
  },
  specialization: {
    _id: {
      type: mongoose.Schema.Types.String,
      ref: 'Specialization'
    },
    name: String,
    slug: String
  },
  match: [
    {
      _id: {
        type: mongoose.Schema.Types.String,
        ref: 'Match'
      }
    }
  ],
  pendingMatch: [
    {
      _id: String,
      matchId: {
        type: mongoose.Schema.Types.String,
        ref: 'Match'
      }
    }
  ]
},
  {
    autoIndex: false
  });

const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
