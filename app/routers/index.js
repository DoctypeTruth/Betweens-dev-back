const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

/* GET home page. */
router.get('/all-users', usersController.getAllUsers);
router.get('/all-users-by-spe/:slug', usersController.getUsersBySpecilization);
router.post('/create-user', usersController.createUser);
router.patch('/update-user/:id', usersController.updateUser);
router.delete('/delete-user/:id', usersController.deleteUser);

// router.get('/all-users-with-spe', usersController.getUsersWithSpecialization);

module.exports = router;