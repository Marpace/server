const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}

import * as DOM from "./domElements.js"
import * as G from "./gameplay/game.js";
import * as SP from "./gameplay/singlePlayer.js"
import * as MP from "./gameplay/multiplayer.js"


const socket = io('https://snake-race.herokuapp.com');
// const socket = io('http://localhost:3000');

socket.on('countdown', G.handleCountdown);

//single player
socket.on('singlePlayerGameState', G.handleGameState);
socket.on('singlePlayerGameOver', SP.handleSinglePlayerGameOver);
socket.on('updateSingleFoodCount', SP.handleUpdateSingleFoodCount)

//multiplayer
socket.on('multiplayerGameState', G.handleGameState);
socket.on('multiplayerGameOver', MP.handleMultiplayerGameOver);
socket.on('gameCode', MP.handleGameCode);
socket.on('unknownCode', MP.handleUnknownCode);
socket.on('tooManyPlayers', MP.handleTooManyPlayers);
socket.on('displayPlayerOne', MP.handleDisplayPlayerOne)
socket.on('displayPlayerNames', MP.handleDisplayPlayerNames)
socket.on('notEnoughPlayers', MP.handleNotEnoughtPlayers)
socket.on('updateMultiFoodCount', MP.handleUpdateMultiFoodCount)
socket.on('updateMultiStats', MP.handleUpdateMultiStats);
socket.on('init', MP.handleInit);
socket.on('updatePlayerTwoSettings', MP.handleUpdatePlayerTwoSettings);
socket.on('updateAllYouCanEatTimer', G.handleUpdateAllYouCanEatTimer);
socket.on('updateChosenGameType', MP.handleUpdateChosenGameType)

//chat 
socket.on('postMessage', handlePostMessage);

let countdownTimer = 1000;  

let gameMode = "";
let playerNumber; 
let gameCode;

DOM.multiplayerBtn.addEventListener("click", function() {
    DOM.enterNicknameDiv.classList.toggle("visible");
})

DOM.continueBtn.addEventListener('click', function(){
    if(DOM.nicknameInput.value === "") {
        DOM.nicknameMessage.style.opacity = "1";
        DOM.nicknameMessage.innerHTML = "Please enter a nickname"
    } else if(DOM.nicknameInput.value.length > 10) {
        DOM.nicknameMessage.style.opacity = "1";
        DOM.nicknameMessage.innerHTML = "Nickname must be shorter than 10 characters"
    } else {
        DOM.multiplayerScreen.style.display = "flex";
        DOM.gameOptions.style.display = "none";
        DOM.welcomeMessage.innerHTML = `Welcome ${DOM.nicknameInput.value}`
    }
    gameMode = "multiplayer"
});

DOM.backBtn.addEventListener("click", function(){
    multiplayerScreen.style.display = "none";
    gameOptions.style.display = "flex";
});

DOM.singlePlayerBtn.addEventListener('click', () => {
    document.addEventListener('keydown', keydown);
    SP.newSinglePlayerGame();
    gameMode = "singlePlayer";
});
DOM.createGameBtn.addEventListener('click', () => {
    document.addEventListener('keydown', keydown);
    playerNumber = 1;
    MP.newMultiplayerGame();
    socket.emit('newMultiplayerGame', DOM.nicknameInput.value);
});
DOM.joinGameBtn.addEventListener('click', () => {
    document.addEventListener('keydown', keydown);
    playerNumber = 2;
    MP.joinGame();
    const data = {
        code: DOM.joinInput.value,
        playerTwoName: DOM.nicknameInput.value
    }
    socket.emit('joinGame', JSON.stringify(data));
});
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
        code: playerNumber === 1 ? DOM.yourGameCode.innerHTML.split(" ")[2] : DOM.joinInput.value,
        goal: parseInt(DOM.goalInput.value)
    }
    socket.emit('startGame', gameSettings);
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
         if(DOM.messageInput === document.activeElement) {
            sendMessage();
         }
        default: break; 
    }
}

// function handleCountdown() {
//     const countdown = [3, 2, 1, 0];
//     DOM.countdownDisplay.innerHTML = "";
//     DOM.countdownDisplay.style.top = "50%",
//     DOM.countdownDisplay.style.fontSize = "6.5rem"
//     DOM.countdownDisplay.style.fontFamily = "'Bungee Shade', sans-serif"
//     for(let number of countdown) {  
//         setTimeout(() => {
//             if(number === 0 ){
//                 DOM.countdownDisplay.innerHTML = "";
//             } else {
//                 DOM.countdownDisplay.innerHTML = number
//             }
//         }, countdownTimer);
//         countdownTimer += 1000;
//     }
// }






// single player functions /////////////////////////////////////////

// function handleUpdateSingleFoodCount(data) {
//     DOM.foodCount.innerHTML = data;
// }

// function handleSinglePlayerGameOver(score) {
//     let highscoreValue = parseInt(DOM.highscore.innerHTML);
//     if(score > highscoreValue) {
//         DOM.highscore.innerHTML = score;
//     }
//     DOM.playAgainBtn.classList.remove("button-disabled");
//     DOM.gameMessage.innerHTML = "Game<br>Over";
//   }
// multiplayer functions /////////////////////////////////////////

// function handleDisplayPlayerOne(name) {
//     DOM.player1.innerHTML = name;
// }
// function handleDisplayPlayerNames(data) {
//     data = JSON.parse(data);
//     DOM.player1.innerHTML = data.playerOne;
//     DOM.player2.innerHTML = data.playerTwo;
//     DOM.player2.parentElement.style.backgroundColor = "#B4DE3E";
// }

// function handleUpdatePlayerTwoSettings(settings) {
//     if(playerNumber === 2) {
//         DOM.goalInput.value = settings.goal;
//         DOM.speedInput.value = settings.speed;
//     }
// }

// function handleNotEnoughtPlayers(){
//     DOM.startGameBtn.style.display = "block";
//     DOM.playAgainBtn.style.display = "none";
//     DOM.gameMessage.innerHTML = "Not enough players"
//     setTimeout(() => {
//         DOM.gameMessage.innerHTML = ""
//     }, 2000);
// }

// function handleInit(number) {
//     playerNumber = number;
//     if(playerNumber === 2) {
//         DOM.goalSetting.classList.add("player-2-settings")
//         DOM.speedSetting.classList.add("player-2-settings")

//     }
//     DOM.gameScreen.style.display = "flex";
//     DOM.multiplayerScreen.style.display = "none";
// }

// function handleUpdateChosenGameType(gameType) {
//     DOM.currentGameType.innerHTML = gameType;
// }

// function handleUpdateMultiFoodCount(data) {
//     DOM.playerOneFoodCount.innerHTML = data.playerOne
//     DOM.playerTwoFoodCount.innerHTML = data.playerTwo
// }

// function handleUpdateMultiStats(winner) {

//     if(winner === 1) {
//         multiStats.playerOne.wins++ 
//         multiStats.playerTwo.losses++ 
//     } else {
//         multiStats.playerOne.losses++ 
//         multiStats.playerTwo.wins++ 
//     }
//     if(playerNumber === 1) {
//         DOM.wins.innerHTML = multiStats.playerOne.wins
//         DOM.losses.innerHTML = multiStats.playerOne.losses
//     }
//     if(playerNumber === 2) {
//         DOM.wins.innerHTML = multiStats.playerTwo.wins
//         DOM.losses.innerHTML = multiStats.playerTwo.losses
//     }
// } 

// function handleMultiplayerGameOver(winner) {
//     DOM.playAgainBtn.classList.remove("button-disabled");
//     countdownTimer = 1000;

//     if (winner === playerNumber) {
//         DOM.gameMessage.innerHTML = "You win!"
//     } else {
//         DOM.gameMessage.innerHTML = "You lose"
//     }
// }

// function handleGameCode(roomCode) {
//     gameCode = roomCode;
//     DOM.yourGameCode.innerHTML = `Game code: ${roomCode}`
// }

// function handleUnknownCode() {
//     reset();
//     DOM.codeInputMessage.style.opacity = "1";
//     DOM.codeInputMessage.innerHTML = "Unknown game code"
// }

// function handleTooManyPlayers() {
//     reset();
//     DOM.codeInputMessage.style.opacity = "1";
//     DOM.codeInputMessage.innerHTML = "Room is full"
// }

// function reset() {
//     playerNumber = null;
//     DOM.joinInput.value = '';
//     DOM.gameScreen.style.display = "none";
//     DOM.multiplayerScreen.style.display = "flex";
// }

// function handleReset() {
//     DOM.gameMessage.innerHTML = "";
//     countdownTimer = 1000;
// }


DOM.sendMessageBtn.addEventListener('click', sendMessage)

function sendMessage() {
    const data = {
        message: DOM.messageInput.value,
        author: playerNumber
    }
    if(data.message === "") {return;}
    socket.emit('sendMessage', data)
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
    } else {
        newMessage.classList.add("incoming-message");
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
