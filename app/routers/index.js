const express = require('express');
const router = express.Router();

const usersController = require('../controllers/usersController');


/* GET home page. */
router.get('/all-users', usersController.getAllUsers);
router.post('/create-user', usersController.createUser);

// router.get('/all-users-with-spe', usersController.getUsersWithSpecialization);

module.exports = router;