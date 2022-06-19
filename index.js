const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: "*"}});
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require("./constants");
const { makeId } = require("./utils");

const state = {};
const socketRooms = {};

const port = process.env.PORT || 3000

app.use(express.static('public'));
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
  res.render("index");
});
  
io.on('connection', (socket) => {   
  
  socket.on("keydown", handleKeyDown)
  socket.on("newGame", handleNewGame)
  socket.on("joinGame", handleJoinGame)

  function handleJoinGame(gameCode){

    socketRooms[socket.id] = gameCode;

    socket.join(gameCode);
    socket.number = 2;
    socket.emit("init", 2);

    io.sockets.in(gameCode)
    .emit("countdown")

    setTimeout(() => {
      startGameInterval(gameCode)
    }, 4000);
  }

  function handleNewGame() {
    let roomName = makeId(5);
    socketRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName)
 
    state[roomName] = initGame();
 
    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
  }

  function handleKeyDown(keyCode) {
    const roomName = socketRooms[socket.id];

    if(!roomName) {
      return
    }

    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
    const vel = getUpdatedVelocity(keyCode);

    if(state[roomName]){
      if(vel) {
        state[roomName].players[socket.number -1].vel = vel;
      }
    }
  }
});


function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if(!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner)
      state[roomName] = null
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(roomName, state){
  io.sockets.in(roomName)
  .emit("gameState", JSON.stringify(state));
}

function emitGameOver(roomName, winner){
  io.sockets.in(roomName)
  .emit("gameOver", JSON.stringify({ winner }));
}




server.listen(port, () => {
  console.log('listening on port: 3000');
});