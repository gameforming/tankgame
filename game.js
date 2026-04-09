// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== TILE SETTINGS =====
const TILE_SIZE = 32;
const MAP_SIZE = 50;

let map = [];

// ===== LOAD IMAGES =====
const tiles = {
    grass: new Image(),
    stone: new Image(),
    planks: new Image()
};

tiles.grass.src = "assets/grass.png";
tiles.stone.src = "assets/stone.png";
tiles.planks.src = "assets/planks.png";

// ===== PLAYER =====
let player = {
    x: 5,
    y: 5,
    speed: 3
};

// ===== INPUT =====
let keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== MAP GENERATION =====
function generateMap() {
    map = [];

    for (let y = 0; y < MAP_SIZE; y++) {
        let row = [];

        for (let x = 0; x < MAP_SIZE; x++) {
            let rand = Math.random();

            if (rand < 0.7) row.push("grass");
            else if (rand < 0.9) row.push("planks");
            else row.push("stone"); // wall
        }

        map.push(row);
    }

    ensurePlayable();
}

// ===== ANTI-TRAP SYSTEM 🔥 =====
function ensurePlayable() {
    // flood fill vanaf player spawn
    let visited = new Set();
    let stack = [{ x: player.x, y: player.y }];

    function key(x, y) {
        return x + "," + y;
    }

    while (stack.length > 0) {
        let { x, y } = stack.pop();

        if (
            x < 0 || y < 0 ||
            x >= MAP_SIZE || y >= MAP_SIZE
        ) continue;

        if (map[y][x] === "stone") continue;

        let k = key(x, y);
        if (visited.has(k)) continue;

        visited.add(k);

        stack.push({ x: x + 1, y: y });
        stack.push({ x: x - 1, y: y });
        stack.push({ x: x, y: y + 1 });
        stack.push({ x: x, y: y - 1 });
    }

    // alles wat niet bereikbaar is → open maken
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            if (!visited.has(x + "," + y)) {
                map[y][x] = "grass";
            }
        }
    }
}

// ===== MOVEMENT =====
function updatePlayer() {
    let newX = player.x;
    let newY = player.y;

    if (keys["w"]) newY -= player.speed * 0.1;
    if (keys["s"]) newY += player.speed * 0.1;
    if (keys["a"]) newX -= player.speed * 0.1;
    if (keys["d"]) newX += player.speed * 0.1;

    // collision met walls
    if (!isWall(newX, player.y)) player.x = newX;
    if (!isWall(player.x, newY)) player.y = newY;
}

// ===== COLLISION =====
function isWall(x, y) {
    let tileX = Math.floor(x);
    let tileY = Math.floor(y);

    if (
        tileX < 0 || tileY < 0 ||
        tileX >= MAP_SIZE || tileY >= MAP_SIZE
    ) return true;

    return map[tileY][tileX] === "stone";
}

// ===== ENEMIES =====
let enemies = [];

function spawnEnemies() {
    enemies = [];

    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * MAP_SIZE,
            y: Math.random() * MAP_SIZE,
            speed: 1 + Math.random()
        });
    }
}

function updateEnemies() {
    enemies.forEach(e => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            let nx = dx / dist;
            let ny = dy / dist;

            let newX = e.x + nx * e.speed * 0.05;
            let newY = e.y + ny * e.speed * 0.05;

            if (!isWall(newX, e.y)) e.x = newX;
            if (!isWall(e.x, newY)) e.y = newY;
        }
    });
}

// ===== DRAW MAP =====
function drawMap() {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            let tile = map[y][x];

            let img = tiles[tile];

            ctx.drawImage(
                img,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
        }
    }
}

// ===== DRAW PLAYER =====
function drawPlayer() {
    ctx.fillStyle = "lime";
    ctx.fillRect(
        player.x * TILE_SIZE,
        player.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );
}

// ===== DRAW ENEMIES =====
function drawEnemies() {
    ctx.fillStyle = "red";

    enemies.forEach(e => {
        ctx.fillRect(
            e.x * TILE_SIZE,
            e.y * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
        );
    });
}

// ===== CAMERA =====
function applyCamera() {
    ctx.setTransform(
        1, 0, 0, 1,
        canvas.width / 2 - player.x * TILE_SIZE,
        canvas.height / 2 - player.y * TILE_SIZE
    );
}

// ===== GAME LOOP =====
function update() {
    updatePlayer();
    updateEnemies();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyCamera();

    drawMap();
    drawTank();
    drawBullets();
    updateBullets();
    drawEnemies();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== INIT =====
function initGame() {
    generateMap();
    spawnEnemies();
    gameLoop();
}
