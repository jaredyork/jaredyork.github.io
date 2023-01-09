
let COLORS = {
    RED: '#ff0000',
    GREEN: '#00ff00',
    BLUE: '#0000ff'
};

let CELL_SIZE = 64;
let MAP_WIDTH = 0;
let MAP_HEIGHT = 0;

function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

function snapToGrid(val, cellSize) {
    return Math.round(val / cellSize) * cellSize;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function isColliding( obj1, obj2 ) {
    let obj1X = obj1.x - (CELL_SIZE * 0.25);
    let obj1Y = obj1.y - (CELL_SIZE * 0.25);
    let obj1W = obj1.displayWidth - (CELL_SIZE * 0.5);
    let obj1H = obj1.displayHeight - (CELL_SIZE * 0.5);

    let obj2X = obj2.x - (CELL_SIZE * 0.25);
    let obj2Y = obj2.y - (CELL_SIZE * 0.25);
    let obj2W = obj2.displayWidth - (CELL_SIZE * 0.5);
    let obj2H = obj2.displayHeight - (CELL_SIZE * 0.5);

    if (
        obj1X < obj2X + obj2W &&
        obj1X + obj1W > obj2X &&
        obj1Y < obj2Y + obj2H &&
        obj1H + obj1Y > obj2Y
    ) {
        return true;
    } else {
        return false;
    }
}


class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.scene = scene;

        this.currentTint = 0xffffff;

        this.lastX = this.x;
        this.lastY = this.y;

        this.isDead = false;
        this.canDestroy = false;
        this.timeNoMove = 0;
    }
}

class Pixel extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.scene = scene;

        this.x += CELL_SIZE * 0.5;
        this.y += CELL_SIZE * 0.5;

        this.color = COLORS[Object.keys(COLORS)[Phaser.Math.Between(0, Object.keys(COLORS).length - 1)] ];
        this.currentTint = parseInt(this.color.replace(/^#/, ''), 16);
        this.setTint(this.currentTint);

        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);

        this.alpha = 0;

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 3000,
            ease: 'Power2'
        }, this);

        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            ease: 'Sine.easeInOut',
            duration: 300,
            repeat: -1,
            yoyo: true,
            repeatDelay: 500
        }, this);
    }
}

class Player extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
        this.scene = scene;

        this.x += CELL_SIZE * 0.5;
        this.y += CELL_SIZE * 0.5;

        this.color = '#555555';
        this.setColor(this.color);

        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);

        this.fakeX = this.x;
        this.fakeY = this.y;
    }

    setColor(color) {
        this.color = color;
        this.currentTint = parseInt(this.color.replace(/^#/, ''), 16);
        this.setTint(this.currentTint);
    }
}

class Enemy extends Entity {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        this.x += CELL_SIZE * 0.5;
        this.y += CELL_SIZE * 0.5;

        this.color = COLORS[Object.keys(COLORS)[Phaser.Math.Between(0, Object.keys(COLORS).length - 1)] ];
        this.currentTint = parseInt(this.color.replace(/^#/, ''), 16);
        this.setTint(this.currentTint);

        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);

        this.fakeX = this.x;
        this.fakeY = this.y;

        this.isFriendly = false;
        this.isRevealed = false;

        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 3000,
            ease: 'Power2',
            onComplete: function() {
                this.isRevealed = true;
            },
            onCompleteScope: this
        }, this);
    }

    setFriendly() {
        this.setTexture('sprEnemyFriendly');
        this.isFriendly = true;
    }

    setUnfriendly() {
        this.setTexture('sprEnemy');
        this.isFriendly = false;
    }
}

class SceneBoot extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneBoot' });
    }

    preload() {
        let ir = 'assets/images/';

        this.load.image('sprTitle', ir + 'sprTitle.png');

        this.load.image('sprGrid', ir + 'sprGrid.png');

        this.load.image('sprLetterR', ir + 'sprLetterR.png');
        this.load.image('sprLetterG', ir + 'sprLetterG.png');
        this.load.image('sprLetterB', ir + 'sprLetterB.png');

        this.load.image('sprArrowW', ir + 'sprArrowW.png');
        this.load.image('sprArrowS', ir + 'sprArrowS.png');
        this.load.image('sprArrowA', ir + 'sprArrowA.png');
        this.load.image('sprArrowD', ir + 'sprArrowD.png');
        this.load.image('sprPixel', ir + 'sprPixel.png');
        this.load.image('sprPlayer', ir + 'sprPlayer.png');
        this.load.image('sprEnemy', ir + 'sprEnemy.png');
        this.load.image('sprEnemyFriendly', ir + 'sprEnemyFriendly.png');
    }

    create() {
        this.scene.start('SceneMain');
    }
}

class SceneGameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGameOver' });
    }

    create() {
        this.canUseControls = false;

        this.time.addEvent({
            delay: 1000,
            callback: function() {
                this.canUseControls = true;
            },
            callbackScope: this,
            loop: false
        });

        MAP_WIDTH = this.scale.width / CELL_SIZE;
        MAP_HEIGHT = this.scale.height / CELL_SIZE;

        this.grid = this.add.group();
        
        this.pixelsList = {
            RED: this.add.group(),
            GREEN: this.add.group(),
            BLUE: this.add.group()
        };

        for (let x = 0; x < MAP_WIDTH; x++) {
            for (let y = 0; y < MAP_HEIGHT; y++) {
                let cell = this.add.sprite(
                    x * CELL_SIZE + (CELL_SIZE * 0.5),
                    y * CELL_SIZE + (CELL_SIZE * 0.5),
                    'sprGrid'
                ).setDepth(-1);

                this.grid.add(cell);
            }
        }

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.25, 'GAMEOVER', {
            color: '#0000ff',
            fontSize: 140,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.pressAnyKeyText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'PRESS ANY KEY TO CONTINUE', {
            color: '#ffffff',
            fontSize: 48,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: function() {
                this.pressAnyKeyText.setVisible( ! this.pressAnyKeyText.visible );
            },
            callbackScope: this
        });

        this.input.keyboard.on('keyup', function() {
            if (this.canUseControls) {
                this.scene.start('SceneMain');
            }
        }, this);
    }
}

class SceneWon extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneWon' });
    }

    create() {
        this.canUseControls = false;

        this.time.addEvent({
            delay: 1000,
            callback: function() {
                this.canUseControls = true;
            },
            callbackScope: this,
            loop: false
        });

        var r1 = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff).setOrigin(0).setDepth(-5);

        MAP_WIDTH = this.scale.width / CELL_SIZE;
        MAP_HEIGHT = this.scale.height / CELL_SIZE;

        this.grid = this.add.group();
        
        this.pixelsList = {
            RED: this.add.group(),
            GREEN: this.add.group(),
            BLUE: this.add.group()
        };

        for (let x = 0; x < MAP_WIDTH; x++) {
            for (let y = 0; y < MAP_HEIGHT; y++) {
                let cell = this.add.sprite(
                    x * CELL_SIZE + (CELL_SIZE * 0.5),
                    y * CELL_SIZE + (CELL_SIZE * 0.5),
                    'sprGrid'
                ).setDepth(-1);

                this.grid.add(cell);
            }
        }

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.25, 'VIRUS REMOVED SUCCESSFULLY!', {
            color: '#00c220',
            fontSize: 48,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.3825, 'CONGRATULATIONS.', {
            color: '#00c220',
            fontSize: 48,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.pressAnyKeyText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'PRESS ANY KEY TO CONTINUE', {
            color: '#0000ff',
            fontSize: 48,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: function() {
                this.pressAnyKeyText.setVisible( ! this.pressAnyKeyText.visible );
            },
            callbackScope: this
        });

        this.input.keyboard.on('keyup', function() {
            if (this.canUseControls) {
                this.scene.start('SceneMain');
            }
        }, this);
    }
}

class SceneMain extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMain' });
    }

    create() {
        this.hasStarted = false;
        this.hasWon = false;

        MAP_WIDTH = this.scale.width / CELL_SIZE;
        MAP_HEIGHT = this.scale.height / CELL_SIZE;

        this.grid = this.add.group();
        
        this.pixelsList = {
            RED: this.add.group(),
            GREEN: this.add.group(),
            BLUE: this.add.group()
        };

        for (let x = 0; x < MAP_WIDTH; x++) {
            for (let y = 0; y < MAP_HEIGHT; y++) {
                let cell = this.add.sprite(
                    x * CELL_SIZE + (CELL_SIZE * 0.5),
                    y * CELL_SIZE + (CELL_SIZE * 0.5),
                    'sprGrid'
                ).setDepth(-1);

                this.grid.add(cell);
            }
        }


        this.showTitle = true;
        this.title = this.add.image(this.scale.width * 0.5, this.scale.height * 0.25, 'sprTitle').setScale(0.5).setDepth(30);
        this.madeWithLove = this.add.text(this.scale.width * 0.5, this.scale.height * 0.9, 'MADE WITH <3 BY JARED YORK FOR LUDUM DARE 52.', {
            color: '#ffffff',
            fontSize: 32,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.copyText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.95, '(C) 2023 JARED YORK', {
            color: '#0000ff',
            fontSize: 32,
            fontFamily: 'arcadepi'
        }).setOrigin(0.5);

        this.controlsIcons = this.add.group();
        this.burnIn = this.add.group();
        this.pixels = this.add.group();
        this.enemies = this.add.group();


        this.player = new Player(this, (this.scale.width / 2) - (CELL_SIZE * 0.5), this.scale.height / 2 - (CELL_SIZE * 0.5), 'sprPlayer');
        
        this.player.x = snapToGrid(this.player.fakeX, CELL_SIZE) + (CELL_SIZE * 0.5);
        this.player.y = snapToGrid(this.player.fakeY, CELL_SIZE) + (CELL_SIZE * 0.5);

        this.showControls = true;
        this.controlsIcons.add(this.add.image(this.player.x, this.player.y - CELL_SIZE, 'sprArrowW'));
        this.controlsIcons.add(this.add.image(this.player.x, this.player.y + CELL_SIZE, 'sprArrowS'));
        this.controlsIcons.add(this.add.image(this.player.x - CELL_SIZE, this.player.y, 'sprArrowA'));
        this.controlsIcons.add(this.add.image(this.player.x + CELL_SIZE, this.player.y, 'sprArrowD'));



        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    start() {
        this.maxScore = {
            RED: 10,
            GREEN: 10,
            BLUE: 10
        };

        this.score = {
            RED: 0,
            GREEN: 0,
            BLUE: 0
        };

        for ( const key of Object.keys( this.score ) ) {
            this.updateScoreDisplay(key);
        }


        this.speedMultiplier = 1;

        var r1 = this.add.rectangle(0, 0, this.scale.width, 64, 0x000000).setOrigin(0, 0);

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: function() {
                let pixel = new Pixel(
                    this,
                    Phaser.Math.Between(1, MAP_WIDTH - 1) * CELL_SIZE,
                    Phaser.Math.Between(1, MAP_HEIGHT - 2) * CELL_SIZE,
                    'sprPixel'
                );

                this.pixels.add(pixel);
            },
            callbackScope: this,
        });

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: function() {
                let enemy = new Enemy(
                    this,
                    Phaser.Math.Between(0, MAP_WIDTH - 1) * CELL_SIZE,
                    Phaser.Math.Between(0, MAP_HEIGHT - 2) * CELL_SIZE,
                    'sprEnemy'
                );

                this.enemies.add(enemy);
            },
            callbackScope: this,
        });

        this.title.destroy();
        this.madeWithLove.destroy();
        this.copyText.destroy();

        this.hasStarted = true;
    }

    addPixelToScore(color, amount = 1) {
        this.score[color] += amount;
        
        if (this.score['RED'] >= this.maxScore['RED'] &&
            this.score['GREEN'] >= this.maxScore['GREEN'] &&
            this.score['BLUE'] >= this.maxScore['BLUE']) {
            
            this.enemies.clear(true, true);

            this.time.addEvent({
                delay: 3000,
                callback: function() {
                    this.scene.start('SceneWon');
                },
                callbackScope: this,
                loop: false
            });

            this.hasWon = true;
        }

        this.score[color] = clamp(this.score[color], 0, this.maxScore[color]);

        this.updateScoreDisplay(color);
    }

    updateScoreDisplay(color) {
        this.pixelsList[color].clear(true, true);

        let colorYOffsets = {
            RED: 0,
            GREEN: 16 + 4,
            BLUE: 32 + 8
        };

        let label = this.add.image(8, 4 + colorYOffsets[color], 'sprLetter' + color.substring(0, 1).toUpperCase()).setOrigin(0).setDepth(15);
        label.displayWidth = 16;
        label.displayHeight = 16;

        for (let i = 0; i < this.maxScore[color]; i++) {
            let pixelBg = this.add.image(32 + (i * 16), 4 + colorYOffsets[color], 'sprPixel').setOrigin(0).setDepth(15);
            pixelBg.displayWidth = 16;
            pixelBg.displayHeight = 16;
            pixelBg.setTint(0x444444);
            this.pixelsList[color].add(pixelBg);
        }

        for (let i = 0; i < this.score[color]; i++) {
            let pixel = this.add.image(32 + (i * 16), 4 + colorYOffsets[color], 'sprPixel').setOrigin(0).setDepth(20);
            pixel.displayWidth = 16;
            pixel.displayHeight = 16;
            pixel.setTint( parseInt(COLORS[color].replace(/^#/, ''), 16) );
            this.pixelsList[color].add(pixel);
        }
    }

    updateInstanceBurnIn(x, y, instance) {
        if (instance.x != instance.lastX ||
            instance.y != instance.lastY) {
         
            instance.timeNoMove = 0;
        }

        if (instance.timeNoMove > 100) {
            let foundExistingBurnIn = false;

            for (let i = 0; i < this.burnIn.getChildren().length; i++) {
                let burnIn = this.burnIn.getChildren()[i];

                if (burnIn.x == x && burnIn.y == y) {
                    foundExistingBurnIn = true;

                    burnIn.setTexture(instance.texture.key);
                    if (burnIn.alpha < 0.3) {
                        burnIn.alpha += 0.0001;
                    }
                }
            }

            if ( ! foundExistingBurnIn ) {
                let burnIn = this.add.sprite(x, y, instance.texture.key).setAlpha(1);
                burnIn.setScale(instance.scaleX, instance.scaleY);

                // Phaser stores corner tints in BGR order
                burnIn.setTint(instance.currentTint);

                burnIn.setAlpha(instance.alpha * 0.01);
                burnIn.setDepth(10);
                this.burnIn.add(burnIn);
            }
        }
    }

    setDead() {
        this.player.isDead = true;

        this.time.addEvent({
            delay: 3000,
            callback: function() {
                this.scene.start('SceneGameOver');
            },
            callbackScope: this,
            loop: false
        });
    }

    update() {
        if ( ! this.hasStarted) {
            let hDir = (-this.keyA.isDown) + this.keyD.isDown;
            let vDir = (-this.keyW.isDown) + this.keyS.isDown;

            if (hDir != 0 || vDir != 0) {
                this.start();
            }

            return;
        }

        for (let i = 0; i < this.pixels.getChildren().length; i++) {
            let pixel = this.pixels.getChildren()[i];

            pixel.timeNoMove++;

            if ( ! this.player.isDead && isColliding(this.player, pixel)) {
                this.speedMultiplier += 0.1;

                this.player.setColor(pixel.color);

                this.addPixelToScore(Object.keys(COLORS)[Object.values(COLORS).indexOf(pixel.color)]);

                pixel.canDestroy = true;
            }

            if (pixel.canDestroy) {
                pixel.destroy();
                i--;
            }
        }

        for (let i = 0; i < this.enemies.getChildren().length; i++) {
            let enemy = this.enemies.getChildren()[i];

            if ( this.player.color === enemy.color ) {
                if ( ! enemy.isFriendly) {
                    enemy.setFriendly();
                }
            }
            else {
                if (enemy.isFriendly) {
                    enemy.setUnfriendly();
                }
            }

            // Only chase player if not the same color
            if ( ! this.player.isDead && ! enemy.isFriendly ) {
                let dx = this.player.x - enemy.x;
                let dy = this.player.y - enemy.y;

                let angle = Math.atan2(dx, dy);

                let vx = Math.sin(angle) * this.speedMultiplier;
                let vy = Math.cos(angle) * this.speedMultiplier;

                if (vx < 0) {
                    enemy.setScale(-1, enemy.scaleY);
                }
                else if (vx > 0) {
                    enemy.setScale(1, enemy.scaleY);
                }

                if (vy < 0) {
                    enemy.setScale(enemy.scaleX, -1);
                }
                else if (vy > 0) {
                    enemy.setScale(enemy.scaleX, 1);
                }

                enemy.fakeX += vx;
                enemy.fakeY += vy;
            }

            enemy.lastX = enemy.x;
            enemy.lastY = enemy.y;

            enemy.x = snapToGrid(enemy.fakeX, CELL_SIZE) + (CELL_SIZE * 0.5);
            enemy.y = snapToGrid(enemy.fakeY, CELL_SIZE) + (CELL_SIZE * 0.5);

            this.updateInstanceBurnIn(enemy.x, enemy.y, enemy);

            if ( ! this.player.isDead && isColliding(this.player, enemy)) {
                if (this.player.color === enemy.color) {
                    this.addPixelToScore(Object.keys(COLORS)[Object.values(COLORS).indexOf(enemy.color)]);
                    enemy.canDestroy = true;
                }
                else {
                    if (enemy.isRevealed) {
                        this.setDead();
                    }
                }
            }

            enemy.timeNoMove++;

            if (enemy.canDestroy) {
                enemy.destroy();
                i--;
            }
        }

        let speed = 2 * this.speedMultiplier;
        let hDir = (-this.keyA.isDown) + this.keyD.isDown;
        let vDir = (-this.keyW.isDown) + this.keyS.isDown;
        let moveDir = hDir + vDir;

        if (hDir === -1) {
            this.player.setScale(-1, this.player.scaleY);
        }
        else if (hDir === 1) {
            this.player.setScale(1, this.player.scaleY);
        }

        let hVel = hDir * speed;
        let vVel = vDir * speed;

        this.player.fakeX += hVel;
        this.player.fakeY += vVel;

        if (hDir != 0 || vDir != 0) {
            if (this.showControls) {
                this.controlsIcons.clear(true, true);
                this.showControls = false;
            }
        }

        if (hVel < 0) {
            this.player.setScale(-1, this.player.scaleY);
        }
        else if (hVel > 0) {
            this.player.setScale(1, this.player.scaleY);
        }

        if (vVel < 0) {
            this.player.setScale(this.player.scaleX, -1);
        }
        else if (vVel > 0) {
            this.player.setScale(this.player.scaleX, 1);
        }

        this.player.lastX = this.player.x;
        this.player.lastY = this.player.y;

        this.player.x = snapToGrid(this.player.fakeX, CELL_SIZE) + (CELL_SIZE * 0.5);
        this.player.y = snapToGrid(this.player.fakeY, CELL_SIZE) + (CELL_SIZE * 0.5);

        this.player.x = clamp(this.player.x, CELL_SIZE * 0.5, this.scale.width - (CELL_SIZE * 0.5));
        this.player.y = clamp(this.player.y, CELL_SIZE + (CELL_SIZE * 0.5), this.scale.height - (CELL_SIZE * 0.5));

        this.player.timeNoMove++;

        if (this.player.isDead) {
            this.player.setAlpha(0);
        }

        this.updateInstanceBurnIn(this.player.x, this.player.y, this.player);
    }
}

let game = null;
document.addEventListener('DOMContentLoaded', function () {
    let config = {
        type: Phaser.AUTO,
        scale: {
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 960
        },
        backgroundColor: '#222',
        pixelArt: true,
        physics: {
            arcade: {
                gravity: { x: 0, y: 0 }
            },
            default: 'arcade'
        },
        scene: [SceneBoot, SceneMain, SceneWon, SceneGameOver]
    };

    game = new Phaser.Game(config);
});


