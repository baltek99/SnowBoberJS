const canvas = document.getElementById('canv');
const ctx = canvas.getContext('2d');

// CONST VARIABLES
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;

const JUMP_FROM_GROUND_Y = 400;
const JUMP_FROM_RAIL_Y = 370;
const IDLE_RIDE_Y = 420;
const SLIDING_ON_RAIL_Y = 370;
const BOBER_DEFAULT_POSITION_X = 150;
const BOBER_DEFAULT_POSITION_Y = 420;
const BOBER_CROUCH_POSITION_Y = 470;
const RAIL_AND_BOBER_DIFFERENCE = 300;
const BOBER_MIN_X = 0;
const BOBER_MAX_X = CANVAS_WIDTH - 200;

const NUMBER_OF_FRAMES_TO_INCREMENT = 1000;

const BOBER_DEFAULT_WIDTH = 215;
const BOBER_DEFAULT_HEIGHT = 255;
const BOBER_ON_RAIL_WIDTH = 215;
const BOBER_ON_RAIL_HEIGHT = 255;
const BOBER_IN_JUMP_WIDTH = 215;
const BOBER_IN_JUMP_HEIGHT = 185;
const BOBER_CROUCH_WIDTH = 270;
const BOBER_CROUCH_HEIGHT = 160;

const BOX_WIDTH = 75;
const BOX_HEIGHT = 75;
const RAIL_WIDTH = 500;
const RAIL_HEIGHT = 90;
const GRID_WIDTH = 220;
const GRID_HEIGHT = 340;
const SCORE_WIDTH = 1;
const SCORE_HEIGHT = CANVAS_HEIGHT;
const HEART_WIDTH = 60;
const HEART_HEIGHT = 60;

const OBSTACLE_SPAWN_X = CANVAS_WIDTH + RAIL_WIDTH / 2;

const HEART_POSITION_Y = 80;
const HEART_POSITION_X_1 = CANVAS_WIDTH - 350;
const HEART_POSITION_X_2 = CANVAS_WIDTH - 260;
const HEART_POSITION_X_3 = CANVAS_WIDTH - 170;

const GRID_POSITION_Y = 345;
const RAIL_POSITION_Y = 535;
const BOX_POSITION_Y = 545;

const SCORE_POSITION_X = CANVAS_WIDTH - 300;
const SCORE_POSITION_Y = CANVAS_HEIGHT - 80;

const RESULT_POSITION_X = 600;
const RESULT_POSITION_Y = 650;

// TEXTURES SECTION
const backgroundTexture = new Image();
backgroundTexture.src = 'assets/background.jpg';
const startTexture = new Image();
startTexture.src = 'assets/start.jpg';
const gameOverTexture = new Image();
gameOverTexture.src = 'assets/game-over.jpg';
const highScoresTexture = new Image();
highScoresTexture.src = 'assets/high-scores.jpg';
const boberStandTexture = new Image();
boberStandTexture.src = 'assets/bober-stand.png';
const boberCrouchTexture = new Image();
boberCrouchTexture.src = 'assets/bober-luzny.png';
const boberJumpTexture = new Image();
boberJumpTexture.src = 'assets/bober-jump.png';
const boberFlipTexture = new Image();
boberFlipTexture.src = 'assets/bober-flip.png';
const boberSlideTexture = new Image();
boberSlideTexture.src = 'assets/bober-rail.png';
const boxTexture = new Image();
boxTexture.src = 'assets/box.png';
const railTexture = new Image();
railTexture.src = 'assets/rail.png';
const pipeTexture = new Image();
pipeTexture.src = 'assets/grubas.png';
const gridTexture = new Image();
gridTexture.src = 'assets/grid.png';
const gridStickTexture = new Image();
gridStickTexture.src = 'assets/grid-stick.png';
const heartTexture = new Image();
heartTexture.src = 'assets/heart.png';
const boxBrokenTexture = new Image();
boxBrokenTexture.src = 'assets/box-broken.png';
const gridBrokenTexture = new Image();
gridBrokenTexture.src = 'assets/grid-broken.png';

// ENUM SECTIONS

const GameState = {
    MAIN_MENU:0, GAMEPLAY:1, GAME_OVER:2, HIGH_SCORES:3, PAUSE:4
}

const PlayerState = {
    IDLE: 0, JUMPING: 1, SLIDING: 2, JUMPING_ON_RAIL: 3, CROUCH: 4, JUMPING_FROM_CROUCH: 5
}

const CmpId = {
    COLLISION:0, JUMP:1, MOVE:2, PLAYER_CONTROLLED:3, POSITION:4, VISUAL:5, COLLISION_RESPONSE:6, SCORE:7, SCORE_BIND:8, LIVES:9, TEXT_FIELD:10, RESULT_BIND:11
}

const ObstacleType = {
    BOX:0, RAIL:1, PLAYER:2, SCORE_POINT:3, GRID:4, GRID_STICK:5
}

const CollisionType = {
	INTERSECT:0, TOUCH:1, NONE:2
}

const Keys = {
    LEFT:"ArrowLeft", RIGHT:"ArrowRight", UP:"ArrowUp", DOWN:"ArrowDown", CTRL:"Control", SPACE:" ", ENTER:"Enter", H:"H", TAB:"Tab", ESCAPE:"Escape"
}

const KeyState = {
    PRESSED:0, HOLD:1, RELEASED:2
}

// WORLD SECTION

class World {
    constructor() {
        this.MAX_ENTITIES = 20;
        this.MAX_COMPONENTS = 12;
        
        this.components = [];
        this.fillWorld();
    
        this.systems = [];
        this.renderSystems = [];
    }

    resetWorld() {
        this.removeAllSystems();
        this.killAllEntities();
    }
    
    fillWorld() {
        for (let i = 0; i < this.MAX_COMPONENTS; i++) {
            this.components[i] = new Array(this.MAX_ENTITIES).fill(null);
        }
    }
    
    addSystem(system) {
        this.systems.push(system);
    }
    
    addRenderSystem(system) {
        this.renderSystems.push(system);
    }
    
    updateSystems() {
        this.systems.forEach(foo => foo(this));
    }
    
    updateRenderSystems() {
        this.renderSystems.forEach(foo => foo(this));
    }

    removeAllSystems() {
        this.systems = [];
        this.renderSystems = [];
    }
    
    killAllEntities() {
        for (let i = 0; i < this.MAX_COMPONENTS; i++) {
            this.components[i] = new Array(this.MAX_ENTITIES).fill(null);
        }
    }
    
    killEntity(entityId) {
        this.components.forEach(x => x[entityId] = null)
    }
    
    addComponentToEntity(entityId, component) {
        this.components[component.id][entityId] = component;
    }

    removeComponentFromEntity(entityId, cmpId) {
        this.components[cmpId][entityId] = null;
    }
    
    getEntityComponents(entityId, ...cmpIds) {
        let entity = [];
        for (let cmpId of cmpIds) {
            entity[cmpId] = this.components[cmpId][entity];
        }
        return entity;
    }

    getComponents(cmpId) {
        return this.components[cmpId];
    }

    getComponent(entityId, cmpId) {
        return this.components[cmpId][entityId];
    }

    isEntityOk(entityId, ...cmpIds) {
        for (let cmp of cmpIds) {
            if (!this.checkComponentHasValue(entityId, cmp)) {
                return false;
            }
        }
        return true;
    }

    checkComponentHasValue(entityId, cmpId) {
        if (entityId > this.MAX_ENTITIES) return false;
        return this.components[cmpId][entityId] !== null;
    }

    // template<class T>
    // void clearOptVec(World.OptVec<T>& vec) {
    //     std.for_each(vec.begin(), vec.end(), [](std.optional<T>& opt) { opt.reset(); });
    // }

    // template<class T>
    // void clearEntityInOptVec(World.OptVec<T>& vec, unsigned int entityId) {
    //     vec.at(entityId).reset();
    // }
}

// COMPONENTS SECTION

class Visual {
    constructor(texture, width, height, isVisible) {
        this.id = CmpId.VISUAL;
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.isVisible = isVisible;
        this.rotation = 0;
        if (isVisible == undefined) this.isVisible = true;
    }
}

class Move {
    constructor(speed) {
        this.id = CmpId.MOVE;
        this.speed = speed;
    }
}

class Position {
    constructor(x, y) {
        this.id = CmpId.POSITION;
        this.x = x;
        this.y = y;
    }
}

class Jump {
    constructor() {
        this.id = CmpId.JUMP;
        this.startJumpFrame = 0;
        this.jumpFrom = 0;
    }
}

class PlayerControlled {
    constructor(state, name) {
        this.id = CmpId.PLAYER_CONTROLLED;
        this.playerState = state;
        this.name = name;
    }

}

class Collision {
    constructor(width, height, type) {
        this.id = CmpId.COLLISION;
        this.width = width;
        this.height = height;
        this.type = type;
    }
}

class CollisionResponse {
    constructor(colEntityId, colType, obsType) {
        this.id = CmpId.COLLISION_RESPONSE;
        this.colEntityId = colEntityId;
        this.collisionType = colType;
        this.obstacle = obsType;
    }
}

class Lives {
    constructor(livesIds) {
        this.id = CmpId.LIVES;
        this.lives = livesIds.length;
        this.livesIds = livesIds;
    }
}

class Score {
    constructor(score) {
        this.id = CmpId.SCORE;
        this.score = score;
    }
}

class ScoreBind {    
    constructor(playerId) {
        this.id = CmpId.SCORE_BIND;
        this.playerId = playerId;
    }
};

// SYSTEM SECTION

function drawSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {    
        if (!world.isEntityOk(entity, CmpId.VISUAL, CmpId.POSITION)) {
            continue;
        }
        
        let vis = world.getComponent(entity, CmpId.VISUAL);
        let pos = world.getComponent(entity, CmpId.POSITION);

        if (!vis.isVisible) {
            continue;
        } 

        if (vis.rotation == 0) { 
            ctx.drawImage(vis.texture, pos.x, pos.y, vis.width, vis.height);
        } else {
            ctx.translate(pos.x + vis.width / 2, pos.y + vis.height / 2);
            ctx.rotate(degreesToRadians(vis.rotation));
            ctx.drawImage(vis.texture, -vis.width / 2, -vis.height/ 2, vis.width, vis.height);
            ctx.rotate(-degreesToRadians(vis.rotation));
            ctx.translate(-(pos.x + vis.width / 2), -(pos.y + vis.height / 2));
        }
    }
}

function drawScoreSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {    
        if (!world.isEntityOk(entity, CmpId.SCORE_BIND, CmpId.POSITION)) {
            continue;
        }
        
        let scrBind = world.getComponent(entity, CmpId.SCORE_BIND);
        let pos = world.getComponent(entity, CmpId.POSITION);

        if (world.isEntityOk(scrBind.playerId, CmpId.SCORE)) {
            let score = world.getComponent(scrBind.playerId, CmpId.SCORE);
            ctx.font = "40px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Score: " + score.score, SCORE_POSITION_X, SCORE_POSITION_Y);    
        }
    }
}

function drawResultSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {    
        if (!world.isEntityOk(entity, CmpId.SCORE, CmpId.POSITION)) {
            continue;
        }
        
        let score = world.getComponent(entity, CmpId.SCORE);
        let pos = world.getComponent(entity, CmpId.POSITION);

        ctx.font = "50px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Your score: " + score.score, RESULT_POSITION_X, RESULT_POSITION_Y);    
    }
}

function moveSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.MOVE, CmpId.POSITION)) {
            continue;
        }

        let mov = world.getComponent(entity, CmpId.MOVE);
        let pos = world.getComponent(entity, CmpId.POSITION);
        pos.x += mov.speed;
    }
} 

function speedSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.MOVE)) {
            continue;
        }

        let mov = world.getComponent(entity, CmpId.MOVE);
        if (gameFrame % NUMBER_OF_FRAMES_TO_INCREMENT == 0) {
            mov.speed--;
        }
    }
}

function backgroundSystem(world) {
    for (let entity = 0; entity < 2; entity++) {  
        if (!world.isEntityOk(entity, CmpId.MOVE, CmpId.POSITION)) {
            continue;
        }

        let pos = world.getComponent(entity, CmpId.POSITION);
        if (pos.x <= -CANVAS_WIDTH) {
            pos.x = CANVAS_WIDTH + pos.x % CANVAS_WIDTH;
        }
    }
}

function playerControlledSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED, CmpId.POSITION, CmpId.JUMP, CmpId.VISUAL)) {
            continue;
        }

        let vis = world.getComponent(entity, CmpId.VISUAL);
        let pos = world.getComponent(entity, CmpId.POSITION);
        let jump = world.getComponent(entity, CmpId.JUMP);
        let pc = world.getComponent(entity, CmpId.PLAYER_CONTROLLED);

        if (input.keys[Keys.RIGHT] != KeyState.RELEASED && !isPlayerJumping(pc.playerState)) {
            pos.x = pos.x + 5;
            if (pos.x > BOBER_MAX_X) pos.x = BOBER_MAX_X;
        } else if (input.keys[Keys.LEFT] != KeyState.RELEASED && !isPlayerJumping(pc.playerState)) {
            pos.x = pos.x - 5;
            if (pos.x < BOBER_MIN_X) pos.x = BOBER_MIN_X;
        }

        if (input.keys[Keys.SPACE] == KeyState.PRESSED) {
            input.keys[Keys.SPACE] = KeyState.HOLD;
            if (pc.playerState == PlayerState.SLIDING) {
                pc.playerState = PlayerState.JUMPING_ON_RAIL;
                jump.jumpFrom = JUMP_FROM_RAIL_Y;
                jump.startJumpFrame = gameFrame;
                world.addComponentToEntity(entity, new Visual(boberFlipTexture, BOBER_IN_JUMP_WIDTH, BOBER_IN_JUMP_HEIGHT));
                world.removeComponentFromEntity(entity, CmpId.COLLISION_RESPONSE);
            }
            else if (pc.playerState == PlayerState.IDLE || pc.playerState == PlayerState.CROUCH) {
                if (pc.playerState == PlayerState.CROUCH) {
                    pc.playerState = PlayerState.JUMPING_FROM_CROUCH;
                    world.addComponentToEntity(entity, new Visual(boberFlipTexture, BOBER_IN_JUMP_WIDTH, BOBER_IN_JUMP_HEIGHT));
                }
                else {
                    pc.playerState = PlayerState.JUMPING;
                    world.addComponentToEntity(entity, new Visual(boberJumpTexture, BOBER_IN_JUMP_WIDTH, BOBER_IN_JUMP_HEIGHT));
                }
                jump.jumpFrom = JUMP_FROM_GROUND_Y;
                jump.startJumpFrame = gameFrame;
            }
        }
        else if (input.keys[Keys.CTRL] == KeyState.PRESSED) {
            input.keys[Keys.CTRL] = KeyState.HOLD;
            if (pc.playerState == PlayerState.IDLE) {
                pc.playerState = PlayerState.CROUCH;
                pos.y = BOBER_CROUCH_POSITION_Y;
                world.addComponentToEntity(entity, new Visual(boberCrouchTexture, BOBER_CROUCH_WIDTH, BOBER_CROUCH_HEIGHT));
            }
            else if (pc.playerState == PlayerState.CROUCH) {
                pc.playerState = PlayerState.IDLE;
                pos.y = IDLE_RIDE_Y;
                world.addComponentToEntity(entity, new Visual(boberStandTexture, BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT));
            }
        }

    }
}

var jumpHeight = 120;
var duration = 120;
var rotationSpeed = 3;
var ollieUpSpeed = -1.2;
var ollieDownSpeed = 0.4;
var speedCount = 5;
var waitForJumpEndFlag = false;

function jumpSystem(world) {
    if (gameFrame <= 1) {
        jumpHeight = 120;
        duration = 120;
        rotationSpeed = 3;
        ollieUpSpeed = -1.2;
        ollieDownSpeed = 0.4;
        speedCount = 5;
        waitForJumpEndFlag = false;
    }
    if (gameFrame % NUMBER_OF_FRAMES_TO_INCREMENT == 0) {
        duration = duration - duration / speedCount;
        rotationSpeed = rotationSpeed + rotationSpeed / speedCount;
        ollieUpSpeed = ollieUpSpeed + ollieUpSpeed / speedCount;
        ollieDownSpeed = ollieDownSpeed + ollieDownSpeed / speedCount;
        speedCount++;
    }

    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED, CmpId.POSITION, CmpId.JUMP, CmpId.VISUAL)) {
            continue;
        }

        let vis = world.getComponent(entity, CmpId.VISUAL);
        let pos = world.getComponent(entity, CmpId.POSITION);
        let jump = world.getComponent(entity, CmpId.JUMP);
        let pc = world.getComponent(entity, CmpId.PLAYER_CONTROLLED);

        if (gameFrame == NUMBER_OF_FRAMES_TO_INCREMENT && isPlayerJumping(pc.playerState)) { 
            waitForJumpEndFlag = true;
        } else if (gameFrame == NUMBER_OF_FRAMES_TO_INCREMENT || (waitForJumpEndFlag && !isPlayerJumping(pc.playerState))) {
            jumpHeight = 120;
            duration = 95;
            rotationSpeed = 3.3;
            ollieUpSpeed = -1.2;
            ollieDownSpeed = 0.4;
            waitForJumpEndFlag = false;
        }

        if (pc.playerState == PlayerState.JUMPING || pc.playerState == PlayerState.JUMPING_ON_RAIL || pc.playerState == PlayerState.JUMPING_FROM_CROUCH) {
            if (gameFrame >= jump.startJumpFrame + duration) {
                pc.playerState = PlayerState.IDLE;
                pos.y = IDLE_RIDE_Y;
                vis.rotation = 0;
                world.addComponentToEntity(entity, new Visual(boberStandTexture, BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT));  
            }
            else {
                pos.y = lerp(
                    jump.jumpFrom,
                    jump.jumpFrom - jumpHeight,
                    spike((gameFrame - jump.startJumpFrame) / duration)
                );

                if (pc.playerState == PlayerState.JUMPING_ON_RAIL) {                  
                    vis.rotation -= rotationSpeed;
                }
                else if (pc.playerState == PlayerState.JUMPING_FROM_CROUCH) {
                    vis.rotation += rotationSpeed;
                }
                else {
                    if ((gameFrame - jump.startJumpFrame) / duration < 0.15) {
                       vis.rotation += ollieUpSpeed;
                    }
                    else {
                        vis.rotation +=  ollieDownSpeed;
                    }
                }
            }
        }
    }
}

function isPlayerJumping(playerState) {
    return playerState == PlayerState.JUMPING || playerState == PlayerState.JUMPING_FROM_CROUCH || playerState == PlayerState.JUMPING_ON_RAIL;
}

function railSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED, CmpId.POSITION, CmpId.COLLISION_RESPONSE, CmpId.VISUAL)) {
            continue;
        }

        let vis = world.getComponent(entity, CmpId.VISUAL);
        let pos = world.getComponent(entity, CmpId.POSITION);
        let cr = world.getComponent(entity, CmpId.COLLISION_RESPONSE);
        let pc = world.getComponent(entity, CmpId.PLAYER_CONTROLLED);
        
        if (!world.checkComponentHasValue(cr.colEntityId, CmpId.POSITION)) {
            continue;
        }
        let obstacleX = world.getComponent(cr.colEntityId, CmpId.POSITION).x;
        let playerX = pos.x;

        if (pc.playerState == PlayerState.SLIDING && obstacleX < playerX && Math.abs(playerX - obstacleX) >= RAIL_AND_BOBER_DIFFERENCE) {
            world.removeComponentFromEntity(cr.colEntityId, CmpId.COLLISION_RESPONSE);
            world.removeComponentFromEntity(entity, CmpId.COLLISION_RESPONSE);
            pc.playerState = PlayerState.IDLE;
            pos.y = IDLE_RIDE_Y;
            world.addComponentToEntity(entity, new Visual(boberStandTexture, BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT));
        }
    }
}

class ObstacleGeneratorSettings {
    constructor(maxObstacles, minIndex, gridMinIndex, scoreMinIndex) {
        this.maxObstacles = maxObstacles;
        this.obstacleMin = minIndex;
        this.obstacleMax = minIndex + maxObstacles - 1;
        this.current = 0;
        this.spawnRate = 350;
        this.gridMin = gridMinIndex;
        this.gridMax = gridMinIndex + maxObstacles - 1;
        this.scoreMin = scoreMinIndex;
        this.scoreMax = scoreMinIndex + maxObstacles - 1;
        this.initialSpeed = -3;
        this.speedCount = 3;
        this.frame = 0;
    }
}

var ogs = new ObstacleGeneratorSettings(4, 3, 12, 7);
function obstacleGeneratorSystem(world) {
    if (gameFrame <= 1) {
        ogs = new ObstacleGeneratorSettings(4, 3, 12, 7);
    }
    ogs.frame++;

    if (ogs.frame % NUMBER_OF_FRAMES_TO_INCREMENT == 0) {
        ogs.spawnRate = ogs.spawnRate - Math.round(ogs.spawnRate / ogs.speedCount);
        ogs.speedCount++;
        ogs.frame = 1;
        ogs.initialSpeed = -ogs.speedCount;
    }

    if (ogs.frame % ogs.spawnRate == 0) {
        ogs.current++;
        if (ogs.current >= ogs.maxObstacles) ogs.current = 0;

        let x = Math.floor(Math.random() * 1000);

        if (x < 333) {
            createBox(world, ogs);
            createScorePoint(world, OBSTACLE_SPAWN_X - BOX_WIDTH / 2 + 300, ogs);
        }
        else if (x < 666) {
            createGridFlag(world, ogs);
            createGridStick(world, ogs);
            createScorePoint(world, OBSTACLE_SPAWN_X - GRID_WIDTH / 2 + 500, ogs);
        }
        else {
            createRail(world, ogs);
            createScorePoint(world, OBSTACLE_SPAWN_X - RAIL_WIDTH / 2 + 550, ogs);
        }
    }
}

function createGridFlag(world, ogs) {
    world.addComponentToEntity(ogs.gridMin + ogs.current, new Position(OBSTACLE_SPAWN_X - GRID_WIDTH / 2, GRID_POSITION_Y));
    world.addComponentToEntity(ogs.gridMin + ogs.current, new Visual(gridTexture, GRID_WIDTH, GRID_HEIGHT));
    world.addComponentToEntity(ogs.gridMin + ogs.current, new Move(ogs.initialSpeed));
    world.addComponentToEntity(ogs.gridMin + ogs.current, new Collision(GRID_WIDTH, GRID_HEIGHT, ObstacleType.GRID));
}

function createGridStick(world, ogs) {
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Position(OBSTACLE_SPAWN_X - GRID_WIDTH / 2, GRID_POSITION_Y));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Visual(gridStickTexture, GRID_WIDTH, GRID_HEIGHT));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Move(ogs.initialSpeed));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Collision(GRID_WIDTH, GRID_HEIGHT, ObstacleType.GRID_STICK));
}

function createRail(world, ogs) {
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Position(OBSTACLE_SPAWN_X - RAIL_WIDTH / 2, RAIL_POSITION_Y));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Visual(railTexture, RAIL_WIDTH, RAIL_HEIGHT));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Move(ogs.initialSpeed));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Collision(RAIL_WIDTH - 100, RAIL_HEIGHT, ObstacleType.RAIL));
}

function createBox(world, ogs) {
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Position(OBSTACLE_SPAWN_X - BOX_WIDTH / 2, BOX_POSITION_Y));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Visual(boxTexture, BOX_WIDTH, BOX_HEIGHT));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Move(ogs.initialSpeed));
    world.addComponentToEntity(ogs.obstacleMin + ogs.current, new Collision(BOX_WIDTH, BOX_HEIGHT, ObstacleType.BOX));
}

function createScorePoint(world, positionX, ogs) {
    world.addComponentToEntity(ogs.scoreMin + ogs.current, new Position(positionX, 0));
    world.addComponentToEntity(ogs.scoreMin + ogs.current, new Visual(heartTexture, SCORE_WIDTH, SCORE_HEIGHT, false));
    world.addComponentToEntity(ogs.scoreMin + ogs.current, new Move(ogs.initialSpeed));
    world.addComponentToEntity(ogs.scoreMin + ogs.current, new Collision(SCORE_WIDTH, SCORE_HEIGHT, ObstacleType.SCORE_POINT));
}

function collisionSystem(world) {
    for (let entityA = 0; entityA < world.MAX_ENTITIES; entityA++) {  
        if (!world.isEntityOk(entityA, CmpId.POSITION, CmpId.COLLISION, CmpId.VISUAL)) {
            continue;
        }
        let visA = world.getComponent(entityA, CmpId.VISUAL);
        let posA = world.getComponent(entityA, CmpId.POSITION);
        let colA = world.getComponent(entityA, CmpId.COLLISION);
    
        for (let entityB = entityA + 1; entityB < world.MAX_ENTITIES; entityB++) {  
            if (!world.isEntityOk(entityB, CmpId.POSITION, CmpId.COLLISION, CmpId.VISUAL)) {
                continue;
            }
            let visB = world.getComponent(entityB, CmpId.VISUAL);
            let posB = world.getComponent(entityB, CmpId.POSITION);
            let colB = world.getComponent(entityB, CmpId.COLLISION);

            //todo usunac
            let rectA = new RotatedRectangle(new Rectangle(posA.x, posA.y, visA.width, visA.height), visA.rotation);
            let rectB = new RotatedRectangle(new Rectangle(posB.x, posB.y, visB.width, visB.height), visB.rotation);
            rectA.intersects(rectB);

            let type = intersects(posA, colA, visA, posB, colB, visB);
            if (type == CollisionType.NONE) {
                continue;
            }

            world.addComponentToEntity(entityA, new CollisionResponse(entityB, type, colB.type));
            world.addComponentToEntity(entityB, new CollisionResponse(entityA, type, colA.type));
        }    

    }
}

function intersects(posA, colA, visA, posB, colB, visB) {
    let rectA = new RotatedRectangle(new Rectangle(posA.x, posA.y, visA.width, visA.height), visA.rotation);
    let rectB = new RotatedRectangle(new Rectangle(posB.x, posB.y, visB.width, visB.height), visB.rotation);

    if (rectA.intersects(rectB)) {
        return CollisionType.INTERSECT;
    }
    return CollisionType.NONE;
}

var initialImmortalDurationVal = 150;
var immortalDuration = 150;

function immortalSystem(world) {
    if (gameFrame == NUMBER_OF_FRAMES_TO_INCREMENT) {
        if (immortalDuration == initialImmortalDurationVal) {
            immortalDuration = 100;
        }
        initialImmortalDurationVal = 100;
    }
    
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED, CmpId.VISUAL) || world.checkComponentHasValue(entity, CmpId.COLLISION)) {
            continue;
        }

        let vis = world.getComponent(entity, CmpId.VISUAL);

        if (immortalDuration > 0) {
            if (immortalDuration % 20 == 0) {
                vis.isVisible = !vis.isVisible;
            }
            immortalDuration--;
        }
        else {
            immortalDuration = initialImmortalDurationVal;
            world.addComponentToEntity(entity, new Collision(BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT, ObstacleType.PLAYER));           
            if (!vis.isVisible) {
                vis.isVisible = true;
            }
        }
    }
}

function playerCollisionSystem(world) {
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED, CmpId.POSITION, CmpId.COLLISION_RESPONSE, CmpId.VISUAL, CmpId.SCORE, CmpId.LIVES)) {
            continue;
        }

        let vis = world.getComponent(entity, CmpId.VISUAL);
        let pos = world.getComponent(entity, CmpId.POSITION);
        let cr = world.getComponent(entity, CmpId.COLLISION_RESPONSE);
        let pc = world.getComponent(entity, CmpId.PLAYER_CONTROLLED);
        let score = world.getComponent(entity, CmpId.SCORE);
        let liv = world.getComponent(entity, CmpId.LIVES);

        if (cr.obstacle == ObstacleType.SCORE_POINT) {
            score.score++;
            world.killEntity(cr.colEntityId);
            world.removeComponentFromEntity(entity, CmpId.COLLISION_RESPONSE);
        }
        else if (cr.obstacle == ObstacleType.BOX || (cr.obstacle == ObstacleType.RAIL && (pc.playerState == PlayerState.IDLE || pc.playerState == PlayerState.CROUCH))) {
            removeLifeOrKill(world, entity, liv, score.score, cr.colEntityId);
            pos.y = BOBER_DEFAULT_POSITION_Y;
            world.addComponentToEntity(entity, new Visual(boberStandTexture, BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT));
            if (cr.obstacle == ObstacleType.BOX) {
                world.addComponentToEntity(cr.colEntityId, new Visual(boxBrokenTexture, BOX_WIDTH + 20, BOX_HEIGHT + 20));
            }
        }
        else if (cr.obstacle == ObstacleType.RAIL && (pc.playerState == PlayerState.JUMPING || pc.playerState == PlayerState.JUMPING_FROM_CROUCH || pc.playerState == PlayerState.JUMPING_ON_RAIL)) {
            pos.y = SLIDING_ON_RAIL_Y;
            pc.playerState = PlayerState.SLIDING;
            world.addComponentToEntity(entity, new Visual(boberSlideTexture, BOBER_ON_RAIL_WIDTH, BOBER_ON_RAIL_HEIGHT));
            world.removeComponentFromEntity(cr.colEntityId, CmpId.COLLISION_RESPONSE);
            world.removeComponentFromEntity(cr.colEntityId, CmpId.COLLISION);
        }
        else if (cr.obstacle == ObstacleType.GRID) {
            if (pc.playerState != PlayerState.CROUCH) {
                removeLifeOrKill(world, entity, liv, score.score, cr.colEntityId);
                pos.y = BOBER_DEFAULT_POSITION_Y;
                world.addComponentToEntity(cr.colEntityId - 9, new Visual(gridBrokenTexture, GRID_WIDTH, GRID_HEIGHT));
                world.killEntity(cr.colEntityId);
            }
            else {
                world.removeComponentFromEntity(entity, CmpId.COLLISION_RESPONSE);
            }
        }
    }
}

function removeLifeOrKill(world, entity, liv, score, obstacleId) {
    let lifeID = liv.livesIds.pop();
    if (liv.livesIds.length == 0) {
        playerResult = score;
        world.killEntity(entity);
        world.killEntity(lifeID);
    }
    else {
        world.killEntity(lifeID);
        world.removeComponentFromEntity(entity, CmpId.COLLISION);
        world.removeComponentFromEntity(entity, CmpId.COLLISION_RESPONSE);
        world.removeComponentFromEntity(obstacleId, CmpId.COLLISION);
    }
}

function gameOverSystem(world) {
    let pcExist = false;
    for (let entity = 0; entity < world.MAX_ENTITIES; entity++) {  
        if (!world.isEntityOk(entity, CmpId.PLAYER_CONTROLLED)) {
            continue;
        }
        pcExist = true;
    }

    if (!pcExist) {
        gameOver = true;
    }
}

// UTIL

class Rectangle {
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
}

class Vector2V {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class RotatedRectangle {
    constructor(rectangle, initialRotation) {
        this.collisionRectangle = rectangle;
        this.rotation = initialRotation;
        this.origin = new Vector2V(rectangle.width / 2, rectangle.height / 2);
    }

    changePosition(theXPositionAdjustment, theYPositionAdjustment) {
        this.collisionRectangle.left += theXPositionAdjustment;
        this.collisionRectangle.top += theYPositionAdjustment;
    }

    intersects(rectangle) {
        let rectangleAxis = new Array(4);
        rectangleAxis[0] = (this.sub(this.upperRightCorner(), this.upperLeftCorner()));
        rectangleAxis[1] = (this.sub(this.upperRightCorner(), this.lowerRightCorner()));
        rectangleAxis[2] = (this.sub(rectangle.upperLeftCorner(), rectangle.lowerLeftCorner()));
        rectangleAxis[3] = (this.sub(rectangle.upperLeftCorner(), rectangle.upperRightCorner()));

        for (let axis of rectangleAxis) {
            if (!this.isAxisCollision(rectangle, axis)) {
                return false;
            }
        }
        return true;
    }

    isAxisCollision(rectangle, axis) {
        let rectangleAScalars = new Array(4);
        rectangleAScalars[0] = (this.generateScalar(rectangle.upperLeftCorner(), axis));
        rectangleAScalars[1] = (this.generateScalar(rectangle.upperRightCorner(), axis));
        rectangleAScalars[2] = (this.generateScalar(rectangle.lowerLeftCorner(), axis));
        rectangleAScalars[3] = (this.generateScalar(rectangle.lowerRightCorner(), axis));

        // ctx.fillStyle = '#000';
        // ctx.beginPath();
        // ctx.moveTo(rectangle.upperLeftCorner().x, rectangle.upperLeftCorner().y);
        // ctx.lineTo(rectangle.upperRightCorner().x, rectangle.upperRightCorner().y);
        // ctx.lineTo(rectangle.lowerRightCorner().x, rectangle.lowerRightCorner().y);
        // ctx.lineTo(rectangle.lowerLeftCorner().x, rectangle.lowerLeftCorner().y);
        // ctx.closePath();
        // ctx.fill();

        let rectangleBScalars = new Array(4);
        rectangleBScalars[0] = (this.generateScalar(this.upperLeftCorner(), axis));
        rectangleBScalars[1] = (this.generateScalar(this.upperRightCorner(), axis));
        rectangleBScalars[2] = (this.generateScalar(this.lowerLeftCorner(), axis));
        rectangleBScalars[3] = (this.generateScalar(this.lowerRightCorner(), axis));

        // // ctx.fillStyle = '#f00';
        // ctx.beginPath();
        // ctx.moveTo(this.upperLeftCorner().x, this.upperLeftCorner().y);
        // ctx.lineTo(this.upperRightCorner().x, this.upperRightCorner().y);
        // ctx.lineTo(this.lowerRightCorner().x, this.lowerRightCorner().y);
        // ctx.lineTo(this.lowerLeftCorner().x, this.lowerLeftCorner().y);
        // ctx.closePath();
        // ctx.fill();

        let rectangleAMinimum = Math.min(...rectangleAScalars);
        let rectangleAMaximum = Math.max(...rectangleAScalars);
        let rectangleBMinimum = Math.min(...rectangleBScalars);
        let rectangleBMaximum = Math.max(...rectangleBScalars);
    
        if (rectangleBMinimum <= rectangleAMaximum && rectangleBMaximum >= rectangleAMaximum) {
            return true;
        } else if (rectangleAMinimum <= rectangleBMaximum && rectangleAMaximum >= rectangleBMaximum) {
            return true;
        }
        return false;
    }

    generateScalar(rectangleCorner, axis) {
        let numerator = (rectangleCorner.x * axis.x) + (rectangleCorner.y * axis.y);
        let denominator = (axis.x * axis.x) + (axis.y * axis.y);
        let divisionResult = numerator / denominator;
        let cornerProjected = new Vector2V(divisionResult * axis.x, divisionResult * axis.y);

        return (axis.x * cornerProjected.x) + (axis.y * cornerProjected.y);
    }

    rotatePoint(point, originV, rotationVal) {
        rotationVal = degreesToRadians(rotationVal);
        return new Vector2V(
            originV.x + (point.x - originV.x) * Math.cos(rotationVal) - (point.y - originV.y) * Math.sin(rotationVal),
            originV.y + (point.y - originV.y) * Math.cos(rotationVal) + (point.x - originV.x) * Math.sin(rotationVal)
        );
    }

    upperLeftCorner() {
        let upperLeft = new Vector2V(this.collisionRectangle.left, this.collisionRectangle.top);
        upperLeft = this.rotatePoint(upperLeft, this.add(upperLeft, this.origin), this.rotation);
        return upperLeft;
    }

    upperRightCorner() {
        let upperRight = new Vector2V(this.collisionRectangle.left + this.collisionRectangle.width, this.collisionRectangle.top);
        upperRight = this.rotatePoint(upperRight, this.add(upperRight, new Vector2V(-this.origin.x, this.origin.y)), this.rotation);
        return upperRight;
    }

    lowerLeftCorner() {
        let lowerLeft = new Vector2V(this.collisionRectangle.left, this.collisionRectangle.top + this.collisionRectangle.height);
        lowerLeft = this.rotatePoint(lowerLeft, this.add(lowerLeft, new Vector2V(this.origin.x, -this.origin.y)), this.rotation);
        return lowerLeft;
    }

    lowerRightCorner() {
        let lowerRight = new Vector2V(this.collisionRectangle.left + this.collisionRectangle.width, this.collisionRectangle.top + this.collisionRectangle.height);
        lowerRight = this.rotatePoint(lowerRight, this.add(lowerRight, new Vector2V(-this.origin.x, -this.origin.y)), this.rotation);
        return lowerRight;
    }

    add(vectorA, vectorB) {
        return new Vector2V(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
    }

    sub(vectorA, vectorB) {
        return new Vector2V(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
    }

    getX() { return this.collisionRectangle.left; }
    getY() { return this.collisionRectangle.top; }
    getWidth() { return this.collisionRectangle.width; }
    getHeight() { return this.collisionRectangle.height; }
}

class InputHandler {
    constructor() {
        this.keys = [];
        for (let k in Keys) {
            this.keys[Keys[k]] = KeyState.RELEASED;
        }

        window.addEventListener('keydown', e => {
            if (Object.keys(Keys).some(k => Keys[k] == e.key)) {
                if (this.keys[e.key] == KeyState.PRESSED) {
                    this.keys[e.key] = KeyState.HOLD;
                } else if (this.keys[e.key] == KeyState.RELEASED) {
                    this.keys[e.key] = KeyState.PRESSED;
                }
            }
            // console.log(e.key, this.keys);
        });
        window.addEventListener('keyup', e => {
            if (Object.keys(Keys).some(k => Keys[k] == e.key)) {
                this.keys[e.key] = KeyState.RELEASED;
            }
            // console.log(e.key, this.keys);
        });
    }
}

function lerp(start_value, end_value, pct) {
    return (start_value + (end_value - start_value) * pct);
}

function easeOut(x) {
    return 1 - Math.pow(1 - x, 3);
}

function flip(x) {
    return 1 - x;
}

function spike(x) {
    if (x <= 0.5) {
        return easeOut(x / 0.5);
    }
    return easeOut(flip(x) / 0.5);
}

const degreesToRadians = deg => (deg * Math.PI) / 180.0;

// GAME
function createGameWorld() {
    gameplayECS.resetWorld();
    gameFrame = 0;

    gameplayECS.addSystem(obstacleGeneratorSystem);
    gameplayECS.addSystem(playerControlledSystem);
    gameplayECS.addSystem(moveSystem);
    gameplayECS.addSystem(speedSystem);
    gameplayECS.addSystem(jumpSystem);
    gameplayECS.addSystem(railSystem);
    gameplayECS.addSystem(collisionSystem);
    gameplayECS.addSystem(playerCollisionSystem);
    gameplayECS.addSystem(immortalSystem);
    gameplayECS.addSystem(gameOverSystem);
    gameplayECS.addSystem(backgroundSystem);
    
    gameplayECS.addRenderSystem(drawSystem);
    gameplayECS.addRenderSystem(drawScoreSystem);

    const background1 = 0;
    gameplayECS.addComponentToEntity(background1, new Visual(backgroundTexture, CANVAS_WIDTH, CANVAS_HEIGHT, true));
    gameplayECS.addComponentToEntity(background1, new Position(0, 0));
    gameplayECS.addComponentToEntity(background1, new Move(-2));

    const background2 = 1;
    gameplayECS.addComponentToEntity(background2, new Visual(backgroundTexture, CANVAS_WIDTH, CANVAS_HEIGHT, true));
    gameplayECS.addComponentToEntity(background2, new Position(CANVAS_WIDTH, 0));
    gameplayECS.addComponentToEntity(background2, new Move(-2));

    const life1 = 16;
    gameplayECS.addComponentToEntity(life1, new Position(HEART_POSITION_X_1, HEART_POSITION_Y));
    gameplayECS.addComponentToEntity(life1, new Visual(heartTexture, HEART_WIDTH, HEART_HEIGHT));

    const life2 = 17;
    gameplayECS.addComponentToEntity(life2, new Position(HEART_POSITION_X_2, HEART_POSITION_Y));
    gameplayECS.addComponentToEntity(life2, new Visual(heartTexture, HEART_WIDTH, HEART_HEIGHT));

    const life3 = 18;
    gameplayECS.addComponentToEntity(life3, new Position(HEART_POSITION_X_3, HEART_POSITION_Y));
    gameplayECS.addComponentToEntity(life3, new Visual(heartTexture, HEART_WIDTH, HEART_HEIGHT));

    const lives = [];
    lives.push(life1, life2, life3);
    
    const player = 11;
    gameplayECS.addComponentToEntity(player, new Visual(boberStandTexture, BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT, true));
    gameplayECS.addComponentToEntity(player, new Position(BOBER_DEFAULT_POSITION_X, BOBER_DEFAULT_POSITION_Y));
    gameplayECS.addComponentToEntity(player, new Jump());
    gameplayECS.addComponentToEntity(player, new PlayerControlled(PlayerState.IDLE, 'Bober'));
    gameplayECS.addComponentToEntity(player, new Collision(BOBER_DEFAULT_WIDTH, BOBER_DEFAULT_HEIGHT, ObstacleType.PLAYER));
    gameplayECS.addComponentToEntity(player, new Lives(lives));
    gameplayECS.addComponentToEntity(player, new Score(0));

    const scoreLabel = 2;
    gameplayECS.addComponentToEntity(scoreLabel, new Position(SCORE_POSITION_X, SCORE_POSITION_Y));
    gameplayECS.addComponentToEntity(scoreLabel, new ScoreBind(player));
}

function createStartWorld() {
    mainMenuECS.resetWorld();
    gameFrame = 0;

    mainMenuECS.addRenderSystem(drawSystem);

    const background = 0;
    mainMenuECS.addComponentToEntity(background, new Visual(startTexture, CANVAS_WIDTH, CANVAS_HEIGHT, true));
    mainMenuECS.addComponentToEntity(background, new Position(0, 0));
}

function createGameOverWorld() {
    gameOverECS.resetWorld();
    gameFrame = 0;

    gameOverECS.addRenderSystem(drawSystem);
    gameOverECS.addRenderSystem(drawResultSystem);

    const background = 0;
    gameOverECS.addComponentToEntity(background, new Visual(gameOverTexture, CANVAS_WIDTH, CANVAS_HEIGHT, true));
    gameOverECS.addComponentToEntity(background, new Position(0, 0));

    const result = 1; 
    gameOverECS.addComponentToEntity(result, new Score(playerResult));
    gameOverECS.addComponentToEntity(result, new Position(300, 500));

}

function createHighScoreWorld() {
    highScoresECS.resetWorld();
    gameFrame = 0;

    highScoresECS.addRenderSystem(drawSystem);

    const background = 0;
    gameOverECS.addComponentToEntity(background, new Visual(highScoresTexture, CANVAS_WIDTH, CANVAS_HEIGHT, true));
    gameOverECS.addComponentToEntity(background, new Position(0, 0));
}

function gameLoop(timestamp) {

    gameState = updateState(gameState);

    // console.log(timestamp);

    if (timestamp > laststamp + timestep && gameState != GameState.PAUSE) {
        gameFrame++;
        updateWorld(gameState);
        laststamp = timestamp;
    }

    renderWorld(gameState);

    requestAnimationFrame(gameLoop); 
}

function updateState(state) {
    switch (state) {
        case GameState.MAIN_MENU:
            if (input.keys[Keys.H] == KeyState.PRESSED) {
                input.keys[Keys.H] = KeyState.HOLD;
                createHighScoreWorld();
                return GameState.HIGH_SCORES;
            }
            if (input.keys[Keys.ENTER] == KeyState.PRESSED) {
                input.keys[Keys.ENTER] = KeyState.HOLD;
                // isNameGiven = false;
                playerName = "Player Name";
                createGameWorld(playerName);
                gameOver = false;
                return GameState.GAMEPLAY;
            }
            return state;
        case GameState.GAMEPLAY:
            if (input.keys[Keys.ESCAPE] == KeyState.PRESSED) {
                input.keys[Keys.ESCAPE] = KeyState.HOLD;
                //gameplayMusic.pause();
                return GameState.PAUSE;
            }
            if (gameOver) {
                createGameOverWorld();
                return GameState.GAME_OVER;
            }
            return state;
        case GameState.GAME_OVER:
            if (input.keys[Keys.H] == KeyState.PRESSED) {
                input.keys[Keys.H] = KeyState.HOLD;
                createHighScoreWorld();
                gameOver = false;
                return GameState.HIGH_SCORES;
            }
            if (input.keys[Keys.ENTER] == KeyState.PRESSED) {
                input.keys[Keys.end_value] = KeyState.HOLD;
                createGameWorld(playerName);
                gameOver = false;
                return GameState.GAMEPLAY;
            }
            return state;
        case GameState.HIGH_SCORES:
            if (input.keys[Keys.H] == KeyState.PRESSED) {
                input.keys[Keys.H] = KeyState.HOLD;
                return GameState.MAIN_MENU;
            }
            return state;
        case GameState.PAUSE:
            if (input.keys[Keys.ENTER] == KeyState.PRESSED) {
                input.keys[Keys.ENTER] = KeyState.HOLD;
                // gameplayMusic.play();
                return GameState.GAMEPLAY;
            }
            if (input.keys[Keys.ESCAPE] == KeyState.PRESSED) {
                input.keys[Keys.ESCAPE] = KeyState.HOLD;
                // gameplayMusic.stop();
                createStartWorld();
                return GameState.MAIN_MENU;
            }
            return state;
    }
    return null;
}

function updateWorld(gameState) {
    if (gameState == GameState.MAIN_MENU) {
        mainMenuECS.updateSystems();
    }
    else if (gameState == GameState.GAMEPLAY) {
        gameplayECS.updateSystems();
    }
    else if (gameState == GameState.GAME_OVER) {
        gameOverECS.updateSystems();
    }
}

function renderWorld(gameState) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    switch (gameState) {
        case GameState.HIGH_SCORES: highScoresECS.updateRenderSystems(); break;
        case GameState.MAIN_MENU: mainMenuECS.updateRenderSystems(); break;
        case GameState.GAMEPLAY: gameplayECS.updateRenderSystems(); break;
        case GameState.GAME_OVER: gameOverECS.updateRenderSystems(); break;
        case GameState.PAUSE: gameplayECS.updateRenderSystems(); break;
    }
}

// GAME VARIABLES SECTION

const fps = 100;
const timestep = 1000 / fps;

const gameplayECS = new World();
const mainMenuECS = new World();
const gameOverECS = new World();
const highScoresECS = new World();

const input = new InputHandler();

var playerResult = 0;
var gameFrame = 0;
var deltaTime = 0;
var gameOver = false;
var isNameGiven = false;
var gameState = GameState.MAIN_MENU;
var laststamp = 0;

createStartWorld();
gameLoop(0);
