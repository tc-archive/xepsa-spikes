import './style.css';

// Graphics Canvas ------------------------------------------------------------
//

const canvasCfg = {
    windowFull: false,
    windowDim: {
        height: 512,
        width: 1024,
    },
};
const canvas = document.querySelector('#the-game-canvas');
const resizeCanvas = () => {
    if (canvasCfg.windowFull) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = canvasCfg.windowDim.width;
        canvas.height = canvasCfg.windowDim.height;
    }
};
resizeCanvas();
window.addEventListener('resize', resizeCanvas, false);

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Player Entity --------------------------------------------------------------
//

class PlayerEntity {
    constructor(position, dimension, velocity, screenEdgeHandler, renderer) {
        // Components
        this.pos = position;
        this.rot = 0;
        this.dim = dimension;
        this.vel = velocity;
        this.speed = 10;
        // Systems
        this.screenEdgeHandler = screenEdgeHandler;
        this.renderer = renderer;

        // const unit = 5;
        // this.vel.dx = Math.cos(this.rot) * unit;
        // this.vel.dy = Math.sin(this.rot) * unit;
    }

    handle() {
        this.pos.x += this.vel.dx;
        this.pos.y += this.vel.dy;
        this.screenEdgeHandler.handle(this);
        this.renderer.handle(this);
    }
}

class PositionComponent {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class DimensionComponent {
    constructor(h, w) {
        this.h = h;
        this.w = w;
    }
}

class VelocityComponent {
    constructor(dx, dy) {
        this.dx = 0;
        this.dy = 0;
    }
}

class TileSpriteRenderSystem {
    constructor(ctx, spriteMap, spriteMeta) {
        this.ctx = ctx;
        this.spriteMap = spriteMap;
        this.spriteWidth = spriteMeta.width;
        this.spriteHeight = spriteMeta.height;
        this.row = spriteMeta.row;
        this.col = spriteMeta.col;
    }

    handle(entity) {
        this.ctx.drawImage(
            // Sprite sheet image.
            this.spriteMap,
            // Source coordinates. (x, y, w, h)
            this.row * entity.dim.w,
            this.col * entity.dim.h,
            entity.dim.w,
            entity.dim.h,
            // Destination coordinates. (x, y, w, h)
            entity.pos.x,
            entity.pos.y,
            entity.dim.w,
            entity.dim.h
        );
    }
}

function drawCircle(pos, radius, color) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

class TileCircleRenderSystem {
    constructor(ctx, radius, color) {
        this.ctx = ctx;
        this.radius = radius;
        this.color = color;
    }

    handle(entity) {
        const tileCenter = {
            x: entity.pos.x + entity.dim.h / 2,
            y: entity.pos.y + entity.dim.w / 2,
        };

        drawCircle(tileCenter, this.radius, this.color);

        const cx = (Math.cos(entity.rot) * entity.dim.h) / 2;
        const cy = (Math.sin(entity.rot) * entity.dim.w) / 2;
        ctx.beginPath();
        ctx.moveTo(tileCenter.x, tileCenter.y);
        ctx.lineTo(tileCenter.x + cx, tileCenter.y + cy);
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }
}

// DiscreteCompass
// Compass
// Orientation

const ORIENT = Symbol('Orient');

class CompassMovementSystem {
    constructor(entity) {
        this.entity = entity;
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
    }

    moveUp() {
        this.entity.vel.dy = -this.entity.speed;
    }

    moveDown() {
        this.entity.vel.dy = this.entity.speed;
    }

    moveRight() {
        this.entity.vel.dx = this.entity.speed;
    }

    moveLeft() {
        this.entity.vel.dx = -this.entity.speed;
    }

    keyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            this.moveRight();
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            this.moveLeft();
        } else if (e.key === 'ArrowUp' || e.key === 'Up') {
            this.moveUp();
        } else if (e.key === 'ArrowDown' || e.key === 'Down') {
            this.moveDown();
        }
    };

    keyUp = (e) => {
        if (
            e.key == 'Right' ||
            e.key == 'ArrowRight' ||
            e.key == 'Left' ||
            e.key == 'ArrowLeft' ||
            e.key == 'Up' ||
            e.key == 'ArrowUp' ||
            e.key == 'Down' ||
            e.key == 'ArrowDown'
        ) {
            this.entity.vel.dx = 0;
            this.entity.vel.dy = 0;
        }
    };
}

class OrientationMovementSystem {
    constructor(entity) {
        this.entity = entity;
        document.addEventListener('keydown', this.keyDown);
        document.addEventListener('keyup', this.keyUp);
    }

    moveForward() {
        this.entity.vel.dx = Math.cos(this.entity.rot) * this.entity.speed;
        this.entity.vel.dy = Math.sin(this.entity.rot) * this.entity.speed;
        // this.entity.pos.dx = this.entity.vel.dx;
        // this.entity.pos.dy = this.entity.vel.dy;
    }

    moveBackward() {
        this.entity.vel.dx = -Math.cos(this.entity.rot) * this.entity.speed;
        this.entity.vel.dy = -Math.sin(this.entity.rot) * this.entity.speed;
        // this.entity.pos.dx = -this.entity.vel.dx;
        // this.entity.pos.dy = -this.entity.vel.dy;
    }

    rotateRight() {
        this.entity.rot += 0.1;
        if (this.entity.rot >= 2 * Math.PI) {
            this.entity.rot = 0;
        }
    }

    rotateLeft() {
        this.entity.rot -= 0.1;
        if (this.entity.rot <= 0) {
            this.entity.rot = 2 * Math.PI;
        }
    }

    keyDown = (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            this.rotateRight();
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            this.rotateLeft();
        } else if (e.key === 'ArrowUp' || e.key === 'Up') {
            this.moveForward();
        } else if (e.key === 'ArrowDown' || e.key === 'Down') {
            this.moveBackward();
        }
    };

    keyUp = (e) => {
        if (
            e.key == 'Right' ||
            e.key == 'ArrowRight' ||
            e.key == 'Left' ||
            e.key == 'ArrowLeft' ||
            e.key == 'Up' ||
            e.key == 'ArrowUp' ||
            e.key == 'Down' ||
            e.key == 'ArrowDown'
        ) {
            this.entity.vel.dx = 0;
            this.entity.vel.dy = 0;
        }
    };
}

class ScreenEdgeHandlingSystem {
    constructor(canvas) {
        this.canvas = canvas;
    }

    // Entity requires 'location' and 'dimensions'.
    handle(entity) {
        // Left wall
        if (entity.pos.x < 0) {
            entity.pos.x = 0;
        }
        // Right Wall
        if (entity.pos.x + entity.dim.w > canvas.width) {
            entity.pos.x = canvas.width - entity.dim.w;
        }
        // Top wall
        if (entity.pos.y < 0) {
            entity.pos.y = 0;
        }
        // Bottom Walls
        if (entity.pos.y + entity.dim.h > canvas.height) {
            entity.pos.y = canvas.height - entity.dim.h;
        }
    }
}

// Map ------------------------------------------------------------------------
//

class TileMapEntity {
    constructor(tileMap, renderer) {
        this.tileMap = tileMap;
        this.renderer = renderer;
    }

    handle = () => {
        this.renderer.handle(this);
    };
}

class TileMapComponent {
    constructor(rows, cols, tileWidth, tileHeight, data) {
        this.rows = rows;
        this.cols = cols;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.data = data;
    }

    getTile = (x, y) => {
        return this.data[this.cols * y + x];
    };
}

class TileMapRenderSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.gridLine = 1;
    }

    handle(entity) {
        var map = entity.tileMap;
        var offsetX = canvas.width / 2 - (map.cols * map.tileWidth) / 2;
        var offsetY = canvas.height / 2 - (map.rows * map.tileHeight) / 2;
        for (let x = 0; x < map.cols; x++) {
            for (let y = 0; y < map.rows; y++) {
                let tile = map.getTile(x, y);
                if (tile === 0) {
                    ctx.fillStyle = 'grey';
                    ctx.fillRect(
                        offsetX + x * map.tileWidth,
                        offsetY + y * map.tileHeight,
                        map.tileWidth - this.gridLine,
                        map.tileHeight - this.gridLine
                    );
                } else {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(
                        offsetX + x * map.tileWidth,
                        offsetY + y * map.tileHeight,
                        map.tileWidth - this.gridLine,
                        map.tileHeight - this.gridLine
                    );
                }
            }
        }
    }
}

// Initialise -----------------------------------------------------------------
//

var ctx = canvas.getContext('2d');

// Player
//
const sprites = document.getElementById('dungeon-tile-32x32');
const playerSpriteMeta = { row: 0, col: 4, width: 32, height: 32 };
const player = new PlayerEntity(
    // Components
    new PositionComponent(canvas.width / 2, canvas.height / 2),
    new DimensionComponent(playerSpriteMeta.width, playerSpriteMeta.height),
    new VelocityComponent(0, 0),
    // Systems[]
    new ScreenEdgeHandlingSystem(canvas),
    // new TileSpriteRenderSystem(ctx, sprites, playerSpriteMeta),
    new TileCircleRenderSystem(ctx, 5, 'red')
);

// const inputHandler = new CompassMovementSystem(player);
const inputHandler = new OrientationMovementSystem(player);

// Map
//

// prettier-ignore
const map01 = [
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 1, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 1, 1, 1, 1, 1, 1, 1,
];

const map = new TileMapEntity(new TileMapComponent(8, 8, 32, 32, map01), new TileMapRenderSystem(ctx));

// Game Loop ------------------------------------------------------------------
//

function gloop() {
    clear();

    map.handle();
    player.handle();

    requestAnimationFrame(gloop);
}
gloop();
