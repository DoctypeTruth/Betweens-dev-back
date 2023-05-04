const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');


/* GET home page. */
router.get('/all-users', usersController.getAll);

module.exports = router;