require('dotenv').config();
const cors = require('cors');
const express = require('express');
// const router = require('./app/router');
const multer = require('multer');

const mongodbConnexion = require('./app/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Connection to mongodb
mongodbConnexion();

const bodyParser = multer();


// We use .none() to specify when file is not expected, only classic inputs.
app.use(bodyParser.none());

app.use(cors());
app.use(express.urlencoded({ extended: true }));
// app.use(router);

app.listen(PORT, () => {
  console.log(`BetweenDevs API listening on port ${PORT}`);
});
