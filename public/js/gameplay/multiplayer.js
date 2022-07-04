import * as G from "./game.js"
import * as DOM from "../domElements.js"

let playerNumber;
let multiStats = {
    playerOne: {wins: 0, losses: 0},
    playerTwo: {wins: 0, losses: 0}
}


export function newMultiplayerGame() {
    DOM.gameTypeHeader.style.display = "none";
    G.init();
    playerNumber = 1;
}

export function joinGame() {
    G.init();
    playerNumber = 2;
}

export function handleDisplayPlayerOne(name) {
    DOM.player1.innerHTML = name;
}

export function handleDisplayPlayerNames(data) {
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
}

export function handleTooManyPlayers() {
    reset();
    DOM.codeInputMessage.style.opacity = "1";
    DOM.codeInputMessage.innerHTML = "Room is full"
}

function reset() {
    playerNumber = null;
    DOM.gameCode.value = '';
}