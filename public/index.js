

const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}

const GRID_COLOUR = '#151201';
const SNAKE_1_COLOUR = '#B4DE3E';
const SNAKE_2_COLOUR = '#22da84';
const FOOD_COLOUR = '#e66916';

const socket = io('https://snake-race.herokuapp.com');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('countdown', handleCountdown);

const multiplayerBtn = qs("#multiplayer-btn");
const singlePlayerBtn = qs("#single-player-btn");
const createGameBtn = qs("#create-game-btn");
const joinGameBtn = qs("#join-game-btn");
const joinInput = qs("#join-input");
const backBtn = qs("#back-btn");
const gameCode = qs("#game-code");
const gameScreen = qs("#game-screen");
const gameOptions = qs("#game-options");
const multiplayerScreen = qs("#multiplayer");
const gameMessage = qs("#game-message");

const countdown = [3, 2, 1, 0]
let countdownTimer = 1000;  



multiplayerBtn.addEventListener("click", function() {
    multiplayerScreen.style.display = "flex";
    gameOptions.style.display = "none";
})

backBtn.addEventListener("click", function(){
    multiplayerScreen.style.display = "none";
    gameOptions.style.display = "flex";
});

createGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
    gameScreen.style.display = "flex";
    multiplayerScreen.style.display = "none";
    socket.emit('newGame');
    init();
}



function joinGame() {
    gameScreen.style.display = "flex";
    multiplayerScreen.style.display = "none";
    
    const code = joinInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;


function init() {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 500;

  ctx.fillStyle = GRID_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = GRID_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridSize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_1_COLOUR);
  paintPlayer(state.players[1], size, SNAKE_2_COLOUR);
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
  console.log(gameState)
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    gameMessage.innerHTML = "You win!"
    gameMessage.style.fontSize = "4rem"
} else {
    gameMessage.innerHTML = "You lose"
    gameMessage.style.fontSize = "4rem"
  }
}

function handleGameCode(roomCode) {
  gameCode.innerHTML = roomCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  gameScreen.style.display = "none";
}

function handleCountdown() {

    for(let number of countdown) {  
        setTimeout(() => {
            if(number === 0 ){
                gameMessage.innerHTML = "";
            } else {
                gameMessage.innerHTML = number
            }
        }, countdownTimer);
        countdownTimer += 1000;
        console.log("looped")
    }
}
