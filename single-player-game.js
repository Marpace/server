const { GRID_SIZE } = require("./vars")

function createSinglePlayerState() {
    return{
        player: {
            pos: {
            x: 3,
            y: 10,
            },
            vel: {
            x: 1,
            y: 0,
            },
            snake: [
            {x: 1, y: 10},
            {x: 2, y: 10},
            {x: 3, y: 10},
            ],
        }, 
        food: {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        },
        gridSize: GRID_SIZE,
    }
};


function singlePlayerGameLoop(state) {
    if (!state) {
        return;
    }

    const player = state.player;

    player.pos.x += player.vel.x;
    player.pos.y += player.vel.y;

    if (player.pos.x < 0 || player.pos.x >= GRID_SIZE || player.pos.y < 0 || player.pos.y >= GRID_SIZE) {
        return {winner: true, foodEaten: false};
    }

    if (player.vel.x || player.vel.y) {
        for (let cell of player.snake) {
            if (cell.x === player.pos.x && cell.y === player.pos.y) {
                return {winner: true, foodEaten: false};
            }
        }
        player.snake.push({ ...player.pos });
        player.snake.shift();
    } 

    if (state.food.x === player.pos.x && state.food.y === player.pos.y) {
        player.snake.splice(0, 0, player.snake[0]);
        randomFood(state);
        return {winner: false, foodEaten: true};
    }
    return {winner: false, foodEaten: false};
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    for (let cell of state.player.snake) {
        if (cell.x === food.x && cell.y === food.y) {
        return randomFood(state);
        }
    }
    state.food = food;
}


function getSinglePlayerUpdatedVelocity(keyCode, state) {
    switch (keyCode) {
        case 37: { // left
            if(state.player.vel.x === 1 ){
                return { x: 1, y: 0 };
            } else {
                return { x: -1, y: 0 };
            }
        }
        case 38: { // up
            if(state.player.vel.y === 1 ) {
                return { x: 0, y: 1 };
            } else {
                return { x: 0, y: -1 };
            }
        }
        case 39: { // right
            if(state.player.vel.x === -1) {
                return { x: -1, y: 0 };
            } else {
                return { x: 1, y: 0 };
            }
        }
        case 40: { // down
            if(state.player.vel.y === -1) {
                return { x: 0, y: -1 };
            } else {
                return { x: 0, y: 1 };
            }
        }
        changingDirection = false;
    }
}

module.exports = {
createSinglePlayerState,
singlePlayerGameLoop,
getSinglePlayerUpdatedVelocity
}
