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
export const playerNumber = qs("#player-number");
export const nickname = qs("#nickname");
export const gameCode = qs("#game-code");

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
export const gamesPlayed = qs("#games-played")


//game chat 
export const gameChat = qs(".game-chat");
export const messageInput = qs("#compose-message");
export const sendMessageBtn = qs("#send-message-btn");
export const sentMessagesContainer = qs("#sent-messages");
export const displayTyping = qs(".typing");
export const gifBtn = qs(".gif-icon");
export const gifSearchInput = qs(".gif-search-input");
export const gifDisplay = qs(".gif-display");
export const gifImages = Array.from(qsa(".gif-img"));

// mobile 
export const mobileSettingsBtn = qs(".settings-icon");
export const mobileChatBtn = qs(".chat-icon");
export const gameSettings = qs("#game-settings");
export const backArrow = qs(".back-arrow");
export const mobileControlArrows = Array.from(qsa(".mobile-controls__arrow"));
export const mobileStartGameBtn = qs("#mobile-start-game-btn");
export const mobilePlayAgainBtn = qs("#mobile-play-again-btn");
export const closeChatBtn = qs(".close-chat")
export const mobileSendMessageBtn = qs("#mobile-send-message-btn");
export const sendMessageDiv = qs("#send-message");
export const alert = qs(".alert");
export const alertMessage = qs(".alert-message");
