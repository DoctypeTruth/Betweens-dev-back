# BetWeenDevs Back-End

- Read the env-example for the port & db configuration
  
- Packages Installation (npm install) :

```JSON
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "debug": "^4.3.4",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.0",
    "mongodb": "^5.3.0",
    "mongoose": "^7.1.0",
    "multer": "^1.4.5-lts.1",
    "nodemon": "^2.0.22"
```

```js
// Documentation n*1
// app/app.js
require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;
```

```js
// Documentation n*2
// public/js/chat.js

const socket = io('ws://localhost:3000');

const username = prompt('Ton pseudo ?');

function send(text) {
  socket.emit('message', { username, text });
}

socket.on('messageFromServer', (text) => {
  console.log(`Message received from server: ${text}`);
});

socket.on('messageFromOtherClient', ({ username, text }) => {
  console.log(`${username}: ${text}`);
});
```

```js
// Documentation n*3
// public/js/script.js

const socket = io('ws://localhost:3000');
const app = {

  // Initialisation de l'application
  init() {
    const canvas = createCanvas(800, 500);
    canvas.parent('board');
    document.querySelector('#tools').addEventListener('submit', (event) => { event.preventDefault(); });
    document.querySelector('#tools').addEventListener('change', this.toolsChangeHandler);
    app.strokeSize = document.querySelector('#tools #strokeSize').value;
    app.strokeColor = '#000000';
    background(255);
    socket.on('connect', app.socketConnectHandler);
  },

  socketConnectHandler() {
    app.socket = socket;
    app.socket.on('userDraw', app.drawOnBoard);
    app.createCursor({ userId: app.socket.id });
    document.addEventListener('mousemove', app.mouseMoveHandler);
    app.socket.on('userMoveCursor', app.moveCursor);
  },

  createCursor({ userId }) {
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    cursor.id = `c${userId}`;
    const hueRotate = Math.floor(Math.random() * 360);
    cursor.style.filter = `hue-rotate(${hueRotate}deg)`;
    cursor.style['-webkit-filter'] = `hue-rotate(${hueRotate}deg)`;
    document.querySelector('body').appendChild(cursor);
    return cursor;
  },

  // La gestion de mouvement de mon curseur
  mouseMoveHandler(event) {
    const data = {
      x: event.x,
      y: event.y,
      userId: app.socket.id,
      username: document.querySelector('#username').value,
    };
    app.moveCursor(data);
    app.socket.emit('moveCursor', data);
  },

  moveCursor({
    x, y, strokeColor, userId, username,
  }) {
    let cursor = document.querySelector(`#c${userId}`);
    if (!cursor) {
      cursor = app.createCursor({ userId });
    }
    cursor.textContent = username || userId;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  },

  toolsChangeHandler(event) {
    const form = document.querySelector('#tools');
    const username = form.querySelector('#username').value;
    app.strokeColor = form.querySelector('#strokeColor').value;
    app.strokeSize = form.querySelector('#strokeSize').value;
  },

  draw() {
    if (mouseIsPressed && app.socket) {
      // comme j'envoi la même chose à p5 et au serveur je le centralise dans une variable commune
      const drawData = {
        mouseX,
        mouseY,
        pmouseX,
        pmouseY,
        strokeColor: app.strokeColor,
        strokeSize: app.strokeSize,
      };

      // Je dessine en local
      app.drawOnBoard(drawData);
      // Je transmet les même infos au serveur, afin qu'il puisse les transmettre aux autres clients
      app.socket.emit('draw', drawData);
    }
  },

  drawOnBoard({
    mouseX, mouseY, pmouseX, pmouseY, strokeColor, strokeSize,
  }) {
    strokeWeight(strokeSize);
    stroke(strokeColor);
    line(mouseX, mouseY, pmouseX, pmouseY);
  },
};

// Function qui est exécuté par p5 à l'initialisation de la page
function setup() {
  app.init();
}

// Function qui est exécuté par p5 à chaque frame (par défaut 25 frames/secondes)
function draw() {
  app.draw();
}
```

```js
// Documentation n*4
// index.js
const http = require('http');
const { Server: WsServer } = require('socket.io');

const app = require('./app/app');

const httpPort = process.env.HTTP_PORT || 3000;

const httpServer = http.createServer(app);

// Créer le serveur WS en utilisant le serveur HTTP. On peut également le faire en lui attribuant un
// autre port, mais il faudrait mettre en place une politique CORS
const wsServer = new WsServer(httpServer);

httpServer.listen(httpPort, () => {
  console.log(`Listening on port ${httpPort}`);
});

// On initialise un tableau qui contiendra les utilisateurs connectés
const users = [];

wsServer.on('connection', (socket) => {
  console.log(`User : ${socket.id} connected`);
  // Pour chaque connection au serveur WS, on ajoute l'utilisateur connecté à la liste des
  // utilisateurs, en se servant des informations contenues dans l'objet socket
  users.push({ id: socket.id });
  console.log(`Total users: ${users.length}`);

  // Potentiellement un utilisateur va emmetre un évènement 'message' au serveur WS
  // On va donc écouter cette évènement et réagir de notre côté
  socket.on('message', ({ username, text }) => {
    console.log(`Message received from ${username}: ${text}`);
    // On va répondre à l'utilsateur en lui disant que l'on a bien pris en compte son message. On
    // nomme l'event message car le sens de communication ici est évident, on aurai pu le nommer
    // messageFromServer
    socket.emit('messageFromServer', 'Message received');
    // On renvoyer à tous le monde (a part celui qui a déclenché l'évènement) le message reçu
    socket.broadcast.emit('messageFromOtherClient', { username, text });
  });

  // On écoute l'évènement 'draw' qui est émis par les clients
  socket.on('draw', (drawData) => {
    // On incorpore l'id de l'utilisateur qui a dessiné dans les données reçues
    drawData.userId = socket.id;
    // On renvoie les données à tous les utilisateurs, sauf celui qui a dessiné
    socket.broadcast.emit('userDraw', drawData);
  });

  // On écoute l'évènement 'moveCursor' qui est émis par les clients
  socket.on('moveCursor', (cursorData) => {
    // On incorpore l'id de l'utilisateur qui a déplacé son curseur dans les données reçues
    cursorData.userId = socket.id;
    // On renvoie les données à tous les utilisateurs, sauf celui qui a déplacé son curseur
    socket.broadcast.emit('userMoveCursor', cursorData);
  });

  // On prévoit le cas on l'utilsateur va se deconnecter, afin de le retirer de la liste des
  // utilisateurs
  socket.on('disconnect', () => {
    users.forEach((user, index) => {
      if (user.id === socket.id) {
        users.splice(index, 1);
      }
    });
  });
});
```