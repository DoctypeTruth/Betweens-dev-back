const mongoose = require('../database');

const technologySchema = new mongoose.Schema([{
  name: {
    type: String,
    required: true,
    unique: true
  }
}]);

const Technology = mongoose.model('Technology', technologySchema, 'technology');

module.exports = Technology;