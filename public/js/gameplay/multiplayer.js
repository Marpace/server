import * as G from "./game.js"
import * as DOM from "../domElements.js"

let playerNumber;
let multiStats = {
    playerOne: {wins: 0, losses: 0},
    playerTwo: {wins: 0, losses: 0}
}


export function newMultiplayerGame() {
    DOM.gameChat.style.display = "flex";
    DOM.lobbyScreen.style.display = "none";
    DOM.gameStatsSinglePlayer.style.display = "none";
    DOM.gameTypeHeader.style.display = "none";
    G.init();
    playerNumber = 1;
}

export function joinGame() {
    if(DOM.joinInput.value === "") {
        DOM.codeInputMessage.style.opacity = "1";
        DOM.codeInputMessage.innerHTML = "Please enter a game code";
        return;
    }
    DOM.gameChat.style.display = "flex";
    DOM.startGameBtn.style.display = "none";
    DOM.gameTypeDropdown.style.display = "none";
    DOM.gameTypeHeader.style.display = "block";
    DOM.gameStatsSinglePlayer.style.display = "none";
    G.init();
    playerNumber = 2;
}

export function handleDisplayPlayerOne(name) {
    DOM.player1.innerHTML = name;
}

export function handleDisplayPlayerNames(data) {
    data = JSON.parse(data);
    DOM.player1.innerHTML = data.playerOne;
    DOM.player2.innerHTML = data.playerTwo;
    DOM.player2.parentElement.style.backgroundColor = "#B4DE3E";
}

export function handleUpdatePlayerTwoSettings(settings) {
    if(playerNumber === 2) {
        DOM.goalInput.value = settings.goal;
        DOM.speedInput.value = settings.speed;
    }
}

export function handleNotEnoughtPlayers(){
    DOM.startGameBtn.style.display = "block";
    DOM.playAgainBtn.style.display = "none";
    DOM.gameMessage.innerHTML = "Not enough players"
    setTimeout(() => {
        DOM.gameMessage.innerHTML = ""
    }, 2000);
}

export function handleInit(number) {
    playerNumber = number;
    if(playerNumber === 2) {
        DOM.goalSetting.classList.add("player-2-settings")
        DOM.speedSetting.classList.add("player-2-settings")

    }
    DOM.gameScreen.style.display = "flex";
    DOM.multiplayerScreen.style.display = "none";
}

export function handleUpdateChosenGameType(gameType) {
    DOM.currentGameType.innerHTML = gameType;
}

export function handleUpdateMultiFoodCount(data) {
    DOM.playerOneFoodCount.innerHTML = data.playerOne
    DOM.playerTwoFoodCount.innerHTML = data.playerTwo
}

export function handleUpdateMultiStats(winner) {

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

export function handleMultiplayerGameOver(winner) {
    DOM.playAgainBtn.classList.remove("button-disabled");

    if (winner === playerNumber) {
        DOM.gameMessage.innerHTML = "You win!"
    } else {
        DOM.gameMessage.innerHTML = "You lose"
    }
}

export function handleGameCode(roomCode) {
    DOM.yourGameCode.innerHTML = `Game code: ${roomCode}`
}

export function handleUnknownCode() {
    reset();
    DOM.codeInputMessage.style.opacity = "1";
    DOM.codeInputMessage.innerHTML = "Unknown game code"
}

export function handleTooManyPlayers() {
    reset();
    DOM.codeInputMessage.style.opacity = "1";
    DOM.codeInputMessage.innerHTML = "Room is full"
}

function reset() {
    playerNumber = null;
    DOM.joinInput.value = '';
    DOM.gameScreen.style.display = "none";
    DOM.multiplayerScreen.style.display = "flex";
}