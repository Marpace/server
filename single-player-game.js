const { GRID_SIZE } = require("./vars")

function createSinglePlayerState(gameType) {
    const player = {
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
    }
    let food; 
    switch (gameType) {
        case "Classic": case "Pedal to the metal":
            food =   {
                pos: {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                }
            }
            break;
        case "Live bait": 
            food = {
                pos: {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE)
                }, 
                vel: {
                    x: 0,
                    y: 0
                }
            }
            break;
            case "All you can eat":
                food = generateFoodPieces(100);
                break;
        default:
        break;
    }
    return {
        player: player,
        food: food,
        gridSize: GRID_SIZE,
        gameType: gameType
    }
};


function singlePlayerGameLoop(state) {
    if (!state) {
        return;
    }
    const result = {
        winner: false,
        foodEaten: false
    }

    const player = state.player;
    const food = state.food;

    player.pos.x += player.vel.x;
    player.pos.y += player.vel.y;

    if(state.gameType === "Live bait") {
        food.pos.x += food.vel.x
        food.pos.y += food.vel.y

        const randomVel = Math.floor(Math.random() * 3);
        if(randomVel === 1) {
            food.vel = {
                x: Math.floor(Math.random() * 3) - 1,
                y: 0
            }
        }
        if(randomVel === 2) {
            food.vel = {
                x: 0,
                y: Math.floor(Math.random() * 3) - 1
            }
        }
    
        if(food.pos.x < 0 ) food.pos.x++
        if(food.pos.x >= GRID_SIZE) food.pos.x--
        if(food.pos.y < 0 ) food.pos.y++
        if(food.pos.y >= GRID_SIZE) food.pos.y--
    }


    if (player.pos.x < 0 || player.pos.x >= GRID_SIZE || player.pos.y < 0 || player.pos.y >= GRID_SIZE) {
        result.winner = true ;
        result.foodEaten = false;
    }

    if (player.vel.x || player.vel.y) {
        for (let cell of player.snake) {
            if (cell.x === player.pos.x && cell.y === player.pos.y) {
                result.winner = true ;
                result.foodEaten = false;
            }
        }
        player.snake.push({ ...player.pos }); 
        player.snake.shift();
    } 

    if(state.gameType === "All you can eat") {
        food.forEach(piece => {
            if (piece.x === player.pos.x && piece.y === player.pos.y) {
                food.splice(food.indexOf(piece), 1)
                player.snake.splice(0, 0, player.snake[0]);
                result.foodEaten = true
            }
        });
        
    } else {
        if (food.pos.x === player.pos.x && food.pos.y === player.pos.y) {
            player.snake.splice(0, 0, player.snake[0]);
            randomFood(state);
            result.foodEaten = true
        }
    }

    console.log(result)
    return result;
}

function randomFood(state) {

    let food; 

    if(state.gameType === "Classic" || 
        state.gameType === "Pedal to the metal"){
        food = {
            pos: {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            }
        }
    }
    if(state.gameType === "Live bait") {
        food = {
            pos: {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            }, 
            vel: {
                x: 0,
                y: 0
            }
        }
    }

    for (let cell of state.player.snake) {
        if (cell.x === food.pos.x && cell.y === food.pos.y) {
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
    }
}

function generateFoodPieces(amount) {
    const pieces = [];
    for(let i=0; i < amount; i++) {
        pieces.push({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        })
    }
    return pieces;
}

module.exports = {
    createSinglePlayerState,
    singlePlayerGameLoop,
    getSinglePlayerUpdatedVelocity
}
