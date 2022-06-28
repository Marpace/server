const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}

const GRID_COLOUR = '#151201';
const SNAKE_1_COLOUR = '#88F1D2';
const SNAKE_2_COLOUR = '#FFEF5C';
const FOOD_COLOUR = '#e66916';

const socket = io('https://snake-race.herokuapp.com');
// const socket = io('http://localhost:3000');

socket.on('countdown', handleCountdown);
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
socket.on('updatePlayerTwoSettings', handleUpdatePlayerTwoSettings);
socket.on('updateAllYouCanEatTimer', handleUpdateAllYouCanEatTimer);
socket.on('updateChosenGameType', handleUpdateChosenGameType)

//chat 
socket.on('postMessage', handlePostMessage);


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
const header = qs(".header");

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
const gameTypeOptions = qsa(".game-type__option")
const currentGameType = qs(".current-game-type")
const gameTypeDropdown = qs("#game-type-dropdown")
const gameTypeHeader = qs("#game-type-header")


//game chat 
const gameChat = qs("#game-chat");
const messageInput = qs("#compose-message");
const sendMessageBtn = qs("#send-message-btn");
const sentMessagesContainer = qs("#sent-messages");




let countdownTimer = 1000;  

let gameMode = "";
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

playAgainBtn.addEventListener('click', startGame);


function startGame() {

    startGameBtn.style.display = "none";
    playAgainBtn.classList.add("button-disabled");
    playAgainBtn.style.display = "block";
    gameActive = true;
    if(gameMode === "singlePlayer") {
        gameMessage.innerHTML = "";
        foodCount.innerHTML = 0;
        const gameSettings = {
            mode: gameMode,
            speed: parseInt(speedInput.value),
            gameType: currentGameType.innerHTML
        };
        socket.emit('startGame', gameSettings);
    } 
    if(gameMode === "multiplayer") {
        const gameSettings = {
            mode: gameMode,
            code: playerNumber === 1 ? gameCode : joinInput.value,
            speed: parseInt(speedInput.value),
            goal: parseInt(goalInput.value),
            gameType: currentGameType.innerHTML
        }
        socket.emit('startGame', gameSettings);
    }
}

function init() {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    if(window.screen.width < 416 ) {
        canvas.width = canvas.height = 340;
    } else {
        canvas.width = canvas.height = 600;
    }
  
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
         e.preventDefault(); 
         const data = {
             keyCode: e.keyCode,
             gameMode: gameMode
         }
         socket.emit('keydown', data)
         break; 
         case 13: 
         if(messageInput === document.activeElement) {
            sendMessage();
         }
        default: break; 
    }
}

function handleCountdown(gameType) {
    const countdown = [3, 2, 1, 0]
    countdownDisplay.innerHTML = "";
    countdownDisplay.style.top = "50%",
    countdownDisplay.style.fontSize = "6.5rem"
    countdownDisplay.style.fontFamily = "'Bungee Shade', sans-serif"
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



//starts timer for "All you can eat" game type and resets values when game over
function handleUpdateAllYouCanEatTimer(seconds) {
    countdownDisplay.style.top = "-30px",
    countdownDisplay.style.fontSize = "1.5rem"
    countdownDisplay.style.fontFamily = "'Bungee', sans-serif"
    countdownDisplay.innerHTML = seconds
}


// single player functions /////////////////////////////////////////

function newSinglePlayerGame() {
    if(window.screen.width < 416) header.style.fontSize = "2rem";
    gameScreen.style.display = "flex";
    gameTypeHeader.style.display = "none"
    gameChat.style.display = "none";
    gameOptions.style.display = "none";
    currentPlayers.style.display = "none";
    gameStatsMultiplayer.style.display = "none";
    goalSetting.style.display = "none";
    gameMode = "singlePlayer";
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

    if(state.gameType === "All you can eat") {
        food.forEach(piece => {
            ctx.fillStyle = FOOD_COLOUR;
            ctx.fillRect(piece.x * size, piece.y * size, size, size);
        });
    } else {
        ctx.fillStyle = FOOD_COLOUR;
        ctx.fillRect(food.pos.x * size, food.pos.y * size, size, size);
    }

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
    gameChat.style.display = "flex";
    lobbyScreen.style.display = "none";
    gameStatsSinglePlayer.style.display = "none";
    gameTypeHeader.style.display = "none";
    socket.emit('newMultiplayerGame', nicknameInput.value);
    init();
    gameMode = "multiplayer";
}

function joinGame() {
    if(joinInput.value === "") {
        codeInputMessage.style.opacity = "1";
        codeInputMessage.innerHTML = "Please enter a game code";
        return;
    }
    gameChat.style.display = "flex";
    startGameBtn.style.display = "none";
    gameTypeDropdown.style.display = "none";
    gameTypeHeader.style.display = "block";
    gameStatsSinglePlayer.style.display = "none";
    const code = joinInput.value;
    socket.emit('joinGame', JSON.stringify({code: code, playerTwoName: nicknameInput.value}));
    init();
    gameMode = "multiplayer";
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

function handleUpdatePlayerTwoSettings(settings) {
    if(playerNumber === 2) {
        goalInput.value = settings.goal;
        speedInput.value = settings.speed;
    }
    console.log(playerNumber)
    console.log(settings)
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

    if(state.gameType === "All you can eat") {
        food.forEach(piece => {
        ctx.fillStyle = FOOD_COLOUR;
        ctx.fillRect(piece.x * size, piece.y * size, size, size);
    });
    } else {
        ctx.fillStyle = FOOD_COLOUR;
        ctx.fillRect(food.pos.x * size, food.pos.y * size, size, size);
    }
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

function handleUpdateChosenGameType(gameType) {
    currentGameType.innerHTML = gameType;
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
}


sendMessageBtn.addEventListener('click', sendMessage)

function sendMessage() {
    const data = {
        message: messageInput.value,
        author: playerNumber
    }
    if(data.message === "") {return;}
    socket.emit('sendMessage', data)
    messageInput.value = "";
}


function handlePostMessage(data) {
    const newMessage = document.createElement("div");
    const messageText = document.createElement("p");

    newMessage.classList.add("chat-message");
    messageText.innerHTML = data.message

    newMessage.appendChild(messageText);
    sentMessagesContainer.appendChild(newMessage);

    sentMessagesContainer.scrollTop = sentMessagesContainer.scrollHeight;

    if(data.author === playerNumber){
        newMessage.classList.add("outgoing-message");
    } else {
        newMessage.classList.add("incoming-message");
    }
}

gameTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
        if(option.innerHTML === "Pedal to the metal") {
            console.log("Pedal to the metal")
            speedInput.disabled = true;
            goalInput.disabled = false;
        } 
        if (option.innerHTML === "All you can eat"){
            goalInput.disabled = true;
            speedInput.disabled = false;
        }
        if(option.innerHTML === "Classic" || option.innerHTML === "Live bait") {
            goalInput.disabled = false;
            speedInput.disabled = false;
        }
        gameTypeOptions.forEach( option => {
            option.classList.remove("option-active")
        });
        option.classList.add("option-active") 
        currentGameType.innerHTML = option.innerHTML;
        const data = {
            gameCode: gameCode,
            gameType: option.innerHTML
        }
        socket.emit('chosenGameType', data)
    })
});


// MOBILE //////////////////////////////////////
const mobileSettingsBtn = qs("#mobile-settings-trigger");
const mobileChatBtn = qs("#mobile-chat-trigger");
const gameAside = qs(".game-aside");
const backArrow = qs(".back-arrow");
const mobileControlArrows = Array.from(qsa(".mobile-controls__arrow"));
const mobileStartGameBtn = qs("#mobile-start-game-btn");

mobileStartGameBtn.addEventListener('click', startGame)

mobileSettingsBtn.addEventListener('click', () => {
    gameAside.style.left = "50%";
    gameAside.style.transform = "translateX(-50%)"
});

backArrow.addEventListener('click', () => {
    gameAside.style.left = "-110%"
});

mobileControlArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
        if(arrow.classList.contains("up")){
            socket.emit('keydown', {gameMode: gameMode, keyCode: "38"})
        }
        if(arrow.classList.contains("down")){
            socket.emit('keydown', {gameMode: gameMode, keyCode: "40"})
        }
        if(arrow.classList.contains("left")){
            socket.emit('keydown', {gameMode: gameMode, keyCode: "37"})
        }
        if(arrow.classList.contains("right")){
            socket.emit('keydown', {gameMode: gameMode, keyCode: "39"})
        }
    });
});
