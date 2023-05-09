const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

/* Login api */
router.post('/login', authController.login)

/* Users API page. */
router.get('/all-users', authMiddleware, usersController.getAllUsers);
router.get('/all-users-by-spe/:slug', authMiddleware, usersController.getOneUserBySpecilization);

router.post('/create-match/:matchUserId', authMiddleware, usersController.createMatch);

router.post('/create-user', usersController.createUser);
router.patch('/update-user/:id', authMiddleware, usersController.updateUser);
router.delete('/delete-user/:id', authMiddleware, usersController.deleteUser);


module.exports = router;