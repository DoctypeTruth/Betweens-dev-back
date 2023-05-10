const mongoose = require('../database');

const specializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
    },
});

const Specialization = mongoose.model('Specialization', specializationSchema, 'specialization');

module.exports = Specialization;
