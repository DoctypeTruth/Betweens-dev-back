require('dotenv').config();
const cors = require('cors');
const express = require('express');
const router = require('./app/routers/index');
const multer = require('multer');

const http = require('http');
const socketIo = require('socket.io');


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

  // Listen message from client
  socket.on('message', (data) => {
    const message = data.message;
    const date = data.date;
    const senderId = data.senderId;
    const receiverId = data.receiverId;
    const matchId = data.matchId;

    // Utilisez les valeurs récupérées comme vous le souhaitez
    console.log('Nouveau message reçu :', message);
    console.log('Date :', date);
    console.log('Sender ID :', senderId);
    console.log('Receiver ID :', receiverId);
    console.log('Match ID :', matchId);
    // Send message for all connected clients
    io.emit('message', data);
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
