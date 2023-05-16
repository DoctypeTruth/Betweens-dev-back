
const socketIo = require('socket.io');

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
  }
}

module.exports = chatController;