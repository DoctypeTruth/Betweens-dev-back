const mongoose = require('../database');

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

const Specialization = mongoose.model('Specialization', specializationSchema, 'specialization');

module.exports = Specialization;