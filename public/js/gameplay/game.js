import * as DOM from "../domElements.js"

let canvas, ctx;
const GRID_COLOUR = '#151201';
const SNAKE_1_COLOUR = '#88F1D2';
const SNAKE_2_COLOUR = '#FFEF5C';
const FOOD_COLOUR = '#e66916';
let mobile = window.screen.width < 993 ? true : false;

export function handleCountdown(mobile) {
    let countdownTimer = 500;
    const countdown = [3, 2, 1, 0];
    DOM.countdownDisplay.innerHTML = "";
    DOM.countdownDisplay.style.fontFamily = "'Bungee Shade', sans-serif"
    DOM.countdownDisplay.style.fontSize = "6.5rem"
    if(mobile) DOM.countdownDisplay.style.fontSize = "4rem"
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
    if(mobile) {
        DOM.countdownDisplay.style.left = "100px";
    }
    DOM.countdownDisplay.style.top = "calc(100% - 30px)",
    DOM.countdownDisplay.style.fontSize = "1.5rem";
    DOM.countdownDisplay.style.fontFamily = "'Bungee', sans-serif";
    DOM.countdownDisplay.innerHTML = seconds;
}

export function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    const canvasSize = parseInt(getComputedStyle(canvas).width.replace(/[px]/g, ""))

    canvas.width = canvas.height = canvasSize;
    
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
