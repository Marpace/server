import * as G from "./game.js"
import * as DOM from "../domElements.js"

const GRID_SIZE = 30;
let FRAME_RATE;
let singlePlayerState;
let singlePlayerFoodCount = 0;
let allYouCanEatSeconds = 60;

    G.init();

    DOM.startGameBtn.addEventListener('click', () => {
        const gameType = DOM.currentGameType.innerHTML;
        const speed = parseInt(DOM.speedInput.value);
        handleStartGame(gameType, speed);
    });
     
    DOM.playAgainBtn.addEventListener('click', () => {
        const gameType = DOM.currentGameType.innerHTML;
        const speed = parseInt(DOM.speedInput.value);
        handleStartGame(gameType, speed);
    });

    DOM.gameTypeOptions.forEach(option => {
        option.addEventListener('click', () => {
            if(option.innerHTML === "Pedal to the metal") {
                DOM.speedInput.disabled = true;
            } 
            if (option.innerHTML === "All you can eat"){
                DOM.speedInput.disabled = false;
            }
            if(option.innerHTML === "Classic" || option.innerHTML === "Live bait") {
                DOM.speedInput.disabled = false;
            }
            DOM.gameTypeOptions.forEach( option => {
                option.classList.remove("option-active")
            });
            option.classList.add("option-active") 
            DOM.currentGameType.innerHTML = option.innerHTML;
        })
    });


    function handleStartGame(gameType, speed){
        setTimeout(() => {
            if(gameType === "Pedal to the metal") {
                startSinglePlayerGameTimeout(singlePlayerState);
            } else {
                startSinglePlayerGameInterval(singlePlayerState);
            }
        }, 4000);
        if(gameType === "Pedal to the metal"){
            FRAME_RATE = 5;
        } else {
            FRAME_RATE = speed + 6;
        }
        DOM.startGameBtn.style.display = "none";
        DOM.playAgainBtn.classList.add("button-disabled");
        DOM.playAgainBtn.style.display = "block";
        DOM.foodCount.innerHTML = singlePlayerFoodCount;
        document.addEventListener('keydown', singlePlayerKeydown);
        singlePlayerState = createSinglePlayerState(gameType);
        G.handleCountdown();
    }

    function singlePlayerKeydown(e) {
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: 
                e.preventDefault(); 
                const vel = getSinglePlayerUpdatedVelocity(e.keyCode, singlePlayerState);
                if(vel) singlePlayerState.player.vel = vel;
            break; 
            default: break; 
        }
    }

     function startSinglePlayerGameTimeout(state) {
        setTimeout(() => {
        const result = singlePlayerGameLoop(state);
        if(!result.winner) {
            G.handleGameState(state);
            if(result.foodEaten) {
            singlePlayerFoodCount++;
            FRAME_RATE++;
            DOM.foodCount.innerHTML = singlePlayerFoodCount;
            }
            startSinglePlayerGameTimeout(state);
        } else {
            handleSinglePlayerGameOver(singlePlayerFoodCount)
            singlePlayerFoodCount = 0;
        }
        }, 1000 / FRAME_RATE);
    }

    function startSinglePlayerGameInterval(state) {
        let timerIntervalId;
        if(state.gameType === "All you can eat") {
        timerIntervalId = setInterval(() => {
            G.handleUpdateAllYouCanEatTimer(allYouCanEatSeconds);
            allYouCanEatSeconds--
            if(allYouCanEatSeconds < 0 ){
                clearInterval(timerIntervalId)
                handleSinglePlayerGameOver(singlePlayerFoodCount);
                clearInterval(gameIntervalId);
                singlePlayerFoodCount = 0;
                allYouCanEatSeconds = 60;
            } 
        }, 1000);
        }
        const gameIntervalId = setInterval(() => {
        const result = singlePlayerGameLoop(state);
        if(!result.winner) {
            G.handleGameState(state);
            if(result.foodEaten) {
            singlePlayerFoodCount++;
            if (state.gameType === "Pedal to the metal") {
                FRAME_RATE++;
            }
            DOM.foodCount.innerHTML = singlePlayerFoodCount;
            }
        } else if(result.winner) {
            if(state.gameType === "All you can eat") clearInterval(timerIntervalId);
            handleSinglePlayerGameOver(singlePlayerFoodCount);
            clearInterval(gameIntervalId);
            singlePlayerFoodCount = 0;
            allYouCanEatSeconds = 60;
        }
        }, 1000 / FRAME_RATE);
    }

    function handleSinglePlayerGameOver(score) {
        let highscoreValue = parseInt(DOM.highscore.innerHTML);
        if(score > highscoreValue) {
            DOM.highscore.innerHTML = score;
        }
        DOM.playAgainBtn.classList.remove("button-disabled");
        DOM.gameMessage.innerHTML = "Game<br>Over";
    }

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
            gameMode: "singlePlayer",
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
