const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const technoController = require('../controllers/technologiesController');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const matchController = require('../controllers/matchController');
const chatController = require('../controllers/chatController');


/* Login api */
router.post('/login', authController.login)

/* Users API page. */
router
  .get('/all-users', authMiddleware, usersController.getAllUsers)
  .get('/all-users-by-spe/:slug', authMiddleware, usersController.getOneUserBySpecilization)
  .get('/one-user/:id', authMiddleware, usersController.getUserById)
  .get('/all-matches', authMiddleware, matchController.getAllMatches);

router
  .post('/create-match/:matchUserId', authMiddleware, matchController.createMatch)
  .post('/create-user', usersController.createUser);

router.patch('/update-user/:id', authMiddleware, usersController.updateUser);

router.delete('/delete-user/:id', authMiddleware, usersController.deleteUser);

/* Technologies API page. */
router.get('/all-techno', technoController.getAllTechnologies);

/* Chat API */
router.get('/chat', (req, res) => {
  // Appel de la fonction handleChatLogic pour gérer la logique du chat
  chatController.handleChatConnexion(req.app.server);
  res.send('Chat started');
});

router.get('/messages/:matchId', chatController.getMessagesByMatchId)



module.exports = router;