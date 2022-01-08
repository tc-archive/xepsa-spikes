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

// ctx.fillStyle = 'blue';
// ctx.fillRect(0, 0, canvas.width, canvas.height);

// ctx.beginPath();
// ctx.arc(20, 20, 5, 0, Math.PI * 2);
// ctx.fillStyle = 'red';
// ctx.fill();

// Player Entity --------------------------------------------------------------
//

const player = {
    w: 32,
    h: 32,
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 10,
    dx: 0,
    dy: 0,
};

function drawPlayer() {
    const tiles = document.getElementById('dungeon-tile-32x32');
    const row = 0;
    const col = 4;
    ctx.drawImage(
        // Sprite sheet image.
        tiles,
        // Source coordinates. (x, y, w, h)
        row * player.w,
        col * player.w,
        player.w,
        player.h,
        // Destination coordinates. (x, y, w, h)
        player.x,
        player.y,
        player.w,
        player.h
    );
}

// TODO: Pass in player.
function detectWalls() {
    // Left wall
    if (player.x < 0) {
        player.x = 0;
    }
    // Right Wall
    if (player.x + player.w > canvas.width) {
        player.x = canvas.width - player.w;
    }
    // Top wall
    if (player.y < 0) {
        player.y = 0;
    }
    // Bottom Wall
    if (player.y + player.h > canvas.height) {
        player.y = canvas.height - player.h;
    }
}

function updatePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    detectWalls();
}

// Game Loop ------------------------------------------------------------------
//

var ctx = canvas.getContext('2d');

function gloop() {
    clear();
    drawPlayer();
    updatePlayer();

    requestAnimationFrame(gloop);
}
gloop();

// Player Controls ------------------------------------------------------------
//

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        moveUp();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
        moveDown();
    }
}

function keyUp(e) {
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
        player.dx = 0;
        player.dy = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
