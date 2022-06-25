const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: "*"}});
const { initMultiplayerGame, multiplayerGameLoop, getMultiplayerUpdatedVelocity } = require('./multiplayer-game');
const {singlePlayerGameLoop, getSinglePlayerUpdatedVelocity, createSinglePlayerState } = require('./single-player-game');
let { FRAME_RATE } = require("./vars");
const { makeId } = require("./utils");

let singlePlayerState;
const multiplayerState = {};
const socketRooms = {};
const rooms = {};
let singlePlayerFoodCount = 0;
let playerOneFoodCount = 0;
let playerTwoFoodCount = 0;
let multiplayerGoal;

const port = process.env.PORT || 3000

app.use(express.static('public'));
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
  res.render("index");
});
  
io.on('connection', (socket) => {   

  socket.on('startGame', handleStartGame)
  socket.on("keydown", handleKeydown);
  socket.on("newMultiplayerGame", handleNewMultiplayerGame);
  socket.on("joinGame", handleJoinGame);
  socket.on('sendMessage', handleSendMessage)
  

  function handleStartGame(game){
    FRAME_RATE = game.speed + 6

    if(game.mode === "singlePlayer") {
      singlePlayerState = createSinglePlayerState();
      socket.emit("countdown");
      setTimeout(() => {
        startSinglePlayerGameInterval(singlePlayerState);
      }, 4000);
    }
    if(game.mode === "multiplayer") {
      const code = game.code;
      multiplayerGoal = game.goal;

      const settings = {
        goal: game.goal,
        speed: game.speed
      }

      console.log(multiplayerGoal)
      if(rooms[code].playerCount < 2){
        socket.emit('notEnoughPlayers')
        return;
      }
      io.sockets.in(code)
      .emit("countdown")
      io.sockets.in(code)
      .emit("reset")
      io.sockets.in(code)
      .emit("updatePlayerTwoSettings", settings)
      setTimeout(() => {
        startMultiplayerGameInterval(code)
      }, 4000);
    }
  }

  function handleKeydown(data) {
    let keyCode = data.keyCode;
    const mode = data.gameMode;
    console.log(mode)
    console.log(keyCode)
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
    if(mode === "singlePlayer") {
      const vel = getSinglePlayerUpdatedVelocity(keyCode, singlePlayerState);
      if(vel) {
        singlePlayerState.player.vel = vel;
      }
    }
    if(mode === "multiplayer") {
      const code = socketRooms[socket.id]
      const vel = getMultiplayerUpdatedVelocity(keyCode, multiplayerState[code], socket.number - 1);
      if(vel) {
        multiplayerState[code].players[socket.number -1].vel = vel;
      }
    }
  }

  function startSinglePlayerGameInterval(state) {
    const intervalId = setInterval(() => {
    const result = singlePlayerGameLoop(state);

    if(!result.winner) {
      socket.emit("singlePlayerGameState", JSON.stringify(state));
      if(result.foodEaten) {
        singlePlayerFoodCount++;
        socket.emit('updateSingleFoodCount', singlePlayerFoodCount);
      }
    } else {
      socket.emit("singlePlayerGameOver", singlePlayerFoodCount);
      singlePlayerState = createSinglePlayerState();
      clearInterval(intervalId);
      singlePlayerFoodCount = 0;
    }
    }, 1000 / FRAME_RATE);
  }

  // multiplayer functions ///////////////////////////////////////////

  function handleNewMultiplayerGame(name) {
    let roomName = makeId(5);
    socketRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName)
 
    multiplayerState[roomName] = initMultiplayerGame();
    rooms[roomName] = {playerCount: 1, playerOneName: name, playerTwoName: null}; 
 
    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
    io.sockets.in(roomName).emit('displayPlayerOne' , name)
  }

  function handleJoinGame(data){

    const parsedData = JSON.parse(data);
    const gameCode = parsedData.code;
    const playerTwo = parsedData.playerTwoName
    socketRooms[socket.id] = gameCode;
    
    if(!rooms[gameCode]) {
      socket.emit('unknownCode')
      return;
    } else if(rooms[gameCode].playerCount > 1)  {
      socket.emit('tooManyPlayers')
      return;
    }
    
    rooms[gameCode].playerCount = 2;
    rooms[gameCode].playerTwoName = playerTwo;
    socket.join(gameCode);
    socket.number = 2;
    socket.emit("init", 2);

    io.sockets.in(gameCode)
    .emit('displayPlayerNames', 
      JSON.stringify({playerOne: rooms[gameCode].playerOneName, 
      playerTwo: playerTwo})
    )
  }

  function handleSendMessage(data) {
    const roomName = socketRooms[socket.id];
    io.sockets.in(roomName)
    .emit('postMessage', data)
  }

  socket.on('disconnect', () => {
    const room = rooms[socketRooms[socket.id]]
    if(room) {
      room.playerCount--
    }
    console.log(rooms)
  })

});

function startMultiplayerGameInterval(roomName) {
    const intervalId = setInterval(() => {
    const result = multiplayerGameLoop(multiplayerState[roomName]);
    if(!result.winner) {
      emitMultiplayerGameState(roomName, result.foodEaten)
      if(playerOneFoodCount === multiplayerGoal){
        const winner = 1
        emitMultiplayerGameOver(roomName, winner, intervalId)
      }
      if(playerTwoFoodCount === multiplayerGoal){
        const winner = 2
        emitMultiplayerGameOver(roomName, winner, intervalId)
      }
    }
    else {
      emitMultiplayerGameOver(roomName, result.winner, intervalId)
    }
    
  }, 1000 / FRAME_RATE);
}

function emitMultiplayerGameState(gameCode, foodEaten) {
  io.sockets.in(gameCode)
  .emit("multiplayerGameState", JSON.stringify(multiplayerState[gameCode]));
  if(foodEaten === 1) playerOneFoodCount++
  if(foodEaten === 2) playerTwoFoodCount++
  io.sockets.in(gameCode)
  .emit('updateMultiFoodCount', {playerOne: playerOneFoodCount, playerTwo: playerTwoFoodCount})
}

function emitMultiplayerGameOver(gameCode, winner, intervalId){
  io.sockets.in(gameCode)
  .emit("multiplayerGameOver", winner);
  multiplayerState[gameCode] = initMultiplayerGame();
  playerOneFoodCount = 0;
  playerTwoFoodCount = 0;
  clearInterval(intervalId);
  io.sockets.in(gameCode)
  .emit('updateMultiStats', winner)
}






server.listen(port, () => {
  console.log('listening on port: 3000');
});



