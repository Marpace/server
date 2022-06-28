const express = require('express');
const app = express();
const http = require('http');
const { emit } = require('process');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: "*"}});
const { 
  createMultiplayerGameState, 
  multiplayerGameLoop, 
  getMultiplayerUpdatedVelocity 
} = require('./multiplayer-game');
const {
  singlePlayerGameLoop, 
  getSinglePlayerUpdatedVelocity, 
  createSinglePlayerState,

} = require('./single-player-game');
const { makeId } = require("./utils");

let FRAME_RATE;
let singlePlayerState;
const multiplayerState = {};
const socketRooms = {};
const rooms = {};
let singlePlayerFoodCount = 0;
let playerOneFoodCount = 0;
let playerTwoFoodCount = 0;
let multiplayerGoal;
let allYouCanEatSeconds = 60;

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
  socket.on('sendMessage', handleSendMessage);
  socket.on('chosenGameType', handleChosenGameType)
  

  function handleStartGame(game){
    if (game.gameType === "Pedal to the metal") {
      FRAME_RATE = 5
    } else {
      FRAME_RATE = game.speed + 6
    }

    if(game.mode === "singlePlayer") {
      singlePlayerState = createSinglePlayerState(game.gameType);
      socket.emit("countdown", game.gameType);
      setTimeout(() => {
        if(game.gameType === "Pedal to the metal") {
          startSinglePlayerGameTimeout(singlePlayerState)
        } else {
          startSinglePlayerGameInterval(singlePlayerState);
        }
      }, 4000);
    }
    if(game.mode === "multiplayer") {
      const code = game.code;
      multiplayerState[code] = createMultiplayerGameState(game.gameType);

      multiplayerGoal = game.goal;

      const settings = {
        goal: game.goal,
        speed: game.speed
      }

      if(rooms[code].playerCount < 2){
        socket.emit('notEnoughPlayers')
        return;
      }
      io.sockets.in(code)
      .emit("countdown", game.gameType)
      io.sockets.in(code)
      .emit("reset")
      io.sockets.in(code)
      .emit("updatePlayerTwoSettings", settings)
      setTimeout(() => {
        if(game.gameType === "Pedal to the metal") startMultiplayerGameTimeout(code)
        else startMultiplayerGameInterval(code)
      }, 4000);
    }
  }
  // function handleStartGame(game){
  //   FRAME_RATE = game.speed + 6

  //   if(game.mode === "singlePlayer") {
  //     singlePlayerState = createSinglePlayerState();
  //     socket.emit("countdown");
  //     setTimeout(() => {
  //       startSinglePlayerGameInterval(singlePlayerState);
  //     }, 4000);
  //   }
  //   if(game.mode === "multiplayer") {
  //     const code = game.code;
  //     multiplayerGoal = game.goal;

  //     const settings = {
  //       goal: game.goal,
  //       speed: game.speed
  //     }

  //     console.log(multiplayerGoal)
  //     if(rooms[code].playerCount < 2){
  //       socket.emit('notEnoughPlayers')
  //       return;
  //     }
  //     io.sockets.in(code)
  //     .emit("countdown")
  //     io.sockets.in(code)
  //     .emit("reset")
  //     io.sockets.in(code)
  //     .emit("updatePlayerTwoSettings", settings)
  //     setTimeout(() => {
  //       startMultiplayerGameInterval(code)
  //     }, 4000);
  //   }
  // }

  function handleKeydown(data) {
    let keyCode = data.keyCode;
    const mode = data.gameMode;
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


  //starts timer for "All you can eat" game type and resets values when game over
  function allYouCanEatTimer(seconds) {
    
    const intervalId = setInterval(() => {
      socket.emit('updateAllYouCanEatTimer', seconds)
        seconds--
        if(seconds < 1){
            clearInterval(intervalId)
            return true;
        } 
        return false;
    }, 1000);
  }


  function startSinglePlayerGameTimeout(state) {
    setTimeout(() => {
      const result = singlePlayerGameLoop(state);
      if(!result.winner) {
        socket.emit("singlePlayerGameState", JSON.stringify(state));
        if(result.foodEaten) {
          singlePlayerFoodCount++;
          FRAME_RATE++;
          socket.emit('updateSingleFoodCount', singlePlayerFoodCount);
        }
        startSinglePlayerGameTimeout(state);
      } else {
        socket.emit("singlePlayerGameOver", singlePlayerFoodCount);
        singlePlayerState = createSinglePlayerState();
        singlePlayerFoodCount = 0;
      }
    }, 1000 / FRAME_RATE);
  }

  function startSinglePlayerGameInterval(state) {
    let timerIntervalId;
    if(state.gameType === "All you can eat") {
      timerIntervalId = setInterval(() => {
        socket.emit('updateAllYouCanEatTimer', allYouCanEatSeconds)
          allYouCanEatSeconds--
          if(allYouCanEatSeconds < 0 ){
              clearInterval(timerIntervalId)
              socket.emit("singlePlayerGameOver", singlePlayerFoodCount);
              singlePlayerState = createSinglePlayerState();
              clearInterval(gameIntervalId);
              singlePlayerFoodCount = 0;
              allYouCanEatSeconds = 60;
          } 
          
      }, 1000);
    }
    const gameIntervalId = setInterval(() => {
      const result = singlePlayerGameLoop(state);
      if(!result.winner) {
        socket.emit("singlePlayerGameState", JSON.stringify(state));
        if(result.foodEaten) {
          singlePlayerFoodCount++;
          if (state.gameType === "Pedal to the metal") {
            FRAME_RATE++;
          }
          socket.emit('updateSingleFoodCount', singlePlayerFoodCount);
        }
      } else if(result.winner) {
        if(state.gameType === "All you can eat") clearInterval(timerIntervalId);
        socket.emit("singlePlayerGameOver", singlePlayerFoodCount);
        singlePlayerState = createSinglePlayerState();
        clearInterval(gameIntervalId);
        singlePlayerFoodCount = 0;
      }
    }, 1000 / FRAME_RATE);
  }




  // multiplayer functions ///////////////////////////////////////////

  function handleNewMultiplayerGame(name) {
    let roomName = makeId(5);
    socketRooms[socket.id] = roomName;
    socket.emit("gameCode", roomName)

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
  })

});
function startMultiplayerGameTimeout(roomName) {
  setTimeout(() => {
    const gameType = multiplayerState[roomName].gameType;
    const result = multiplayerGameLoop(multiplayerState[roomName]);
    if(!result.winner) {
      emitMultiplayerGameState(roomName, result.foodEaten);
      if(playerOneFoodCount === multiplayerGoal){
        const winner = 1
        emitMultiplayerGameOver(roomName, winner);
      } 
      else if(playerTwoFoodCount === multiplayerGoal){
        const winner = 2
        emitMultiplayerGameOver(roomName, winner);
      }
      else {
        startMultiplayerGameTimeout(roomName)
      }
    }
    else {
      emitMultiplayerGameOver(roomName, result.winner);
    }
  }, 1000 / FRAME_RATE);
}

function startMultiplayerGameInterval(roomName) {
  let timerIntervalId;
  if(multiplayerState[roomName].gameType === "All you can eat") {
    timerIntervalId = setInterval(() => {
      io.sockets.in(roomName)
      .emit('updateAllYouCanEatTimer', allYouCanEatSeconds)
        allYouCanEatSeconds--
        if(allYouCanEatSeconds < 0 ){
          let winner;
          clearInterval(timerIntervalId)
          if(playerOneFoodCount > playerTwoFoodCount) winner = 1;
          if(playerTwoFoodCount > playerOneFoodCount) winner = 2;
          emitMultiplayerGameOver(roomName, winner, gameIntervalId);
          clearImmediate(timerIntervalId);
          allYouCanEatSeconds = 60;
        } 
    }, 1000);
  }
    const gameIntervalId = setInterval(() => {
    const result = multiplayerGameLoop(multiplayerState[roomName]);
    if(!result.winner) {
      emitMultiplayerGameState(roomName, result.foodEaten)
      if(multiplayerState[roomName].gameType !== "All you can eat"){
        if(playerOneFoodCount === multiplayerGoal){
          const winner = 1
          emitMultiplayerGameOver(roomName, winner, gameIntervalId)
        }
        if(playerTwoFoodCount === multiplayerGoal){
          const winner = 2
          emitMultiplayerGameOver(roomName, winner, gameIntervalId)
        }
      }
    }
    else {
      if(multiplayerState[roomName].gameType === "All you can eat") clearInterval(timerIntervalId);
      emitMultiplayerGameOver(roomName, result.winner, gameIntervalId)
    }
    
  }, 1000 / FRAME_RATE);
}

function emitMultiplayerGameState(gameCode, foodEaten) {
  const gameType = multiplayerState[gameCode].gameType;
  io.sockets.in(gameCode)
  .emit("multiplayerGameState", JSON.stringify(multiplayerState[gameCode]));
  if(foodEaten === 1) playerOneFoodCount++
  if(foodEaten === 2) playerTwoFoodCount++
  if(gameType === "Pedal to the metal" && foodEaten !== false) FRAME_RATE++
  io.sockets.in(gameCode)
  .emit('updateMultiFoodCount', {playerOne: playerOneFoodCount, playerTwo: playerTwoFoodCount})
}

function emitMultiplayerGameOver(gameCode, winner, intervalId){
  const gameType = multiplayerState[gameCode].gameType;
  io.sockets.in(gameCode)
  .emit("multiplayerGameOver", winner);
  multiplayerState[gameCode] = createMultiplayerGameState(gameType);
  playerOneFoodCount = 0;
  playerTwoFoodCount = 0;
  if(gameType !== "Pedal to the metal") clearInterval(intervalId);
  io.sockets.in(gameCode)
  .emit('updateMultiStats', winner)
}

function handleChosenGameType(data) {
  io.sockets.in(data.gameCode)
  .emit('updateChosenGameType', data.gameType)
}




server.listen(port, () => {
  console.log('listening on port: 3000');
});



