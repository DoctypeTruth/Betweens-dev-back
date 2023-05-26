const mongoose = require('mongoose');

const pictureSchema = new mongoose.Schema({
    
    filename:{
        type: String,
        required: true,
    },
    filepath:{
        type: String,
        required: true,
    },

});

module.exports = mongoose.model('Picture', pictureSchema, 'picture');


