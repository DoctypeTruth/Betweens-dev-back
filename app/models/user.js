// const mongoose = require('mongoose');
const mongoose = require('../database');
const userSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technology'
    },
    name: String
  },
  specialization: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization'
    },
    name: String
  }
});

const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
