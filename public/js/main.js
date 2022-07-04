const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}

import * as DOM from "./domElements.js"
import * as G from "./gameplay/game.js";
// import * as MP from "./gameplay/multiplayer.js"



// const socket = io('https://snake-race.herokuapp.com');
const socket = io('http://localhost:3000');

socket.on('countdown', G.handleCountdown);
socket.on('multiplayerGameState', G.handleGameState);
socket.on('multiplayerGameOver', handleMultiplayerGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('displayPlayerOne', handleDisplayPlayerOne)
socket.on('displayPlayerNames', handleDisplayPlayerNames)
socket.on('notEnoughPlayers', handleNotEnoughtPlayers)
socket.on('updateMultiFoodCount', handleUpdateMultiFoodCount)
socket.on('updateMultiStats', handleUpdateMultiStats);
socket.on('init', handleInit);
socket.on('updatePlayerTwoSettings', handleUpdatePlayerTwoSettings);
socket.on('updateAllYouCanEatTimer', G.handleUpdateAllYouCanEatTimer);
socket.on('updateChosenGameType', handleUpdateChosenGameType);
socket.on('playerLeft', handlePlayerLeft)

socket.on('postMessage', handlePostMessage);


let gameMode = "";
let playerNumber = parseInt(DOM.playerNumber.value); 
let multiStats = {
    playerOne: {wins: 0, losses: 0},
    playerTwo: {wins: 0, losses: 0}
}


document.addEventListener('keydown', multiplayerKeydown);

if(DOM.playerNumber.value === "1") {
    newMultiplayerGame();
    socket.emit('newMultiplayerGame', DOM.nickname.value);
} else if (DOM.playerNumber.value === "2") {
    joinGame();
    const data = {
        code: DOM.gameCode.value,
        playerTwoName: DOM.nickname.value
    }
    socket.emit('joinGame', data);
}

DOM.startGameBtn.addEventListener('click', startGame); 
DOM.playAgainBtn.addEventListener('click', startGame);

function startGame() {
    DOM.startGameBtn.style.display = "none";
    DOM.playAgainBtn.classList.add("button-disabled");
    DOM.playAgainBtn.style.display = "block";
    const gameSettings = {
        mode: gameMode,
        speed: parseInt(DOM.speedInput.value),
        gameType: DOM.currentGameType.innerHTML,
        code: DOM.yourGameCode.innerHTML.split(" ")[2],
        goal: parseInt(DOM.goalInput.value)
    }
    socket.emit('startGame', gameSettings);
}

function multiplayerKeydown(e) {
    const data = {
        keyCode: e.keyCode,
        gameMode: gameMode
    }
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40: 
            e.preventDefault(); 
            socket.emit('keydown', data)
         break; 
         case 13: 
         if(DOM.messageInput === document.activeElement) {
            sendMessage();
         }
        default: break; 
    }
}

function handlePlayerLeft(code) {
    playerNumber = 1;
    DOM.goalSetting.classList.remove("player-2-settings");
    DOM.speedSetting.classList.remove("player-2-settings");
    DOM.startGameBtn.style.display = "block";
    DOM.gameTypeDropdown.style.display = "flex";
    DOM.gameTypeHeader.style.display = "none";
    DOM.yourGameCode.innerHTML = "Game code: " + code;
    socket.emit('switchPlayerNumber')
}




function newMultiplayerGame() {
    DOM.gameTypeHeader.style.display = "none";
    G.init();
    playerNumber = 1;
}

function joinGame() {
    G.init();
    playerNumber = 2;
}

function handleDisplayPlayerOne(name) {
    DOM.player1.innerHTML = name;
}

function handleDisplayPlayerNames(data) {
    DOM.player1.innerHTML = data.playerOne;
    DOM.player2.innerHTML = data.playerTwo;
    if(data.playerTwo === "Awaiting player..."){
        DOM.player2.parentElement.style.backgroundColor = "#a7a7a7";
    } else {
        DOM.player2.parentElement.style.backgroundColor = "#B4DE3E";
    }
}

function handleUpdatePlayerTwoSettings(settings) {
    if(playerNumber === 2) {
        DOM.goalInput.value = settings.goal;
        DOM.speedInput.value = settings.speed;
    }
}

function handleNotEnoughtPlayers(){
    DOM.startGameBtn.style.display = "block";
    DOM.playAgainBtn.style.display = "none";
    DOM.gameMessage.innerHTML = "Not enough players"
    setTimeout(() => {
        DOM.gameMessage.innerHTML = ""
    }, 2000);
}

function handleInit(number) {
    playerNumber = number;
    if(playerNumber === 1) {
        DOM.goalSetting.classList.remove("player-2-settings");
        DOM.speedSetting.classList.remove("player-2-settings");
        DOM.startGameBtn.style.display = "block";
        DOM.gameTypeDropdown.style.display = "flex";
        DOM.gameTypeHeader.style.display = "none";
    } else { 
        DOM.goalSetting.classList.add("player-2-settings");
        DOM.speedSetting.classList.add("player-2-settings");
        DOM.startGameBtn.style.display = "none";
        DOM.gameTypeDropdown.style.display = "none";
        DOM.gameTypeHeader.style.display = "block";
    }
}

function handleUpdateChosenGameType(gameType) {
    DOM.currentGameType.innerHTML = gameType;
}

function handleUpdateMultiFoodCount(data) {
    DOM.playerOneFoodCount.innerHTML = data.playerOne
    DOM.playerTwoFoodCount.innerHTML = data.playerTwo
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
        DOM.wins.innerHTML = multiStats.playerOne.wins
        DOM.losses.innerHTML = multiStats.playerOne.losses
    }
    if(playerNumber === 2) {
        DOM.wins.innerHTML = multiStats.playerTwo.wins
        DOM.losses.innerHTML = multiStats.playerTwo.losses
    }
} 

function handleMultiplayerGameOver(winner) {
    DOM.playAgainBtn.classList.remove("button-disabled");

    if (winner === playerNumber) {
        DOM.gameMessage.innerHTML = "You win!"
    } else {
        DOM.gameMessage.innerHTML = "You lose"
    }
}


function handleGameCode(roomCode) {
    DOM.yourGameCode.innerHTML = `Game code: ${roomCode}`
}

function handleUnknownCode() {
    reset();
}

function handleTooManyPlayers() {
    reset();
    DOM.codeInputMessage.style.opacity = "1";
    DOM.codeInputMessage.innerHTML = "Room is full"
}

function reset() {
    playerNumber = null;
    DOM.gameCode.value = '';
}

















DOM.sendMessageBtn.addEventListener('click', sendMessage)

function sendMessage() {
    const data = {
        message: DOM.messageInput.value,
        author: playerNumber
    }
    if(data.message === "") {return;};
    socket.emit('sendMessage', data);
    DOM.messageInput.value = "";
}

function handlePostMessage(data) {
    const newMessage = document.createElement("div");
    const messageText = document.createElement("p");

    newMessage.classList.add("chat-message");
    messageText.innerHTML = data.message

    newMessage.appendChild(messageText);
    DOM.sentMessagesContainer.appendChild(newMessage);

    DOM.sentMessagesContainer.scrollTop = DOM.sentMessagesContainer.scrollHeight;

    if(data.author === playerNumber){
        newMessage.classList.add("outgoing-message");
    } 
    if(data.author !== playerNumber && data.author !== "server") {
        newMessage.classList.add("incoming-message");
    } 
    if(data.author === "server") {
        newMessage.classList.add("server-message");
    }
}

DOM.gameTypeOptions.forEach(option => {
    option.addEventListener('click', () => {
        if(option.innerHTML === "Pedal to the metal") {
            DOM.speedInput.disabled = true;
            DOM.goalInput.disabled = false;
        } 
        if (option.innerHTML === "All you can eat"){
            DOM.goalInput.disabled = true;
            DOM.speedInput.disabled = false;
        }
        if(option.innerHTML === "Classic" || option.innerHTML === "Live bait") {
            DOM.goalInput.disabled = false;
            DOM.speedInput.disabled = false;
        }
        DOM.gameTypeOptions.forEach( option => {
            option.classList.remove("option-active")
        });
        option.classList.add("option-active") 
        DOM.currentGameType.innerHTML = option.innerHTML;
        const data = {
            gameCode: DOM.yourGameCode.innerHTML.split(" ")[2],
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
