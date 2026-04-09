// ===== Basic Tank =====
class BasicTank {
    constructor() {
        this.speed = 3;           // tanksnelheid
        this.damage = 3;          // damage per bullet

        // load tank sprite
        this.image = new Image();
        this.image.src = "assets/basic.png";

        // cooldown
        this.cooldown = 0;
        this.maxCooldown = 40; // frames tussen schoten
    }

    // check of tank kan schieten
    canShoot() {
        return this.cooldown <= 0;
    }

    // trigger cooldown na schot
    onShoot() {
        this.cooldown = this.maxCooldown;
    }

    // update cooldown
    update() {
        if (this.cooldown > 0) this.cooldown--;
    }

    // percentage voor HUD
    getCooldownPercent() {
        return 1 - (this.cooldown / this.maxCooldown);
    }
}

// ===== Active tank instellen =====
let currentTank = new BasicTank();
