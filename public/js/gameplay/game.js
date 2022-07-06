import * as DOM from "../domElements.js"

let canvas, ctx;
const GRID_COLOUR = '#151201';
const SNAKE_1_COLOUR = '#88F1D2';
const SNAKE_2_COLOUR = '#FFEF5C';
const FOOD_COLOUR = '#e66916';

export function handleCountdown() {
    let countdownTimer = 500;
    const countdown = [3, 2, 1, 0];
    DOM.countdownDisplay.innerHTML = "";
    DOM.countdownDisplay.style.top = "50%",
    DOM.countdownDisplay.style.fontSize = "6.5rem"
    DOM.countdownDisplay.style.fontFamily = "'Bungee Shade', sans-serif"
    DOM.gameMessage.innerHTML = ""
    for(let number of countdown) {  
        setTimeout(() => {
            if(number === 0 ){
                DOM.countdownDisplay.innerHTML = "";
            } else {
                DOM.countdownDisplay.innerHTML = number
            }
        }, countdownTimer);
        countdownTimer += 1000;
    }
}

export function handleGameState(gameState) {
    requestAnimationFrame(() => paintGame(gameState));
}

export function handleUpdateAllYouCanEatTimer(seconds) {
    DOM.countdownDisplay.style.top = "-30px",
    DOM.countdownDisplay.style.fontSize = "1.5rem"
    DOM.countdownDisplay.style.fontFamily = "'Bungee', sans-serif"
    DOM.countdownDisplay.innerHTML = seconds
}

export function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    if(window.screen.width < window.screen.height){
        canvas.width = canvas.height = (window.screen.width / 100 ) * 90;
    } else {
        canvas.width = canvas.height = (window.screen.height / 100) * 70;
    }
    ctx.fillStyle = GRID_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function paintGame(state) {

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

    if(state.gameMode === "singlePlayer"){
        paintPlayer(state.player, size, SNAKE_1_COLOUR);
    }
    if(state.gameMode === "multiplayer") {
        paintPlayer(state.players[0], size, SNAKE_1_COLOUR);
        paintPlayer(state.players[1], size, SNAKE_2_COLOUR);
    }
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}
