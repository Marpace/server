const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}

const GRID_COLOUR = '#151201';
const SNAKE_1_COLOUR = '#88F1D2';
const SNAKE_2_COLOUR = '#FFEF5C';
const FOOD_COLOUR = '#e66916';

// const socket = io('https://snake-race.herokuapp.com');
const socket = io('http://localhost:3000');

socket.on('init', handleInit);

//single player
socket.on('singlePlayerGameState', handleSinglePlayerGameState);
socket.on('singlePlayerGameOver', handleSinglePlayerGameOver);
socket.on('updateSingleFoodCount', handleUpdateSingleFoodCount)

//multiplayer
socket.on('multiplayerGameState', handleMultiplayerGameState);
socket.on('multiplayerGameOver', handleMultiplayerGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('reset', handleReset)
socket.on('displayPlayerOne', handleDisplayPlayerOne)
socket.on('displayPlayerNames', handleDisplayPlayerNames)
socket.on('notEnoughPlayers', handleNotEnoughtPlayers)
socket.on('updateMultiFoodCount', handleUpdateMultiFoodCount)
socket.on('updateMultiStats', handleUpdateMultiStats);

socket.on('countdown', handleCountdown);



//buttons
const multiplayerBtn = qs("#multiplayer-btn");
const singlePlayerBtn = qs("#single-player-btn");
const createGameBtn = qs("#create-game-btn");
const joinGameBtn = qs("#join-game-btn");
const startGameBtn = qs("#start-game-btn");
const backBtn = qs("#back-btn");
const playAgainBtn = qs("#play-again-btn");
const enterNicknameDiv = qs("#enter-nickname");
const continueBtn = qs("#continue-btn");

//inputs
const joinInput = qs("#join-input");
const nicknameInput = qs("#nickname-input");
const goalInput = qs("#goal-input");
const speedInput = qs("#speed-input");

//screens
const gameScreen = qs("#game-screen");
const gameOptions = qs("#game-options");
const multiplayerScreen = qs("#multiplayer");
const lobbyScreen = qs("#lobby-screen");

//message displays
const gameMessage = qs("#game-message");
const yourGameCode = qs("#your-game-code");
const countdownDisplay = qs("#countdown");
const codeInputMessage = qs("#code-input-message");
const nicknameMessage = qs("#nickname-message");
const welcomeMessage = qs("#welcome-message");

//game aside 
const player1 = qs("#player-1");
const player2 = qs("#player-2");
const currentPlayers = qs("#current-players");
const gameStatsMultiplayer = qs("#game-stats-multiplayer");
const gameStatsSinglePlayer = qs("#game-stats-single-player");
const foodCount = qs("#food-count");
const highscore = qs("#highscore");
const goalSetting = qs("#goal-setting");
const speedSetting = qs("#speed-setting");
const playerOneFoodCount = qs("#player-one-food-count");
const playerTwoFoodCount = qs("#player-two-food-count");
const wins = qs("#wins");
const losses = qs("#losses");


let countdownTimer = 1000;  

let singlePlayer = false;
let canvas, ctx;
let playerNumber, gameCode;
let gameActive = false;
let multiStats = {
    playerOne: {wins: 0, losses: 0},
    playerTwo: {wins: 0, losses: 0}
}

multiplayerBtn.addEventListener("click", function() {
    enterNicknameDiv.classList.toggle("visible");
})

continueBtn.addEventListener('click', function(){
    if(nicknameInput.value === "") {
        nicknameMessage.style.opacity = "1";
        nicknameMessage.innerHTML = "Please enter a nickname"
    } else if(nicknameInput.value.length > 10) {
        nicknameMessage.style.opacity = "1";
        nicknameMessage.innerHTML = "Nickname must be shorter than 10 characters"
    } else {
        multiplayerScreen.style.display = "flex";
        gameOptions.style.display = "none";
        welcomeMessage.innerHTML = `Welcome ${nicknameInput.value}`
    }
});

backBtn.addEventListener("click", function(){
    multiplayerScreen.style.display = "none";
    gameOptions.style.display = "flex";
});

singlePlayerBtn.addEventListener('click', newSinglePlayerGame);
createGameBtn.addEventListener('click', newMultiplayerGame);
joinGameBtn.addEventListener('click', joinGame);
startGameBtn.addEventListener('click', startGame)

playAgainBtn.addEventListener('click', playAgain);


function startGame() {

    startGameBtn.style.display = "none";
    playAgainBtn.classList.add("button-disabled");
    playAgainBtn.style.display = "block";
    gameActive = true;
    if(singlePlayer) {
        const gameSettings = {
            goal: goalInput.value,
            speed: parseInt(speedInput.value)
        };
        socket.emit('newSinglePlayerGame', gameSettings);
    } else {
        const code = playerNumber === 1 ? gameCode : joinInput.value
        const speed = parseInt(speedInput.value)
        const goal = parseInt(goalInput.value)
        socket.emit('startMultiplayerGame', {code: code, speed: speed, goal: goal});
    }
}

function playAgain() {
    if(gameActive) return;
    if(singlePlayer) {
        const gameSettings = {
            goal: goalInput.value,
            speed: parseInt(speedInput.value)
        };
        gameMessage.innerHTML = "";
        foodCount.innerHTML = 0;
        init();
        socket.emit('newSinglePlayerGame', gameSettings);
    } else {
        const speed = parseInt(speedInput.value)
        const goal = parseInt(goalInput.value)
        socket.emit('playAgain', {code: gameCode, speed: speed, goal: goal})
    }
    gameActive = true;
    playAgainBtn.classList.add("button-disabled");
}

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
  
    canvas.width = canvas.height = 600;
  
    ctx.fillStyle = GRID_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function keydown(e) {
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40: 
        case 32: e.preventDefault(); break; 
        default: break; 
    }
    if(singlePlayer) {
        socket.emit('singlePlayerKeydown', e.keyCode)
    } else {
        socket.emit('multiplayerKeydown', e.keyCode);
    }
}

function handleCountdown() {
    const countdown = [3, 2, 1, 0]
    for(let number of countdown) {  
        setTimeout(() => {
            if(number === 0 ){
                countdownDisplay.innerHTML = "";
            } else {
                countdownDisplay.innerHTML = number
            }
        }, countdownTimer);
        countdownTimer += 1000;
    }
}
// single player functions /////////////////////////////////////////

function newSinglePlayerGame() {
    gameScreen.style.display = "flex";
    gameOptions.style.display = "none";
    currentPlayers.style.display = "none";
    gameStatsMultiplayer.style.display = "none";
    goalSetting.style.display = "none";
    singlePlayer = true;
    init();
}

function handleSinglePlayerGameState(gameState) {
    if (!gameActive) {
      return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintSinglePlayerGame(gameState));
}

function paintSinglePlayerGame(state) {
    ctx.fillStyle = GRID_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridSize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.player, size, SNAKE_1_COLOUR);

}

function handleUpdateSingleFoodCount(data) {
    foodCount.innerHTML = data;
}

function handleSinglePlayerGameOver(data) {
    if (!gameActive) {
      return;
    }
    gameActive = false;
  
    let highscoreValue = parseInt(highscore.innerHTML);
    if(data > highscoreValue) {
        highscore.innerHTML = data;
    }
    playAgainBtn.classList.remove("button-disabled");
    gameMessage.innerHTML = "Game<br>Over";
    countdownTimer = 1000;
 
  }
// multiplayer functions /////////////////////////////////////////

function newMultiplayerGame() {
    lobbyScreen.style.display = "none";
    gameStatsSinglePlayer.style.display = "none";
    socket.emit('newMultiplayerGame', nicknameInput.value);
    init();
    singlePlayer = false;
}

function joinGame() {
    if(joinInput.value === "") {
        codeInputMessage.style.opacity = "1";
        codeInputMessage.innerHTML = "Please enter a game code";
        return;
    }
    startGameBtn.style.display = "none"
    gameStatsSinglePlayer.style.display = "none";
    const code = joinInput.value;
    socket.emit('joinGame', JSON.stringify({code: code, playerTwoName: nicknameInput.value}));
    init();
}

function handleDisplayPlayerOne(name) {
    player1.innerHTML = name;
}
function handleDisplayPlayerNames(data) {
    data = JSON.parse(data);
    player1.innerHTML = data.playerOne;
    player2.innerHTML = data.playerTwo;
    player2.parentElement.style.backgroundColor = "#B4DE3E";
}

function handleNotEnoughtPlayers(){
    startGameBtn.style.display = "block";
    playAgainBtn.style.display = "none";
    gameMessage.innerHTML = "Not enough players"
    setTimeout(() => {
        gameMessage.innerHTML = ""
    }, 2000);
}

function paintMultiplayerGame(state) {
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

function handleInit(number) {
    playerNumber = number;
    if(playerNumber === 2) {
        goalSetting.classList.add("player-2-settings")
        speedSetting.classList.add("player-2-settings")
    }
    gameScreen.style.display = "flex";
    multiplayerScreen.style.display = "none";
}

function handleMultiplayerGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintMultiplayerGame(gameState));
}

function handleUpdateMultiFoodCount(data) {
    playerOneFoodCount.innerHTML = data.playerOne
    playerTwoFoodCount.innerHTML = data.playerTwo
}

function handleUpdateMultiStats(winner) {

    if(winner === 1) {
        multiStats.playerOne.wins++ 
        multiStats.playerTwo.losses++ 
    } else {
        multiStats.playerOne.losses++ 
        multiStats.playerTwo.wins++ 
    }
    if(playerNumber === 1) {
        wins.innerHTML = multiStats.playerOne.wins
        losses.innerHTML = multiStats.playerOne.losses
    }
    if(playerNumber === 2) {
        wins.innerHTML = multiStats.playerTwo.wins
        losses.innerHTML = multiStats.playerTwo.losses
    }
} 

function handleMultiplayerGameOver(winner) {
    if (!gameActive) {
        return;
    }
    gameActive = false;
    playAgainBtn.classList.remove("button-disabled");
    countdownTimer = 1000;
    console.log(winner)

    if (winner === playerNumber) {
        gameMessage.innerHTML = "You win!"
    } else {
        gameMessage.innerHTML = "You lose"
    }
}

function handleGameCode(roomCode) {
    gameCode = roomCode;
    yourGameCode.innerHTML = `Game code: ${roomCode}`
}

function handleUnknownCode() {
    reset();
    codeInputMessage.style.opacity = "1";
    codeInputMessage.innerHTML = "Unknown game code"
}

function handleTooManyPlayers() {
    reset();
    codeInputMessage.style.opacity = "1";
    codeInputMessage.innerHTML = "Room is full"
}

function reset() {
    playerNumber = null;
    joinInput.value = '';
    gameScreen.style.display = "none";
    multiplayerScreen.style.display = "flex";
}

function handleReset() {
    gameMessage.innerHTML = "";
    init();
    countdownTimer = 1000;
    console.log(countdownTimer)
}
