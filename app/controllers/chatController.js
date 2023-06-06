const socketIo = require('socket.io');
const Message = require('../models/message');

const chatController = {

  handleChatConnexion: (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
      console.log('Nouvelle connexion socket :', socket.id);
      console.log("socket", socket);
      // Listen message from client
      socket.on('message', (data) => {
        console.log('Nouveau message reçu :', data);

        // Send message for all connected clients
        io.emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log('Déconnexion socket :', socket.id);
      });

      socket.emit('connexion-établie', socket.id);
    });
  },

  getMessagesByMatchId: async (req, res) => {
    try {
      const matchId = req.params.matchId;

      const messages = await Message.find({ matchId });

      res.json(messages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des messages.' });
    }
  }
}

module.exports = chatController;