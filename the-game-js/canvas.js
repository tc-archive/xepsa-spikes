import './style.css';

// Graphics Canvas ------------------------------------------------------------
//

// 20x10 - 32px
//
// const canvasCfg = {
//     windowFull: false,
//     windowDim: {
//         width: 640,
//         height: 320,
//     },
// };

// 32x16 - 32px
//
const canvasCfg = {
    windowFull: false,
    windowDim: {
        width: 1024,
        height: 512,
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
        this.rot = (Math.PI * 3) / 2;
        this.dim = dimension;
        this.vel = velocity;
        this.speed = 5;
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

function drawLine(p1, p2, color) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.stroke();
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
    }

    moveBackward() {
        this.entity.vel.dx = -Math.cos(this.entity.rot) * this.entity.speed;
        this.entity.vel.dy = -Math.sin(this.entity.rot) * this.entity.speed;
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
    constructor(pos, rows, cols, tileWidth, tileHeight, data) {
        this.pos = pos;
        this.rows = rows;
        this.cols = cols;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.data = data;
        // this.position
    }

    getTileData = (x, y, offset) => {
        let td;
        const tx = offset ? x + offset?.x : x;
        const ty = offset ? y + offset?.y : y;
        if (tx >= 0 && tx < this.cols && ty >= 0 && ty < this.rows) {
            td = this.data[this.cols * ty + tx];
        }
        return td;
    };

    getTileGeometry = (x, y, offset) => {
        let geom;
        const tx = offset ? x + offset?.x : x;
        const ty = offset ? y + offset?.y : y;
        if (tx >= 0 && tx < this.cols && ty >= 0 && ty < this.rows) {
            geom = [];
            const tl = { x: tx * this.tileWidth, y: ty * this.tileHeight };
            const tr = { x: tl.x + this.tileWidth, y: tl.y };
            const br = { x: tl.x + this.tileWidth, y: tl.y + this.tileHeight };
            const bl = { x: tl.x, y: tl.y + this.tileHeight };
            geom.push(tl, tr, br, bl);
        }
        return geom;
    };
}

class TileMapRenderSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.gridLine = 1;
    }

    handle(entity) {
        var map = entity.tileMap;
        var offsetX = map.pos.x;
        var offsetY = map.pos.y;

        for (let y = 0; y < map.rows; y++) {
            for (let x = 0; x < map.cols; x++) {
                let data = map.getTileData(x, y);
                if (data?.block === 0) {
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

// Edge Entity --------------------------------------------------------------
//

class Point2DComponent {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class EdgeEntity {
    constructor(start, end, renderer) {
        this.start = start;
        this.end = end;
        this.renderer = renderer;
    }

    handle() {
        this.renderer.handle(this);
    }
}

// Adding the renderer to the object makes is easier to customise each object.

// We could have a complex renderer with config values and logic based on those
// values. Alteratively, we could have simple renderers and change what type we
// assign to the object.

class EdgeRenderSystem {
    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options
            ? options
            : {
                  debug: false,
                  color: 'red',
                  size: 2.5,
              };
    }

    handle(entity) {
        if (this?.options?.debug) {
            const color = this.options.color ? this.options.color : 'red';
            const size = this.options.color ? this.options.size : 2.5;

            // Draw Line
            this.ctx.beginPath();
            this.ctx.moveTo(entity.start.x, entity.start.y);
            this.ctx.lineTo(entity.end.x, entity.end.y);
            this.ctx.strokeStyle = this.options.color;
            this.ctx.stroke();

            // Draw Ends
            drawCircle(entity.start, size, this.options.color);
            drawCircle(entity.end, size, this.options.color);
        }
    }
}

// Ray ----------------------------------------------------------------------
//
//
// Props: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
//        https://www.youtube.com/watch?v=TOEi6T2mtHo
//
//
function raycast(ray, edge) {
    const { x: x1, y: y1 } = edge.start;
    const { x: x2, y: y2 } = edge.end;
    const { x: x3, y: y3 } = ray.pos;
    const { x: x4, y: y4 } = ray.dir;

    // Denominator.
    const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (d === 0) {
        // parallel lines.
        return undefined;
    } else {
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d;
        // Only consider 'u > 0' as the ray does not extend backwards.
        if (t > 0 && t < 1 && u > 0) {
            // Use 't point' solution.
            const x = x1 + t * (x2 - x1);
            const y = y1 + t * (y2 - y1);
            return { x, y };
        }
    }
    return undefined;
}

// function raycast(source, destination) {
//     const dx = destination.x - source.x;
//     const dy = destination.y - source.y;
//     const angle = Math.atan2(dy, dx); // NB: 'y' comes first for 'atan2'!
//     const velocity = new Vec2D(Math.cos(angle), Math.sin(angle));
//     return velocity;
// }

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
const playerMovementHandler = new OrientationMovementSystem(player);

// Map
//

// prettier-ignore
const blocks01 = [
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
];

// const blocks01 = [
//     1, 1, 0, 0, 0, 0, 0, 0,
//     1, 0, 0, 0, 1, 1, 1, 0,
//     0, 0, 1, 0, 1, 0, 1, 0,
//     0, 0, 0, 0, 1, 1, 1, 0,
//     0, 0, 0, 0, 0, 0, 0, 0,
//     0, 0, 1, 1, 0, 0, 0, 0,
//     0, 0, 1, 1, 0, 0, 1, 0,
//     0, 0, 0, 0, 0, 0, 1, 0,
//     0, 0, 1, 0, 0, 0, 0, 0
// ];

let idx = -1;
const map01 = blocks01.map((t) => {
    idx++;
    return { block: t, edgeId: [], id: idx };
});

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const mapRows = 8;
const mapColumns = 8;
const mapTileWidth = 32;
const mapTileHeight = 32;
const mapOriginX = canvas.width / 2 - (mapColumns * mapTileWidth) / 2;
const mapOriginY = canvas.height / 2 - (mapRows * mapTileHeight) / 2;
const mapOrigin = new PositionComponent(mapOriginX, mapOriginY);
const map = new TileMapEntity(
    new TileMapComponent(mapOrigin, mapRows, mapColumns, mapTileWidth, mapTileHeight, map01),
    new TileMapRenderSystem(ctx)
);

// Edges
//
const edgeRenderer = new EdgeRenderSystem(ctx, { debug: false });

const randomPoint = () => {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
    };
};

const edges = [];
const addBorderEdges = false;
if (addBorderEdges) {
    const offset = 10;
    const p1 = { x: offset, y: offset };
    const p2 = { x: canvas.width - offset, y: offset };
    const p3 = { x: canvas.width - offset, y: canvas.height - offset };
    const p4 = { x: offset, y: canvas.height - offset };

    const e1 = new EdgeEntity(p1, p2, edgeRenderer);
    const e2 = new EdgeEntity(p2, p3, edgeRenderer);
    const e3 = new EdgeEntity(p3, p4, edgeRenderer);
    const e4 = new EdgeEntity(p4, p1, edgeRenderer);

    edges.push(e1, e2, e3, e4);
}

const addRandomEdges = false;
if (addRandomEdges) {
    const e1 = new EdgeEntity(randomPoint(), randomPoint(), edgeRenderer);
    const e2 = new EdgeEntity(randomPoint(), randomPoint(), edgeRenderer);
    const e3 = new EdgeEntity(randomPoint(), randomPoint(), edgeRenderer);
    const e4 = new EdgeEntity(randomPoint(), randomPoint(), edgeRenderer);
    edges.push(e1, e2, e3, e4);
}

// We could have complex Map cells. Or separate maps that we add together at the end.

const clone = (x) => {
    return JSON.parse(JSON.stringify(x));
};

const buildEdges = (world) => {
    const map = world.tileMap;
    const edges = [];
    let edgeIdx = 0;
    for (let y = 0; y < map.rows; y++) {
        for (let x = 0; x < map.cols; x++) {
            let tile = map.getTileData(x, y);

            let geom = map.getTileGeometry(x, y);

            if (tile.block === 1) {
                let north = map.getTileData(x, y, { x: 0, y: -1 });
                let east = map.getTileData(x, y, { x: 1, y: 0 });
                let south = map.getTileData(x, y, { x: 0, y: 1 });
                let west = map.getTileData(x, y, { x: -1, y: 0 });

                if (!north || north?.block === 0) {
                    if (west && west?.edgeId[NORTH] != null) {
                        let edge = edges[west.edgeId[NORTH]];
                        edge.end = clone(geom[1]);
                        tile.edgeId[NORTH] = west.edgeId[NORTH];
                    } else {
                        let edge = new EdgeEntity(clone(geom[0]), clone(geom[1]), edgeRenderer);
                        edges[edgeIdx] = edge;
                        tile.edgeId[NORTH] = edgeIdx;
                        edgeIdx++;
                    }
                }

                if (!east || east?.block === 0) {
                    if (north && north?.edgeId[EAST] != null) {
                        let edge = edges[north.edgeId[EAST]];
                        edge.end = clone(geom[2]);
                        tile.edgeId[EAST] = north.edgeId[EAST];
                    } else {
                        let edge = new EdgeEntity(clone(geom[1]), clone(geom[2]), edgeRenderer);
                        edges[edgeIdx] = edge;
                        tile.edgeId[EAST] = edgeIdx;
                        edgeIdx++;
                    }
                }

                if (!south || south?.block === 0) {
                    if (west && west?.edgeId[SOUTH] != null) {
                        let edge = edges[west.edgeId[SOUTH]];
                        edge.end = clone(geom[2]);
                        tile.edgeId[SOUTH] = west.edgeId[SOUTH];
                    } else {
                        let edge = new EdgeEntity(clone(geom[3]), clone(geom[2]), edgeRenderer);
                        edges[edgeIdx] = edge;
                        tile.edgeId[SOUTH] = edgeIdx;
                        edgeIdx++;
                    }
                }

                if (!west || west?.block === 0) {
                    if (north && north?.edgeId[WEST] != null) {
                        let edge = edges[north.edgeId[WEST]];
                        edge.end = clone(geom[3]);
                        tile.edgeId[WEST] = north.edgeId[WEST];
                    } else {
                        let edge = new EdgeEntity(clone(geom[0]), clone(geom[3]), edgeRenderer);
                        edges[edgeIdx] = edge;
                        tile.edgeId[WEST] = edgeIdx;
                        edgeIdx++;
                    }
                }
            }
        }
    }
    return edges;
};

const mEdges = buildEdges(map);
mEdges.forEach((edge) => {
    edge.start.x += mapOriginX;
    edge.start.y += mapOriginY;
    edge.end.x += mapOriginX;
    edge.end.y += mapOriginY;
});
edges.push(...mEdges);

// Ray
//
class Raycaster {
    constructor(pos, dir, renderer) {
        this.pos = pos;
        this.dir = dir;
        this.renderer = renderer;
    }

    handle() {
        this.renderer.handle(this);
    }

    lookAt(x, y) {
        // TODO: Normalise to Unit vector.
        this.dir = { x, y };
    }
}

class RaycasterRenderSystem {
    constructor(ctx, radius, color) {
        this.ctx = ctx;
        this.radius = radius;
        this.color = color;
    }

    handle(entity) {
        // drawCircle(entity.pos, this.radius, this.color);
        // drawLine(entity.pos, entity.dir, 'green');
    }
}

const raycasterRenderer = new RaycasterRenderSystem(ctx, 3, 'green');
const raycaster = new Raycaster(
    { x: canvas.width / 2, y: canvas.height / 2 },
    { x: canvas.width / 2 + 10, y: canvas.height / 2 },
    raycasterRenderer
);

class RayCasterMouseLookAtSystem {
    constructor(entity) {
        this.entity = entity;
        canvas.addEventListener('mousemove', (e) => {
            let mpos = getMousePos(canvas, e);
            raycaster.lookAt(mpos.x, mpos.y);
        });
    }
}
const rayMovementHandler = new RayCasterMouseLookAtSystem(raycaster);

const getMousePos = (canvas, evt) => {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
    };
};

// Game Loop ------------------------------------------------------------------
//

function gloop() {
    clear();

    map.handle();
    player.handle();

    raycaster.handle();
    for (let i = 0; i < edges.length; i++) {
        edges[i].handle();
        const hit = raycast(raycaster, edges[i]);
        if (hit) {
            drawCircle(hit, 3, 'pink');
        }
    }

    // let offsetX = canvas.width / 2 - (map.tileMap.cols * map.tileMap.tileWidth) / 2;
    // let offsetY = canvas.height / 2 - (map.tileMap.rows * map.tileMap.tileHeight) / 2;

    // let g1 = map.tileMap.getTileGeometry(0, 0);
    // ctx.fillStyle = 'red';
    // ctx.fillRect(offsetX + g1[0].x, offsetY + g1[0].y, map.tileMap.tileWidth - 1, map.tileMap.tileHeight - 1);

    // let g2 = map.tileMap.getTileGeometry(2, 3);
    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(offsetX + g2[0].x, offsetY + g2[0].y, map.tileMap.tileWidth - 1, map.tileMap.tileHeight - 1);

    // let g3 = map.tileMap.getTileGeometry(5, 5);
    // ctx.fillStyle = 'green';
    // ctx.fillRect(offsetX + g3[0].x, offsetY + g3[0].y, map.tileMap.tileWidth - 1, map.tileMap.tileHeight - 1);

    // let go1 = map.tileMap.getTileGeometry(5, 5, { x: 0, y: -3 });
    // ctx.fillStyle = 'blue';
    // if (go1) {
    //     ctx.fillRect(offsetX + go1[0].x, offsetY + go1[0].y, map.tileMap.tileWidth - 1, map.tileMap.tileHeight - 1);
    // }

    // drawLine(raycaster.pos, raycaster.dir, 'green');
    // const i = intersect(ray, edge);
    // console.log(`Intersect ${i}`);

    requestAnimationFrame(gloop);
}
gloop();
