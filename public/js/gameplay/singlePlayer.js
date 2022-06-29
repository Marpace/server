import * as G from "./game.js"
import * as DOM from "../domElements.js"

export function newSinglePlayerGame() {
    if(window.screen.width < 416) DOM.header.style.fontSize = "2rem";
    DOM.gameScreen.style.display = "flex";
    DOM.gameTypeHeader.style.display = "none"
    DOM.gameChat.style.display = "none";
    DOM.gameOptions.style.display = "none";
    DOM.currentPlayers.style.display = "none";
    DOM.gameStatsMultiplayer.style.display = "none";
    DOM.goalSetting.style.display = "none";
    G.init();
} 

export function handleUpdateSingleFoodCount(data) {
    DOM.foodCount.innerHTML = data;
}

export function handleSinglePlayerGameOver(score) {
    let highscoreValue = parseInt(DOM.highscore.innerHTML);
    if(score > highscoreValue) {
        DOM.highscore.innerHTML = score;
    }
    DOM.playAgainBtn.classList.remove("button-disabled");
    DOM.gameMessage.innerHTML = "Game<br>Over";
  }

