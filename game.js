// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== TILE MAP =====
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

// ===== PLAYER =====
let player = { x: 5, y: 5, angle: 0 };

// ===== INPUT =====
let keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== BULLETS =====
let bullets = [];

// ===== ENEMIES =====
let enemies = [];

// ===== TANK SYSTEM (active tank) =====
let currentTank; // dit wordt in basictank.js gezet

// ===== MAP GENERATION =====
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

// ===== MOVEMENT (tank style) =====
function updatePlayer() {
    if (!currentTank) return;
    let moveSpeed = currentTank.speed * 0.05;
    let rotSpeed = 0.05;

    // draaien
    if (keys["arrowleft"]) player.angle -= rotSpeed;
    if (keys["arrowright"]) player.angle += rotSpeed;

    // vooruit/achteruit
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

// ===== SHOOTING =====
function shoot() {
    if (!currentTank || !currentTank.canShoot()) return;

    let speed = 0.5;
    bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * speed,
        vy: Math.sin(player.angle) * speed
    });

    currentTank.onShoot();
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") shoot();
});

// ===== BULLETS =====
function updateBullets() {
    bullets.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;

        // walls
        if (isWall(b.x, b.y)) bullets.splice(i, 1);
    });
}

// ===== ENEMIES =====
function spawnEnemies() {
    enemies = [];
    for (let i = 0; i < 5; i++) {
        let e = {
            x: Math.random() * MAP_SIZE,
            y: Math.random() * MAP_SIZE,
            hp: 10
        };
        // voorkom spawnen in walls
        let tx = Math.floor(e.x);
        let ty = Math.floor(e.y);
        if (map[ty][tx] === "stone") {
            e.x = tx + 1;
            e.y = ty + 1;
        }
        enemies.push(e);
    }
}

// ===== BULLET COLLISIONS =====
function checkBulletCollisions() {
    bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            let dx = b.x - e.x;
            let dy = b.y - e.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 0.5) {
                e.hp -= currentTank.damage;
                bullets.splice(bi,1);
                if (e.hp <= 0) enemies.splice(ei,1);
            }
        });
    });
}

// ===== UPDATE ENEMIES (AI) =====
function updateEnemies() {
    enemies.forEach(e => {
        let dx = player.x - e.x;
        let dy = player.y - e.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
            let nx = dx / dist;
            let ny = dy / dist;
            let speed = 0.02;
            if (!isWall(e.x + nx*speed, e.y)) e.x += nx*speed;
            if (!isWall(e.x, e.y + ny*speed)) e.y += ny*speed;
        }
    });
}

// ===== DRAW =====
function drawMap() {
    for (let y=0;y<MAP_SIZE;y++){
        for (let x=0;x<MAP_SIZE;x++){
            ctx.drawImage(tiles[map[y][x]], x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawTank() {
    if (!currentTank || !currentTank.image) return;
    let px = player.x*TILE_SIZE;
    let py = player.y*TILE_SIZE;

    ctx.save();
    ctx.translate(px + TILE_SIZE/2, py + TILE_SIZE/2);
    ctx.rotate(player.angle);
    ctx.drawImage(currentTank.image, -TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
    ctx.restore();
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(b=>{
        ctx.fillRect(b.x*TILE_SIZE, b.y*TILE_SIZE, 5,5);
    });
}

function drawEnemies() {
    enemies.forEach(e=>{
        ctx.fillStyle="red";
        ctx.fillRect(e.x*TILE_SIZE,e.y*TILE_SIZE,TILE_SIZE,TILE_SIZE);

        // hp bar
        ctx.fillStyle="black";
        ctx.fillRect(e.x*TILE_SIZE, e.y*TILE_SIZE-5, TILE_SIZE,4);
        ctx.fillStyle="lime";
        ctx.fillRect(e.x*TILE_SIZE, e.y*TILE_SIZE-5, TILE_SIZE*(e.hp/10),4);
    });
}

// ===== COOLDOWN BAR =====
function drawCooldown() {
    if (!currentTank) return;
    let cd = currentTank.getCooldownPercent();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="black";
    ctx.fillRect(20,60,200,20);
    ctx.fillStyle="lime";
    ctx.fillRect(20,60,200*cd,20);
}

// ===== CAMERA =====
function applyCamera() {
    ctx.setTransform(1,0,0,1, canvas.width/2 - player.x*TILE_SIZE, canvas.height/2 - player.y*TILE_SIZE);
}

// ===== GAME LOOP =====
function update() {
    updatePlayer();
    updateBullets();
    checkBulletCollisions();
    updateEnemies();
    if(currentTank) currentTank.update();
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    applyCamera();
    drawMap();
    drawTank();
    drawBullets();
    drawEnemies();
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
    spawnEnemies();
    gameLoop();
}
