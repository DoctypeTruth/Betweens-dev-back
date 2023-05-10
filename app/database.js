const mongoose = require('mongoose');

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@betweendevs.1emcuo1.mongodb.net/betweendevs?retryWrites=true&w=majority`;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = mongoose;
