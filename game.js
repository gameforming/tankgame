// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== PLAYER =====
let player = {
    x: 5,
    y: 5,
    angle: 0
};

// ===== INPUT =====
let keys = {};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== MAP =====
const TILE_SIZE = 32;
const MAP_SIZE = 50;
let map = [];

const tiles = {
    grass: new Image(),
    stone: new Image(),
    planks: new Image()
};

tiles.grass.src = "assets/grass.png";
tiles.stone.src = "assets/stone.png";
tiles.planks.src = "assets/planks.png";

function generateMap() {
    map = [];

    for (let y = 0; y < MAP_SIZE; y++) {
        let row = [];

        for (let x = 0; x < MAP_SIZE; x++) {
            let r = Math.random();
            if (r < 0.7) row.push("grass");
            else if (r < 0.9) row.push("planks");
            else row.push("stone");
        }

        map.push(row);
    }
}

// ===== COLLISION =====
function isWall(x, y) {
    let tx = Math.floor(x);
    let ty = Math.floor(y);

    if (tx < 0 || ty < 0 || tx >= MAP_SIZE || ty >= MAP_SIZE) return true;

    return map[ty][tx] === "stone";
}

// ===== MOVEMENT (REAL TANK STYLE 🔥) =====
function updatePlayer() {
    let moveSpeed = currentTank.speed * 0.05;
    let rotSpeed = 0.05;

    // draaien
    if (keys["arrowleft"]) player.angle -= rotSpeed;
    if (keys["arrowright"]) player.angle += rotSpeed;

    // vooruit / achteruit
    let dx = Math.cos(player.angle) * moveSpeed;
    let dy = Math.sin(player.angle) * moveSpeed;

    if (keys["w"]) {
        if (!isWall(player.x + dx, player.y)) player.x += dx;
        if (!isWall(player.x, player.y + dy)) player.y += dy;
    }

    if (keys["s"]) {
        if (!isWall(player.x - dx, player.y)) player.x -= dx;
        if (!isWall(player.x, player.y - dy)) player.y -= dy;
    }
}

// ===== BULLETS =====
let bullets = [];

function shoot() {
    if (!currentTank.canShoot()) return;

    let speed = 0.5;

    bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * speed,
        vy: Math.sin(player.angle) * speed
    });

    currentTank.onShoot();
}

// SPATIE = schieten
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        shoot();
    }
});

// ===== UPDATE BULLETS =====
function updateBullets() {
    bullets.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
    });
}

// ===== DRAW BULLETS =====
function drawBullets() {
    ctx.fillStyle = "yellow";

    bullets.forEach(b => {
        ctx.fillRect(
            b.x * TILE_SIZE,
            b.y * TILE_SIZE,
            5,
            5
        );
    });
}

// ===== DRAW MAP =====
function drawMap() {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            ctx.drawImage(
                tiles[map[y][x]],
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );
        }
    }
}

// ===== DRAW TANK =====
function drawTank() {
    if (!currentTank.image) return;

    let px = player.x * TILE_SIZE;
    let py = player.y * TILE_SIZE;

    ctx.save();

    ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2);
    ctx.rotate(player.angle);

    ctx.drawImage(
        currentTank.image,
        -TILE_SIZE / 2,
        -TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE
    );

    ctx.restore();
}

// ===== COOLDOWN BAR =====
function drawCooldown() {
    let cd = currentTank.getCooldownPercent();

    ctx.setTransform(1,0,0,1,0,0);

    ctx.fillStyle = "black";
    ctx.fillRect(20, 60, 200, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, 60, 200 * cd, 20);
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
    updateBullets();
    currentTank.update();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    applyCamera();
    drawMap();
    drawTank();
    drawBullets();

    drawCooldown();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== INIT =====
function initGame() {
    generateMap();
    gameLoop();
}
