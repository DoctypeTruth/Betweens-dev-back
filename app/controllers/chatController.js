
const socketIo = require('socket.io');
const Message = require('../models/message');

const chatController = {

  handleChatConnexion: (server) => {

    const io = socketIo(server);

    io.on('connection', (socket) => {
      console.log('New socket connection depuis route /chat :', socket.id);

      // var to stock current room value of the connected user
      let currentRoom = null;

      // listen message of users
      socket.on('sendMessageToRoom', async ({ room, data }) => {
        console.log(data);
        const message = data.message;
        const date = data.date;
        const senderId = data.senderId;
        const receiverId = data.receiverId;
        const matchId = data.matchId;

        try {
          // creating new instance of received data
          const newMessage = new Message({
            message,
            date,
            senderId,
            receiverId,
            matchId,
          });

          // saved message in the collection
          const savedMessage = await newMessage.save();
          console.log('New message saved:', newMessage);

          // message sent for all connected clients to the room
          io.to(room).emit('message', savedMessage);

        } catch (error) {
          console.error('Error when saving the messgage :', error);
        }
      });

      socket.on('joinRoom', (room) => {
        if (currentRoom) {
          // Leave current room
          socket.leave(currentRoom);
        }
        // Join new room
        socket.join(room);
        // updated current room of connected user
        currentRoom = room;
      });

      socket.on('disconnect', () => {

        console.log('Socket deconnection :', socket.id);
        if (currentRoom) {
          // Disconnect user from the room
          socket.leave(currentRoom);
        }
        currentRoom = null;
      });
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