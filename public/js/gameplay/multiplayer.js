import * as DOM from "../domElements.js"
import * as G from "./game.js";

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
socket.on('playerLeft', handlePlayerLeft);
socket.on('displayTyping', handleDisplayTyping);

socket.on('postMessage', handlePostMessage);


let gameMode = "";
let playerNumber = parseInt(DOM.playerNumber.value); 
let multiStats = {
    playerOne: {wins: 0, losses: 0},
    playerTwo: {wins: 0, losses: 0}
}
let mobile = window.screen.width < 993 ? true : false

document.addEventListener('keydown', multiplayerKeydown);
document.addEventListener('keypress', userTyping)

G.init();


if(playerNumber === 1) {
    DOM.gameTypeHeader.style.display = "none";
    socket.emit('newMultiplayerGame', DOM.nickname.value);
} else if (playerNumber === 2) {
    const data = {
        code: DOM.gameCode.value,
        playerTwoName: DOM.nickname.value
    }
    socket.emit('joinGame', data);
}

DOM.startGameBtn.addEventListener('click', startGame); 
DOM.playAgainBtn.addEventListener('click', startGame);

function startGame() {
    if(!mobile) {
        DOM.startGameBtn.style.display = "none";
        DOM.playAgainBtn.classList.add("button-disabled");
        DOM.playAgainBtn.style.display = "block";
    } else {
        DOM.mobileStartGameBtn.innerHTML = "Play again";
    }
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

function userTyping() {
    if(DOM.messageInput === document.activeElement) {
        socket.emit('typing', DOM.nickname.value)
     }
}

function handleDisplayTyping(nickname) {
    DOM.displayTyping.innerHTML = `${nickname} is typing...`
    setTimeout(() => {
        DOM.displayTyping.innerHTML = ""
    }, 3000);
}

function handlePlayerLeft(code) {
    playerNumber = 1;
    DOM.goalSetting.classList.remove("player-2-settings");
    DOM.speedSetting.classList.remove("player-2-settings");
    DOM.startGameBtn.style.display = "block";
    DOM.gameTypeDropdown.style.display = "block";
    DOM.gameTypeHeader.style.display = "none";
    DOM.yourGameCode.innerHTML = "Game code: " + code;
    socket.emit('switchPlayerNumber')
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

function handleInit(playerNumber) {
    if(playerNumber === 1) {
        DOM.goalSetting.classList.remove("player-2-settings");
        DOM.speedSetting.classList.remove("player-2-settings");
        if(!mobile) DOM.startGameBtn.style.display = "block";
        DOM.gameTypeDropdown.style.display = "block";
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
    } 
    if (winner === 2){
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
        DOM.gameMessage.innerHTML = "You<br>win!"
    } else {
        DOM.gameMessage.innerHTML = "You<br>lose"
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
    DOM.messageInput.focus();
}

function handlePostMessage(data) {
    DOM.displayTyping.innerHTML = "";
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

//Mobile //////////////////////////////////////////////////////////

if(mobile) {

    visualViewport.addEventListener('resize', () => {
        DOM.sendMessageDiv.classList.add("keyboardOpen")
        console.log("resized")
    });

    DOM.closeChatBtn.addEventListener('click', () => {
        DOM.gameChat.style.left = "110%";
        DOM.gameChat.style.transform = "translateX(0)";
    });

    DOM.mobileSendMessageBtn.addEventListener('click', sendMessage)

    DOM.mobileStartGameBtn.addEventListener('click', startGame);
    
    DOM.mobileSettingsBtn.addEventListener('click', () => {
        DOM.gameSettings.style.left = "50%";
        DOM.gameSettings.style.transform = "translateX(-50%)";
    });
    DOM.mobileChatBtn.addEventListener('click', () => {
        DOM.gameChat.style.left = "50%";
        DOM.gameChat.style.transform = "translateX(-50%)";
    });
    
    DOM.backArrow.addEventListener('click', () => {
        DOM.gameSettings.style.left = "-110%";
    });
    
    DOM.mobileControlArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            let vel;
            if(arrow.classList.contains("up")){
                vel = getSinglePlayerUpdatedVelocity(38, singlePlayerState);
            }
            if(arrow.classList.contains("down")){
                vel = getSinglePlayerUpdatedVelocity(40, singlePlayerState);
            }
            if(arrow.classList.contains("left")){
                vel = getSinglePlayerUpdatedVelocity(37, singlePlayerState);
            }
            if(arrow.classList.contains("right")){
                vel = getSinglePlayerUpdatedVelocity(39, singlePlayerState);
            }
            singlePlayerState.player.vel = vel;
        });
    });
}

