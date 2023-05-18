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

// TEMP 

app.get('/video', (_req, res) => {
  res.sendFile(__dirname + '/video/test.mp4');
});


// Home route
app.get('/', (_req, res) => {
  res.send('Api betweenDevs Launched')
});

app.get('/socket-test', (_req, res) => {
  res.sendFile(__dirname + '/socket-test.html');
});
app.get('/video-test', (_req, res) => {
  res.sendFile(__dirname + '/video-test.html');
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
      console.log('Nouveau message enregistré :', newMessage);

      // message sent for all connected clients to the room
      io.to(room).emit('message', savedMessage);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du message :', error);
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

  // Gestion de l'appel vidéo
  socket.on('offer', ({ roomTemp, offer }) => {
    // Envoyer l'offre à l'autre utilisateur de la salle
    console.log('offer')
    // socket.to(roomTemp).emit('offer', offer);
    socket.emit('offer', offer);
  });

  socket.on('answer', ({ roomTemp, answer }) => {
    console.log('answer')
    // Envoyer la réponse à l'autre utilisateur de la salle
    // socket.to(roomTemp).emit('answer', answer);
    socket.emit('anwser', answer);
  });

  // Écouter le candidat ICE émis par le client
  socket.on('iceCandidate', ({ roomTemp, iceCandidate }) => {
    console.log("iceCandidate")
    // Envoyer le candidat ICE aux autres clients de la salle
    // socket.to(roomTemp).emit('iceCandidate', iceCandidate);
    socket.emit('iceCandidate', iceCandidate)
  });

  socket.on('disconnect', () => {

    console.log('Déconnexion socket :', socket.id);
    if (currentRoom) {
      // Disconnect user from the room
      socket.leave(currentRoom);
    }
    currentRoom = null;
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
