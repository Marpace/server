const qs = (el) => {return document.querySelector(el)}
const qsa = (el) => {return document.querySelectorAll(el)}


//buttons
export const multiplayerBtn = qs("#multiplayer-btn");
export const singlePlayerBtn = qs("#single-player-btn");
export const createGameBtn = qs("#create-game-btn");
export const joinGameBtn = qs("#join-game-btn");
export const startGameBtn = qs("#start-game-btn");
export const backBtn = qs("#back-btn");
export const playAgainBtn = qs("#play-again-btn");
export const enterNicknameDiv = qs("#enter-nickname");
export const continueBtn = qs("#continue-btn");

//inputs
export const joinInput = qs("#join-input");
export const nicknameInput = qs("#nickname-input");
export const goalInput = qs("#goal-input");
export const speedInput = qs("#speed-input");

//screens
export const gameScreen = qs("#game-screen");
export const gameOptions = qs("#game-options");
export const multiplayerScreen = qs("#multiplayer");
export const lobbyScreen = qs("#lobby-screen");
export const header = qs(".header");

//message displays
export const gameMessage = qs("#game-message");
export const yourGameCode = qs("#your-game-code");
export const countdownDisplay = qs("#countdown");
export const codeInputMessage = qs("#code-input-message");
export const nicknameMessage = qs("#nickname-message");
export const welcomeMessage = qs("#welcome-message");

//game aside 
export const player1 = qs("#player-1");
export const player2 = qs("#player-2");
export const currentPlayers = qs("#current-players");
export const gameStatsMultiplayer = qs("#game-stats-multiplayer");
export const gameStatsSinglePlayer = qs("#game-stats-single-player");
export const foodCount = qs("#food-count");
export const highscore = qs("#highscore");
export const goalSetting = qs("#goal-setting");
export const speedSetting = qs("#speed-setting");
export const playerOneFoodCount = qs("#player-one-food-count");
export const playerTwoFoodCount = qs("#player-two-food-count");
export const wins = qs("#wins");
export const losses = qs("#losses");
export const gameTypeOptions = qsa(".game-type__option")
export const currentGameType = qs(".current-game-type")
export const gameTypeDropdown = qs("#game-type-dropdown")
export const gameTypeHeader = qs("#game-type-header")


//game chat 
export const gameChat = qs("#game-chat");
export const messageInput = qs("#compose-message");
export const sendMessageBtn = qs("#send-message-btn");
export const sentMessagesContainer = qs("#sent-messages");
