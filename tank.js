// ===== TANK SYSTEM =====

class Tank {
    constructor(data) {
        this.name = data.name;
        this.imageSrc = data.image;
        this.speed = data.speed;
        this.damage = data.damage;

        this.image = new Image();
        this.image.src = this.imageSrc;

        this.processedImage = null;

        this.loadAndProcessImage();
    }

    // 🔥 TRANSPARENCY FIX
    loadAndProcessImage() {
        this.image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = this.image.width;
            canvas.height = this.image.height;

            ctx.drawImage(this.image, 0, 0);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let data = imageData.data;

            // 👉 hier bepalen we welke kleur transparant wordt
            // voorbeeld: witte achtergrond verwijderen
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];

                // 🔥 pas dit aan indien nodig
                if (r > 200 && g > 200 && b > 200) {
                    data[i + 3] = 0; // alpha = 0 (transparant)
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // nieuwe image maken
            this.processedImage = new Image();
            this.processedImage.src = canvas.toDataURL();
        };
    }
}

// ===== JOUW TANKS =====

const Tanks = {
    basic: new Tank({
        name: "Basic Tank",
        image: "assets/basic.png",
        speed: 3,
        damage: 5
    })
};

// ===== PLAYER TANK KOPPELEN =====

let currentTank = Tanks.basic;

// ===== SHOOTING SYSTEM (basis) =====

let bullets = [];

window.addEventListener("click", (e) => {
    shoot();
});

function shoot() {
    bullets.push({
        x: player.x,
        y: player.y,
        vx: 0.3,
        vy: 0
    });
}

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

// ===== DRAW TANK =====

function drawTank() {
    if (!currentTank.processedImage) return;

    ctx.drawImage(
        currentTank.processedImage,
        player.x * TILE_SIZE,
        player.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );
}
