const { GRID_SIZE } = require("./vars")
module.exports = {
   initMultiplayerGame,
   multiplayerGameLoop,
   getMultiplayerUpdatedVelocity
  }

  function initMultiplayerGame() {
    const state = createMultiplayerGameState()
    randomFood(state);
    return state;
  }
  
  function createMultiplayerGameState() {
    return {
      players: [{
        pos: {
          x: 6,
          y: 15,
        },
        vel: {
          x: 1,
          y: 0,
        },
        snake: [
          {x: 4, y: 15},
          {x: 5, y: 15},
          {x: 6, y: 15},
        ],
      }, {
        pos: {
          x: 21,
          y: 15,
        },
        vel: {
          x: -1,
          y: 0,
        },
        snake: [
          {x: 23, y: 15},
          {x: 22, y: 15},
          {x: 21, y: 15},
        ],
      }],
      food: {},
      gridSize: GRID_SIZE,
    };
  }


  function multiplayerGameLoop(state) {
    if (!state) {
      return;
    }
  
    const playerOne = state.players[0];
    const playerTwo = state.players[1];
  
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
  
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
  
    //if players go out of bounds 
    if (playerOne.pos.x < 0 || playerOne.pos.x >= GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y >= GRID_SIZE) {
      return {winner: 2, foodEaten: false};
    }
  
    if (playerTwo.pos.x < 0 || playerTwo.pos.x >= GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y >= GRID_SIZE) {
      return {winner: 1, foodEaten: false};
    }
  
    
    //move snakes and check if they crash into them selves
    if (playerOne.vel.x || playerOne.vel.y) {
      for (let cell of playerOne.snake) {
        if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
          return {winner: 2, foodEaten: false};
        }
      }
      playerOne.snake.push({ ...playerOne.pos });
      playerOne.snake.shift();
    }
  
    if (playerTwo.vel.x || playerTwo.vel.y) {
      for (let cell of playerTwo.snake) {
        if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
          return {winner: 1, foodEaten: false};
        }
      }
      playerTwo.snake.push({ ...playerTwo.pos });
      playerTwo.snake.shift();
    }
    
    //if players eat a piece of food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
      playerOne.snake.splice(0, 0, playerOne.snake[0]);
      randomFood(state);
      return {winner: false, foodEaten: 1};
    }
  
    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
      playerTwo.snake.splice(0, 0, playerTwo.snake[0]);
      randomFood(state);
      return {winner: false, foodEaten: 2};
    }
    return {winner: false, foodEaten: false};
  }


  function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}
  function getMultiplayerUpdatedVelocity(keyCode, state, x) {
    switch (keyCode) {
      case 37: { // left
        if(state.players[x].vel.x === 1) {
          return { x: 1, y: 0 };
        } else {
          return { x: -1, y: 0 };
        }
      }
      case 38: { // down
        if(state.players[x].vel.y === 1) {
          return { x: 0, y: 1 };
        } else {
          return { x: 0, y: -1 };
        }
      }
      case 39: { // right
        if(state.players[x].vel.x === -1) {
          return { x: -1, y: 0 };
        } else {
          return { x: 1, y: 0 };
        }
      }
      case 40: { // up
        if(state.players[x].vel.y === -1) {
          return { x: 0, y: -1 };
        } else {
          return { x: 0, y: 1 };
        }
      }
    }
  }