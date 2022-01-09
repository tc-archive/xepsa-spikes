import './style.css';

// Graphics Canvas ------------------------------------------------------------
//

var canvas = document.querySelector('#the-game-canvas');
var resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
        this.dim = dimension;
        this.vel = velocity;
        this.speed = 10;
        // Systems
        this.screenEdgeHandler = screenEdgeHandler;
        this.renderer = renderer;
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

class UserInputMovementSystem {
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
        // Bottom Wall
        if (entity.pos.y + entity.dim.h > canvas.height) {
            entity.pos.y = canvas.height - entity.dim.h;
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
    // Systems
    new TileSpriteRenderSystem(ctx, sprites, playerSpriteMeta),
    new ScreenEdgeHandlingSystem(canvas)
);
const inputHandler = new UserInputMovementSystem(player);

// Game Loop ------------------------------------------------------------------
//

function gloop() {
    clear();

    player.handle();

    requestAnimationFrame(gloop);
}
gloop();
