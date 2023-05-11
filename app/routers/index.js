const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const technoController = require('../controllers/technologiesController');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');



/* Login api */
router.post('/login', authController.login)

/* Users API page. */
router
    .get('/all-users', authMiddleware, usersController.getAllUsers)
    .get('/all-users-by-spe/:slug', authMiddleware, usersController.getOneUserBySpecilization)
    .get('/one-user/:id', usersController.getUserById);
    
router
    .post('/create-match/:matchUserId', authMiddleware, usersController.createMatch)
    .post('/create-user', usersController.createUser);

router.patch('/update-user/:id', authMiddleware, usersController.updateUser);

router.delete('/delete-user/:id', authMiddleware, usersController.deleteUser);

/* Technologies API page. */
router.get('/all-techno', authMiddleware, technoController.getAllTechnologies);

module.exports = router;