require('dotenv').config();
const cors = require('cors');
const express = require('express');
const router = require('./app/routers/index');
const multer = require('multer');

const http = require('http');
const socketIo = require('socket.io');
const Message = require('./app/models/message')

const app = express();
const PORT = process.env.PORT || 5001;

const bodyParser = multer();

// Home route
app.get('/', (_req, res) => {
  res.send('Api betweenDevs Launched')
});

app.get('/socket-test', (_req, res) => {
  res.sendFile(__dirname + '/socket-test.html');
});

const server = http.createServer(app);

// Temporary line to test chat
app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));

const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket :', socket.id);

  // Écoutez les messages des clients
  socket.on('message', async (data) => {
    const message = data.message;
    const date = data.date;
    const senderId = data.senderId;
    const receiverId = data.receiverId;
    const matchId = data.matchId;
    const socketId = socket.id

    try {
      // Créez une instance du modèle "Message" avec les données reçues
      const newMessage = new Message({
        message,
        date,
        senderId,
        receiverId,
        matchId,
        socketId
      });

      // Enregistrez le nouveau message dans la collection "messages"
      const savedMessage = await newMessage.save();
      console.log('Nouveau message enregistré :', newMessage);

      // Émettez le message à tous les clients connectés à la discussion

      socket.join(`match_${matchId}`)
      io.to(`match_${matchId}`).emit('message', savedMessage);

      // io.emit('message', savedMessage);
      // io.to(`match_${matchId}`).emit('message', savedMessage)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du message :', error);
    }
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
  });


  socket.on('disconnect', () => {
    console.log('Déconnexion socket :', socket.id);
  });
});

// We use .none() to specify when file is not expected, only classic inputs.
app.use(bodyParser.none());

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Set up the server in the Express application
app.server = server;

app.use(router);

server.listen(PORT, () => {
  console.log(`BetweenDevs API listening on port ${PORT}`);
});
