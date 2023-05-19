require('dotenv').config();
const cors = require('cors');
const express = require('express');
const router = require('./app/routers/index');
const multer = require('multer');

const http = require('http');
const socketIo = require('socket.io');
const Message = require('./app/models/message')

const { RTCPeerConnection } = require('wrtc');

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
  console.log('New socket connection :', socket.id);

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

  // Gestion de l'appel vidéo
  // Création d'une nouvelle instance de connexion RTCPeerConnection
  const peerConnection = new RTCPeerConnection();
  // Fonction asynchrone pour gérer la demande de connexion
  async function handleConnectionRequest(roomTemp) {
    console.log('Received connection request from:', socket.id);
    // Envoyer une offre à l'autre utilisateur de la salle
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.to(roomTemp).emit('offer', { roomTemp, offer: peerConnection.localDescription });
  }

  // Événement de réception d'une demande de connexion du client
  socket.on('connectionRequest', ({ roomTemp }) => {
    handleConnectionRequest(roomTemp).catch((error) => {
      console.error('Erreur lors du traitement de la demande de connexion :', error);
    });
  });

  socket.on('answer', ({ roomTemp, answer }) => {
    console.log('Received answer:', answer);
    // Envoyer la réponse à l'autre utilisateur de la salle
    socket.to(roomTemp).emit('answer', { roomTemp, answer });
  });

  // Écouter le candidat ICE émis par le client
  socket.on('iceCandidate', ({ roomTemp, iceCandidate }) => {
    console.log('Received ICE candidate:', iceCandidate);
    // Envoyer le candidat ICE aux autres clients de la salle
    socket.to(roomTemp).emit('iceCandidate', { roomTemp, iceCandidate });
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
