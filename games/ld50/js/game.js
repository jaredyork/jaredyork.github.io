/**
 * OBJECTS
 */
class Dish extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprDish')
        this.scene.add.existing(this);
        this.setOrigin(0.3, 0.5);
        this.scene.physics.world.enableBody(this);
        this.body.setAllowGravity(false);

        this.hasFocus = false;

        this.fireDelay = 60;
        this.fireTick = this.fireDelay - 1;

        this.rotationSpeed = 0.5;
        this.rotationTarget = this.rotation;
    }

    setFocus(hasFocus) {
        this.hasFocus = hasFocus;
    }
}

class Rocket {
    constructor(scene, x, y, rocketKey, args = {}) {
        this.scene = scene;
        this.xInit = x;
        this.yInit = y;
        this.x = this.xInit;
        this.y = this.yInit;
        this.parts = this.scene.add.group();
        this.rocketKey = rocketKey;


        this.launchDirection = 'TO_RIGHT';
        if (this.xInit < this.scene.scale.width * 0.5) {
            this.launchDirection = 'TO_RIGHT';
        }
        else {
            this.launchDirection = 'TO_LEFT';
        }


        this.angle = -90;
        this.angleTarget = -90;
        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.speedTowardsVelocity = 0;
        this.hasDownlink = false;
        this.hasDownlinkTimeLeft = 0;
        this.hasControl = false;
        this.hasControlTimeLeft = 0;
        this.elapsedTimeSinceDownlink = 0;

        this.destination = args.destination !== undefined ? args.destination : '';
        this.destinationText = this.scene.add.text(
            this.x,
            this.y,
            'TO ' + args.destination + ' ORBIT',
            {
                fontColor: 0xffffff,
                fontSize: 24
            }
        ).setDepth(5).setOrigin(0.5);

        this.iconComsWarning = this.scene.add.sprite(this.x, this.y - 96, 'sprIconComsWarning').setDepth(10).setScale(0.75).setVisible(false);
        this.scene.tweens.add({
            targets     : this.iconComsWarning,
            scale       : 1,
            ease        : 'Linear',
            duration    : 300,
            yoyo: true,
        });

        this.launchParams = {
            gravityTurnStartTime: Phaser.Math.Between(300, 400),
            targetAltitude: Phaser.Math.Between(150, 350)
        };

        

        this.hasLaunched = false;
        this.hadRUD = false;
        this.inOrbit = false;
        this.elapsedTimeSinceLaunch = 0;
        this.downlinkMaxTimeLeft = 200;
        this.hasDownlinkTimeLeft = this.downlinkMaxTimeLeft;

        // Remember, coordinates are defined as the rocket is pointing right
        switch (this.rocketKey) {
            case 'DELTA_II': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprDeltaIIStage1', 'STAGE_1'));

                this.parts.add(new RocketPart(this.scene, this, -12, -5.2, 'sprDeltaIISRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, -12, -2.2, 'sprDeltaIISRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, -12, 2.2, 'sprDeltaIISRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, -12, 5.2, 'sprDeltaIISRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, -12, -5.2, 'sprDeltaIISRB', 'SRB').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, -12, -2.2, 'sprDeltaIISRB', 'SRB').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, -12, 0, 'sprDeltaIISRB', 'SRB').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, -12, 2.2, 'sprDeltaIISRB', 'SRB').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, -12, 5.2, 'sprDeltaIISRB', 'SRB').setDepth(1));


                this.parts.add(new RocketPart(this.scene, this, 34, 0, 'sprDeltaIIStage2', 'STAGE_2'));
                break;
            }

            case 'TITAN_II': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprTitanIIStage1', 'STAGE_1'));
                this.parts.add(new RocketPart(this.scene, this, 34, 0, 'sprTitanIIStage2', 'STAGE_2'));
                break;
            }

            case 'TITAN_IV': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprTitanIVStage1', 'STAGE_1'));
                this.parts.add(new RocketPart(this.scene, this, 0, -7.2, 'sprTitanIVSRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, 0, 7.2, 'sprTitanIVSRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, 34, 0, 'sprTitanIVStage2', 'STAGE_2'));
                break;
            }

            case 'SHUTTLE': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprShuttleOrbiter', 'ORBITER').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, 8, 0, 'sprShuttleExternalTank', 'STAGE_1'));
                this.parts.add(new RocketPart(this.scene, this, 0, -14.4, 'sprSLSSRB', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, 0, 6, 'sprSLSSRB', 'SRB'));
                break;
            }

            case 'DELTA_IV': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprDeltaIVStage1', 'STAGE_1').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, 50, 0, 'sprDeltaIVStage2', 'STAGE_2'));
                break;
            }

            case 'DELTA_IV_HEAVY': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprDeltaIVStage1', 'STAGE_1').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, 50, 0, 'sprDeltaIVStage2', 'STAGE_2'));
                this.parts.add(new RocketPart(this.scene, this, 0, -9.6, 'sprDeltaIVHeavyCBC', 'SRB').setDepth(-1));
                this.parts.add(new RocketPart(this.scene, this, 0, 9.6, 'sprDeltaIVHeavyCBC', 'SRB').setDepth(1));
                break;
            }

            case 'ARIANE': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprArianeStage1', 'STAGE_1'));
                this.parts.add(new RocketPart(this.scene, this, 0, -7.2, 'sprArianeSRBLeft', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, 0, 7.2, 'sprArianeSRBRight', 'SRB'));
                this.parts.add(new RocketPart(this.scene, this, 34, 0, 'sprArianeStage2', 'STAGE_2'));
                break;
            }

            case 'SLS': {
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprSLSStage1', 'STAGE_1'));
                this.parts.add(new RocketPart(this.scene, this, 0, 0, 'sprSLSSRB', 'SRB').setDepth(1));
                this.parts.add(new RocketPart(this.scene, this, 53, 0, 'sprSLSStage2', 'STAGE_2'));
                this.parts.add(new RocketPart(this.scene, this, 62, 0, 'sprSLSCapsule', 'CAPSULE'));
                this.parts.add(new RocketPart(this.scene, this, 67, 0, 'sprSLSEscapeTower', 'ESCAPE_TOWER'));

                break;
            }
        }
    }

    getBottom() {
        let bottom = this.y;

        for (let i = 0; i < this.parts.getChildren().length; i++) {
            let part = this.parts.getChildren()[i];

            bottom = Math.max(bottom, part.y + part.displayHeight * 0.5);
        }

        return bottom;
    }

    getBottomRelative() {
        let bottomRelative = 0;
        
        for (let i = 0; i < this.parts.getChildren().length; i++) {
            let part = this.parts.getChildren()[i];

            bottomRelative = Math.max(bottom, part.yOffset + part.displayHeight * 0.5);
        }

        return bottomRelative;
    }

    launch() {
        this.hasLaunched = true;
    }

    destroyGUI() {
        this.iconComsWarning.destroy();
        this.destinationText.destroy();
    }

    destroy() {
        this.destroyGUI();

        for ( let i = 0; i < this.parts.getChildren().length; i++) {
            let part = this.parts.getChildren()[i];

            part.partDestroy();
            part.destroy();
        }
    }

    decouplePart(partKey) {
        for (let i = 0; i < this.parts.getChildren().length; i++) {
            let part = this.parts.getChildren()[i];

            if (part.partKey == partKey && part.rocket !== null) {
                if (part.rocket !== null) {
                    part.body.velocity.x = Number(JSON.parse(JSON.stringify(this.velocity.x))) * this.scene.game.config.fps.target;
                    part.body.velocity.y = Number(JSON.parse(JSON.stringify(this.velocity.y))) * this.scene.game.config.fps.target;

                    if (part.partKey === 'SRB') {
                        part.body.velocity.x += Phaser.Math.Between(-2, 2);
                        part.body.velocity.y += Phaser.Math.Between(-2, 2);
                    }
                }
                part.onDecouple();
            }
        }
    }

    executeRUD(type) {
        if (!this.hadRUD) {
            this.destroyGUI();

            for (let i = 0; i < this.parts.getChildren().length; i++) {
                let part = this.parts.getChildren()[i];
                this.decouplePart(part.partKey);
                part.body.velocity.x += Phaser.Math.Between(-10, 10);
                part.body.velocity.y += Phaser.Math.Between(-10, 10);
            }

            this.scene.addDeploymentTally('FAILURE');
            this.scene.addLaunchTally('FAILURE');
            this.hadRUD = true;
        }
    }

    setInOrbit() {
        this.inOrbit = true;
        console.log('IN ORBIT');
    }

    update(time, delta) {
        this.rotation = Phaser.Math.DegToRad(this.angle);

        if (this.hasLaunched) {
            this.velocity.x = Math.cos(this.rotation) * this.speedTowardsVelocity;
            this.velocity.y = Math.sin(this.rotation) * this.speedTowardsVelocity;

            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }

        for (let i = 0; i < this.parts.getChildren().length; i++) {
            let part = this.parts.getChildren()[i];

            if (part.rocket !== null) {
                part.rotation = this.rotation;
            }
            part.update();
        }

        if (this.hasLaunched) {
            this.speedTowardsVelocity += 0.00044;

            if (this.hasDownlink && this.hasControl) {
                if (this.elapsedTimeSinceLaunch > 600) {
                    this.decouplePart('SRB');
                }

                let spacecraftAltitude = Math.abs(this.scene.scale.height - this.y);

                if (this.launchDirection === 'TO_RIGHT') {
                    if (this.elapsedTimeSinceLaunch > this.launchParams.gravityTurnStartTime && this.elapsedTimeSinceLaunch < this.launchParams.gravityTurnStartTime * 2) {
                        this.angle += Phaser.Math.Between(1, 10) * 0.0024;
                    }

                    if (this.elapsedTimeSinceLaunch > this.launchParams.gravityTurnStartTime * 2  && this.angle < -25) {
                        this.angle += Phaser.Math.Between(1, 10) * 0.024;
                    }

                    if (this.elapsedTimeSinceLaunch > 1100) {
                        this.decouplePart('STAGE_1');
                    }

                    if (Math.abs(this.scene.scale.height - this.y) > this.launchParams.targetAltitude && this.angle < 0 && this.angle > -180) {
                        //this.angle += 0.05;
                        this.angle += Phaser.Math.Between(1, 5) * 0.024;

                        if (this.velocity.x < (1/spacecraftAltitude) * 100000) {
                            this.velocity.x += 0.014;
                        }
                    }
                }
                else if (this.launchDirection === 'TO_LEFT') {
                    if (this.elapsedTimeSinceLaunch > this.launchParams.gravityTurnStartTime && this.elapsedTimeSinceLaunch < this.launchParams.gravityTurnStartTime * 2) {
                        this.angle -= Phaser.Math.Between(1, 10) * 0.0024;
                    }

                    if (this.elapsedTimeSinceLaunch > this.launchParams.gravityTurnStartTime * 2 && this.angle > -155) {
                        this.angle -= Phaser.Math.Between(1, 10) * 0.024;
                    }

                    if (this.elapsedTimeSinceLaunch > 1100) {
                        this.decouplePart('STAGE_1');
                    }

                    if (Math.abs(this.scene.scale.height - this.y) > this.launchParams.targetAltitude && this.angle < 0 && this.angle > -180) {
                        //this.angle += 0.05;
                        this.angle -= Phaser.Math.Between(1, 5) * 0.024;

                        if (this.velocity.x > -((1/spacecraftAltitude) * 100000)) {
                            this.velocity.x -= 0.014;
                        }
                    }
                }

                if (spacecraftAltitude > 400 && ! this.inOrbit) {
                    this.setInOrbit();
                }
            }
            else if (!this.hasDownlink) {
                if ((Math.abs(this.scene.scale.height - this.y) > 100 ||
                    Math.abs(this.scene.scale.height - this.y) < 250) && Phaser.Math.Between(0, 10000) > 9997) {
                    this.executeRUD('AERO');
                }
            }

            this.elapsedTimeSinceLaunch++;
        }


        this.destinationText.setPosition(this.x, this.y + 96);

        if (this.hasDownlink) {
            if (this.hasDownlinkTimeLeft > 0) {
                if (this.hasDownlinkTimeLeft < this.downlinkMaxTimeLeft * 0.5) {
                }

                this.hasDownlinkTimeLeft--;
            }
            else {
                this.hasDownlink = false;
            }
        }
        else {
            this.elapsedTimeSinceDownlink++;
        }

        if (this.hasControl) {
            if (this.hasControlTimeLeft > 0) {
                this.hasControlTimeLeft--;
            }
            else {
                this.hasControl = false;
            }
        }

        if (this.hadRUD) {
        }
    }
}

class RocketPart extends Phaser.GameObjects.Sprite {
    constructor(scene, rocket, x, y, key, partKey) {
        super(scene, rocket.xInit + x, rocket.yInit + y, key)
        this.scene = scene;

        this.rocket = rocket;
        this.xOffset = x;
        this.yOffset = y;

        this.fallAccelerationTick = 0;
        this.fallAccelerationDelay = 100;

        this.partKey = partKey;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        this.body.setAllowGravity(false);

        this.particles = this.scene.add.particles('sprFire');

        this.emitter = this.particles.createEmitter();
        this.emitter.active = false;
    
        this.emitter.setPosition(400, 300);
        this.emitter.setSpeed(50);
        this.emitter.setBlendMode(Phaser.BlendModes.ADD);


        this.reentryParticles = this.scene.add.particles('sprReentryFire');

        this.reentryEmitter = this.particles.createEmitter();
        this.reentryEmitter.active = false;
    
        this.reentryEmitter.setPosition(400, 300);
        this.reentryEmitter.setSpeed(30);
        this.reentryEmitter.setBlendMode(Phaser.BlendModes.ADD);

        this.canDestroy = false;
    }

    partDestroy() {
        this.particles.destroy();
        this.reentryParticles.destroy();
    }

    onDecouple() {
        if (this.rocket !== null) {
            this.rocket = null;
            this.body.setAllowGravity(true);
            this.body.setDamping(true);
            this.body.setDrag(0.98, 0.98);
        }
    }

    update() {
        if (this.rocket === null) {
            this.xOffset = 0;
            this.yOffset = 0;

            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);

            this.emitter.visible = false;

            if (this.body.velocity.y > 12 && Math.abs(this.scene.scale.height - this.y) < 385) {
                this.reentryEmitter.active = true;
                this.reentryEmitter.setPosition(this.x, this.y);
                this.reentryEmitter.setAngle(Phaser.Math.RadToDeg(this.rotation) + 180 + Phaser.Math.Between(-1, 1));


                if (this.fallAccelerationTick < this.fallAccelerationDelay) {
                    this.fallAccelerationTick++;
                }
                else {
                    if (this.body.velocity.y > 1) {
                        this.body.setAccelerationX(Phaser.Math.Between(-0.1, 0.1)); 
                    }
    
                    this.fallAccelerationTick = 0;
                }

                if (Phaser.Math.Between(0, 10000) > 9900) {
                    this.canDestroy = true;
                }
            }
        }
        else { // if still attached to rocket
            let newRelativeOffset = this.rotatePoint(0, 0, Phaser.Math.DegToRad(this.rocket.angle), { x: this.xOffset, y: this.yOffset });

            this.x = this.rocket.x + newRelativeOffset.x;
            this.y = this.rocket.y + newRelativeOffset.y;

            if (this.partKey === 'SRB') {
                this.emitter.active = true;
    
                let fireEmitterRelativeOffset = this.rotatePoint(0, 0, Phaser.Math.DegToRad(this.rocket.angle), { x: this.xOffset - (this.displayWidth * 0.5), y: this.yOffset });

                this.emitter.setPosition(this.rocket.x + fireEmitterRelativeOffset.x, this.rocket.y + fireEmitterRelativeOffset.y);
                this.emitter.setAngle(Phaser.Math.RadToDeg(this.rotation) + 180 + Phaser.Math.Between(-1, 1));
            }

            if (this.partKey === 'STAGE_1') {
                this.emitter.active = true;
    
                let fireEmitterRelativeOffset = this.rotatePoint(0, 0, Phaser.Math.DegToRad(this.rocket.angle), { x: this.xOffset - (this.displayWidth * 0.5), y: this.yOffset });

                this.emitter.setPosition(this.rocket.x + fireEmitterRelativeOffset.x, this.rocket.y + fireEmitterRelativeOffset.y);
                this.emitter.setAngle(Phaser.Math.RadToDeg(this.rotation) + 180 + Phaser.Math.Between(-1, 1));
            }
        }

        if (this.canDestroy) {
            this.partDestroy();
            this.destroy();
        }
    }

    rotatePoint(cx, cy, angle, point) {
        let s = Math.sin(angle);
        let c = Math.cos(angle);

        // translate point back to origin:
        point.x -= cx;
        point.y -= cy;

        // rotate point
        let xnew = point.x * c - point.y * s;
        let ynew = point.x * s + point.y * c;

        // translate point back:
        point.x = xnew + cx;
        point.y = ynew + cy;
        return point;
    }
}

class Spacecraft extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this);
        this.body.setAllowGravity(false);


        this.particles = this.scene.add.particles('sprReentryFire');

        this.emitter = this.particles.createEmitter();
        this.emitter.active = false;
    
        this.emitter.setSpeed(30);
        this.emitter.setBlendMode(Phaser.BlendModes.ADD);

        this.pulseDelay = 60;
        this.pulseTick = Phaser.Math.Between(0, this.pulseDelay);
    }

    update() {
        if (this.body.velocity.x > 0) {
            if (this.x > this.scene.scale.width) {
                this.x = 0;

                if (this.texture.key === 'sprShuttleOrbiterSide' ||
                    this.texture.key === 'sprShuttleOrbiter') {
                        let shuttleKeys = [
                            'sprShuttleOrbiterSide',
                            'sprShuttleOrbiter'
                        ];
                        
                        this.setTexture(shuttleKeys[Phaser.Math.Between(0, shuttleKeys.length - 1)]);
                    }

                let spacecraftAltitude = Math.abs(this.scene.scale.height - this.y);

                this.y += (1/spacecraftAltitude) * 9000;
            }
        }
        else {
            if (this.x < 0) {
                this.x = this.scene.scale.width;

                if (this.texture.key === 'sprShuttleOrbiterSide' ||
                    this.texture.key === 'sprShuttleOrbiter') {
                        let shuttleKeys = [
                            'sprShuttleOrbiterSide',
                            'sprShuttleOrbiter'
                        ];
                        
                        this.setTexture(shuttleKeys[Phaser.Math.Between(0, shuttleKeys.length - 1)]);
                    }

                let spacecraftAltitude = Math.abs(this.scene.scale.height - this.y);

                this.y += (1/spacecraftAltitude) * 9000;
            }
        }

        if (Math.abs(this.scene.scale.height - this.y) < 385) {
            this.body.setAllowGravity(true);
            this.body.setDrag(0.98, 0.98);
            this.body.setDamping(true);

            this.emitter.active = true;
            this.emitter.setPosition(this.x, this.y);
            this.emitter.setAngle(Phaser.Math.RadToDeg(this.rotation) + 180 + Phaser.Math.Between(-1, 1));

            if (this.y > this.scene.scale.height * 0.75) {
                if (Phaser.Math.Between(0, 10000) > 9980) {
                    this.particles.destroy();
                    this.destroy();
                }
            }
        }
    }
}



/**
 * SCENES
 */
class SceneBoot extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneBoot' });
    }

    preload() {
        let ir = './assets/images/';
        this.load.image('sprScene', ir + 'sprScene.png');
        this.load.image('sprDish', ir + 'sprDish.png');
        this.load.image('sprRadioWave', ir + 'sprRadioWave.png');


        // MAIN MENU SCENE
        this.load.image('sprMainMenuPage', ir + 'sprMainMenuPage.png');


        // TUTORIAL SCENES
        this.load.image('sprTutorialPageIntro', ir + 'sprTutorialPageIntro.png');
        this.load.image('sprTutorialPageDestination', ir + 'sprTutorialPageDestination.png');
        this.load.image('sprTutorialPageSteering', ir + 'sprTutorialPageSteering.png');
        this.load.image('sprTutorialPageOrbits', ir + 'sprTutorialPageOrbits.png');
        this.load.image('sprTutorialPageChangeDish', ir + 'sprTutorialPageChangeDish.png');
        this.load.image('sprTutorialPageSatelliteRadio', ir + 'sprTutorialPageSatelliteRadio.png');
        this.load.image('sprTutorialPageEnd', ir + 'sprTutorialPageEnd.png');


        // FIRED SCENE
        this.load.image('sprFiredPage', ir + 'sprFiredPage.png');


        // BUTTONS
        this.load.image('sprBtnPlay', ir + 'sprBtnPlay.png');
        this.load.image('sprBtnPlayHover', ir + 'sprBtnPlayHover.png');
        this.load.image('sprBtnQuickTutorial', ir + 'sprBtnQuickTutorial.png');
        this.load.image('sprBtnQuickTutorialHover', ir + 'sprBtnQuickTutorialHover.png');
        this.load.image('sprBtnBack', ir + 'sprBtnBack.png');
        this.load.image('sprBtnBackHover', ir + 'sprBtnBackHover.png');
        this.load.image('sprBtnNext', ir + 'sprBtnNext.png');
        this.load.image('sprBtnNextHover', ir + 'sprBtnNextHover.png');
        this.load.image('sprBtnYes', ir + 'sprBtnYes.png');
        this.load.image('sprBtnYesHover', ir + 'sprBtnYesHover.png');
        this.load.image('sprBtnPlayAgain', ir + 'sprBtnPlayAgain.png');
        this.load.image('sprBtnPlayAgainHover', ir + 'sprBtnPlayAgainHover.png');
        this.load.image('sprBtnMainMenu', ir + 'sprBtnMainMenu.png');
        this.load.image('sprBtnMainMenuHover', ir + 'sprBtnMainMenuHover.png');



        // Icons
        this.load.image('sprIconComsWarning', ir + 'sprIconComsWarning.png');
        this.load.image('sprIconComsOutage', ir + 'sprIconComsOutage.png');

        // Particles
        this.load.image('sprFire', ir + 'sprFire.png');
        this.load.image('sprReentryFire', ir + 'sprReentryFire.png');

        // Titan II
        this.load.image('sprTitanIIStage1', ir + 'sprTitanIIStage1.png');
        this.load.image('sprTitanIIStage2', ir + 'sprTitanIIStage2.png');

        // Delta II
        this.load.image('sprDeltaIIStage1', ir + 'sprDeltaIIStage1.png');
        this.load.image('sprDeltaIISRB', ir + 'sprDeltaIISRB.png');
        this.load.image('sprDeltaIIStage2', ir + 'sprDeltaIIStage2.png');

        // Titan IV
        this.load.image('sprTitanIVStage1', ir + 'sprTitanIVStage1.png');
        this.load.image('sprTitanIVSRB', ir + 'sprTitanIVSRB.png');
        this.load.image('sprTitanIVStage2', ir + 'sprTitanIVStage2.png');

        // Shuttle
        this.load.image('sprShuttleOrbiter', ir + 'sprShuttleOrbiter.png');
        this.load.image('sprShuttleOrbiterSide', ir + 'sprShuttleOrbiterSide.png');
        this.load.image('sprShuttleExternalTank', ir + 'sprShuttleExternalTank.png');
        this.load.image('sprShuttleSRB', ir + 'sprShuttleSRB.png');

        // Delta IV
        this.load.image('sprDeltaIVStage1', ir + 'sprDeltaIVStage1.png');
        this.load.image('sprDeltaIVHeavyCBC', ir + 'sprDeltaIVHeavyCBC.png');
        this.load.image('sprDeltaIVStage2', ir + 'sprDeltaIVStage2.png');

        // Ariane
        this.load.image('sprArianeStage1', ir + 'sprArianeStage1.png');
        this.load.image('sprArianeStage2', ir + 'sprArianeStage2.png');
        this.load.image('sprArianeSRBLeft', ir + 'sprArianeSRBLeft.png');
        this.load.image('sprArianeSRBRight', ir + 'sprArianeSRBRight.png');

        // SLS
        this.load.image('sprSLSStage1', ir + 'sprSLSStage1.png');
        this.load.image('sprSLSSRB', ir + 'sprSLSSRB.png');
        this.load.image('sprSLSStage2', ir + 'sprSLSStage2.png');
        this.load.image('sprSLSCapsule', ir + 'sprSLSCapsule.png');
        this.load.image('sprSLSEscapeTower', ir + 'sprSLSEscapeTower.png');


        // Satellites
        this.load.image('sprSatelliteCOM1', ir + 'sprSatelliteCOM1.png');

        

        let ar = 'assets/audio/';
    }

    create() {
        this.scene.start('SceneMainMenu');
    }
}

class MenuButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, defaultKey, hoverKey, callback) {
        super(scene, x, y, defaultKey);
        this.scene = scene;
        this.scene.add.existing(this);

        this.setDepth(1);

        this.defaultKey = defaultKey;
        this.hoverKey = hoverKey;

        this.callback = callback;

        this.setInteractive();
        this.on('pointerover', () => {
            this.setTexture(this.hoverKey);
        });

        this.on('pointerout', () => {
            this.setTexture(this.defaultKey);
        }, this);

        this.on('pointerup', () => {
            if (this.callback !== undefined && this.callback !== null) {
                this.callback();
            }
        }, this);
    }
}

class SceneMainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMainMenu' });
    }

    create() {
        this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'sprMainMenuPage').setDepth(-10);

        this.btnPlay = new MenuButton(this, this.scale.width * 0.5, this.scale.height * 0.45, 'sprBtnPlay', 'sprBtnPlayHover', () => {
            this.scene.start('SceneMain');
        });

        this.btnQuickTutorial = new MenuButton(this, this.scale.width * 0.5, this.scale.height * 0.55, 'sprBtnQuickTutorial', 'sprBtnQuickTutorialHover', () => {
            this.scene.start('SceneTutorial');
        });
    }
}

class SceneTutorial extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneTutorial' });
    }

    showPage(key) {
        this.buttons.clear(true, true);

        this.page = key;

        if (this.pageImage) {
            this.pageImage.setTexture(this.page);
        }
        else {
            this.pageImage = this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, this.page);
        }

        // Create a pagesData object if it doesn't exist already for this page key
        this.pagesData[this.page] = this.pagesData[this.page] !== undefined ? this.pagesData[this.page] : {};

        if (this.pagesData[this.page].init !== undefined) {
            this.pagesData[this.page].init();
        }
    }

    showLastPage() {
        let lastKey = this.pageKeys[this.pageKeys.indexOf(this.page) - 1];
        if (lastKey !== undefined && lastKey !== null) {
            this.showPage(lastKey);
        }
    }

    showNextPage() {
        let nextKey = this.pageKeys[this.pageKeys.indexOf(this.page) + 1];
        if (nextKey !== undefined && nextKey !== null) {
            this.showPage(nextKey);
        }
    }

    create() {
        this.buttons = this.add.group();

        this.pageKeys = [
            'sprTutorialPageIntro',
            'sprTutorialPageDestination',
            'sprTutorialPageSteering',
            'sprTutorialPageOrbits',
            'sprTutorialPageChangeDish',
            'sprTutorialPageSatelliteRadio',
            'sprTutorialPageEnd'
        ];

        this.pagesData = {
            sprTutorialPageIntro: {
                init: () => {
                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageDestination: {
                init: () => {
                    let btnBack = new MenuButton(this, this.scale.width * 0.25, this.scale.height - 70, 'sprBtnBack', 'sprBtnBackHover', () => {
                        this.showLastPage();
                    });
                    this.buttons.add(btnBack);

                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageSteering: {
                init: () => {
                    let btnBack = new MenuButton(this, this.scale.width * 0.25, this.scale.height - 70, 'sprBtnBack', 'sprBtnBackHover', () => {
                        this.showLastPage();
                    });
                    this.buttons.add(btnBack);

                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageOrbits: {
                init: () => {
                    let btnBack = new MenuButton(this, this.scale.width * 0.25, this.scale.height - 70, 'sprBtnBack', 'sprBtnBackHover', () => {
                        this.showLastPage();
                    });
                    this.buttons.add(btnBack);

                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageChangeDish: {
                init: () => {
                    let btnBack = new MenuButton(this, this.scale.width * 0.25, this.scale.height - 70, 'sprBtnBack', 'sprBtnBackHover', () => {
                        this.showLastPage();
                    });
                    this.buttons.add(btnBack);

                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageSatelliteRadio: {
                init: () => {
                    let btnBack = new MenuButton(this, this.scale.width * 0.25, this.scale.height - 70, 'sprBtnBack', 'sprBtnBackHover', () => {
                        this.showLastPage();
                    });
                    this.buttons.add(btnBack);

                    let btnNext = new MenuButton(this, this.scale.width * 0.75, this.scale.height - 70, 'sprBtnNext', 'sprBtnNextHover', () => {
                        this.showNextPage();
                    });
                    this.buttons.add(btnNext);
                }
            },
            sprTutorialPageEnd: {
                init: () => {
                    let btnYes1 = new MenuButton(this, this.scale.width * 0.5, this.scale.height * 0.5, 'sprBtnYes', 'sprBtnYesHover', () => {
                        this.scene.start('SceneMain');
                    });
                    this.buttons.add(btnYes1);

                    let btnYes2 = new MenuButton(this, this.scale.width * 0.5, this.scale.height * 0.65, 'sprBtnYes', 'sprBtnYesHover', () => {
                        this.scene.start('SceneMain');
                    });
                    this.buttons.add(btnYes2);
                }
            }
        };

        this.showPage(this.pageKeys[0]);
    }
}

class SceneFired extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneFired' });
    }

    create() {
        this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'sprFiredPage').setDepth(-10);

        this.btnPlayAgain = new MenuButton(this, this.scale.width * 0.25, this.scale.height * 0.45, 'sprBtnPlayAgain', 'sprBtnPlayAgainHover', () => {
            this.scene.start('SceneMain');
        });

        this.btnMainMenu = new MenuButton(this, this.scale.width * 0.75, this.scale.height * 0.45, 'sprBtnMainMenu', 'sprBtnMainMenuHover', () => {
            this.scene.start('SceneMainMenu');
        });
    }
}

class SceneMain extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMain' });
    }

    addDish(x, y) {
        let dish = new Dish(this, x, y);
        dish.id = this.dishesAutoIncrement;

        this.dishes.add(dish);

        this.dishesAutoIncrement++;

        return dish;
    }

    setDishInFocus(dishTarget) {
        for (let i = 0; i < this.dishes.getChildren().length; i++) {
            let dish = this.dishes.getChildren()[i];

            if (dish.id == dishTarget.id) {
                dish.setFocus(true);
            }
            else {
                dish.setFocus(false);
            }
        }
    }

    addRocket(x, y, rocketKey) {
        let destinationSelected = this.destinationsAvailable[Phaser.Math.Between(0, this.destinationsAvailable.length - 1)];

        let rocket = new Rocket(this, x, y, rocketKey, {
            destination: destinationSelected
        });

        for (let i = 0; i < rocket.parts.getChildren().length; i++) {
            let part = rocket.parts.getChildren()[i];

            this.physics.add.overlap(this.radioWaves, part, function(wave, pt) {
                rocket.hasDownlink = true;
                rocket.hasDownlinkTimeLeft = rocket.downlinkMaxTimeLeft;

                if (wave.getData('dishId') !== undefined) {
                    rocket.hasControl = true;
                    rocket.hasControlTimeLeft = 60;
                }
            }, null, this);
        }

        this.rockets.push(rocket);
        return rocket;
    }

    addSpacecraftDebug(x, y, direction) {
        let spacecraft = new Spacecraft(this, x, y, 'sprSatelliteCOM1');
        spacecraft.id = this.spacecraftAutoIncrement;

        let spacecraftAltitude = Math.abs(this.scale.height - spacecraft.y);

        if (direction === 'TO_LEFT') {
            spacecraft.body.velocity.x = -((1/spacecraftAltitude) * 50000);
        }
        else if (direction === 'TO_RIGHT') {
            spacecraft.body.velocity.x = ((1/spacecraftAltitude) * 50000);
        }

        this.spacecraft.add(spacecraft);

        this.spacecraftAutoIncrement++;

        return spacecraft;
    }

    create() {
        this.dishesAutoIncrement = 0;
        this.spacecraftAutoIncrement = 0;


        this.amountLaunches = 0;
        this.amountSuccessfulLaunches = 0;
        this.amountFailedLaunches = 0;
        this.amountDeployments = 0;
        this.amountSuccessfulDeployments = 0;
        this.amountFailedDeployments = 0;

        this.starsGraphic = this.add.graphics();


        // FUNDS TEXT
        this.funds = 1000000000;
        this.fundsText = this.add.text(
            8,
            8,
            'FUNDS: ' + numberWithCommas(this.funds),
            {
                fontSize: 40
            }
        );
        this.fundsText.setOrigin(0);


        // STATS
        this.statsText = this.add.text(
            this.scale.width * 0.5,
            12,
            'STATS',
            {
                fontSize: 20
            }
        );
        this.statsText.setOrigin(0.5);

        this.amountLaunchesText = this.add.text(
            this.scale.width * 0.5,
            32,
            'Launches: ' + numberWithCommas(this.amountLaunches) + ' (successful: ' + numberWithCommas(this.amountSuccessfulLaunches) + ', failures: ' + numberWithCommas(this.amountFailedLaunches) + ')',
            {
                fontSize: 20
            }
        );
        this.amountLaunchesText.setOrigin(0.5);

        this.amountDeploymentsText = this.add.text(
            this.scale.width * 0.5,
            50,
            'Deployments: ' + numberWithCommas(this.amountDeployments) + ' (successful: ' + numberWithCommas(this.amountSuccessfulDeployments) + ', failures: ' + numberWithCommas(this.amountFailedDeployments) + ')',
            {
                fontSize: 20
            }
        );
        this.amountDeploymentsText.setOrigin(0.5);


        // REPUTATION TEXT
        this.reputation = 10; // -100 to 100
        this.reputationString = '';
        this.reputationText = this.add.text(
            this.scale.width - 16,
            8,
            'REPUTATION: ' + this.reputationString,
            {
                fontSize: 40,
                align: 'right'
            }
        );
        this.reputationText.setOrigin(1, 0);


        for (let i = 0; i < 100; i++) {
            let circle = new Phaser.Geom.Circle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height * 0.75),
                Phaser.Math.Between(1, 1)
            );

            this.starsGraphic.fillStyle(0xffffff, Phaser.Math.Between(0, 10) * 0.1);
            this.starsGraphic.fillCircleShape(circle);
        }

        this.add.image(this.scale.width * 0.5, this.scale.height * 0.5, 'sprScene').setDepth(-10);

        this.dishes = this.add.group();
        this.radioWaves = this.add.group();
        this.rockets = [];
        this.spacecraft = this.add.group();


        // Adding dish from left to right
        this.addDish(this.scale.width * 0.035, this.scale.height * 0.85);
        this.addDish(this.scale.width * 0.37275, this.scale.height * 0.9275);
        this.addDish(this.scale.width * 0.634, this.scale.height * 0.9275);
        this.addDish(this.scale.width * 0.957, this.scale.height * 0.885);

        // Give focus to first dish by default
        this.dishes.getChildren()[0].setFocus(true);


        // Add a rocket




        this.input.on('pointermove', function(pointer) {
            for (let i = 0; i < this.dishes.getChildren().length; i++) {
                let dish = this.dishes.getChildren()[i];

                if (dish.hasFocus) {
                    dish.rotationTarget = Phaser.Math.Angle.BetweenPoints(dish, pointer);
                }
            }
        }, this);

        this.input.on('pointerdown', function(pointer) {
            for (let i = 0; i < this.dishes.getChildren().length; i++) {
                let dish = this.dishes.getChildren()[i];

                if (dish.hasFocus) {
                    let radioWave = this.physics.add.sprite(dish.x, dish.y, 'sprRadioWave');
                    radioWave.setData('dishId', dish.id);
                    radioWave.setRotation(dish.rotation);

                    radioWave.body.velocity.x = Math.cos(dish.rotation) * 1000;
                    radioWave.body.velocity.y = Math.sin(dish.rotation) * 1000;

                    this.radioWaves.add(radioWave);
                }
            }
        }, this);

        this.physics.add.overlap(this.radioWaves, this.dishes, function(wave, dish) {
            if (wave.getData('dishId') != dish.id) { // Set dish in focus
                this.setDishInFocus(dish);
            }
        }, null, this);

        this.physics.add.overlap(this.radioWaves, this.radioWaves, function(wave1, wave2) {
            wave1.destroy();
            wave2.destroy();
        });


        this.destinations = [
            'LOW',
            'MED',
            'HIGH'
        ];
        this.destinationsAvailable = ['LOW'];

        this.launchLocations = [
            { x: this.scale.width * 0.124, y: this.scale.height * 0.95 },
            { x: this.scale.width * 0.158, y: this.scale.height * 0.95 },
            { x: this.scale.width * 0.195, y: this.scale.height * 0.95 },
            { x: this.scale.width * 0.235, y: this.scale.height * 0.95 },
            { x: this.scale.width * 0.5895, y: this.scale.height * 0.95 },
            { x: this.scale.width * 0.903, y: this.scale.height * 0.95 }
        ];

        this.launchVehicles = [
            'TITAN_II',
            'DELTA_II',
            'TITAN_IV',
            'SHUTTLE',
            'DELTA_IV',
            'DELTA_IV_HEAVY',
            'SLS',
            'ARIANE'
        ];

        this.launchVehicleData = {
            TITAN_II: {
                cost: 24400000
            },
            DELTA_II: {
                cost: 51000000
            },
            TITAN_IV: {
                cost: 432000000
            },
            SHUTTLE: {
                cost: 576000000
            },
            ARIANE: {
                cost: 177000000
            },
            DELTA_IV: {
                cost: 164000000
            },
            DELTA_IV_HEAVY: {
                cost: 440000000
            },
            SLS: {
                cost: 1000000000
            }
        };

        this.launchVehiclesAvailable = ['TITAN_II', 'DELTA_II'];



        let launchLocation = this.launchLocations[this.launchLocations.length - 1];

        let firstVehicleToLaunchKey = this.launchVehiclesAvailable[Phaser.Math.Between(0, this.launchVehiclesAvailable.length - 1)];

        let rocket = this.addRocket(launchLocation.x, launchLocation.y, firstVehicleToLaunchKey);
        rocket.launch();
        this.funds -= this.launchVehicleData[firstVehicleToLaunchKey].cost;

        this.time.addEvent({
            delay: 32000,
            callback: function() {
                let launchLocation = this.launchLocations[Phaser.Math.Between(0, this.launchLocations.length - 1)];

                let vehicleToLaunchKey = this.launchVehiclesAvailable[Phaser.Math.Between(0, this.launchVehiclesAvailable.length - 1)];

                let rocket = this.addRocket(launchLocation.x, launchLocation.y, vehicleToLaunchKey);
                rocket.launch();

                this.funds -= this.launchVehicleData[vehicleToLaunchKey].cost;
            },
            callbackScope: this,
            loop: true
        });

        /*
        for (let i = 0; i < 10; i++) {
            let flyDirections = ['TO_LEFT', 'TO_RIGHT'];

            this.addSpacecraftDebug(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), flyDirections[Phaser.Math.Between(0, flyDirections.length - 1)]);
        }*/
    }

    unlockDestination(destinationKey) {
        if (!this.destinationsAvailable.includes(destinationKey)) {
            this.destinationsAvailable.push(destinationKey);
        }
    }

    unlockLaunchVehicle(vehicleKey) {
        if (!this.launchVehiclesAvailable.includes(vehicleKey)) {
            this.launchVehiclesAvailable.push(vehicleKey);
        }
    }

    addLaunchTally(successOrFailure, rocket = null) {
        this.amountLaunches++;

        if (successOrFailure === 'SUCCESS') {
            this.amountSuccessfulLaunches++;

            if (this.amountSuccessfulLaunches > 2) {
                this.unlockLaunchVehicle('DELTA_II');
                this.unlockDestination('MED');
            }

            if (this.amountSuccessfulLaunches > 4) {
                this.unlockLaunchVehicle('TITAN_IV');
                this.unlockDestination('HIGH');
            }

            if (this.amountSuccessfulLaunches > 7) {
                this.unlockLaunchVehicle('DELTA_IV');
                this.unlockLaunchVehicle('ARIANE');
            }

            if (this.amountSuccessfulLaunches > 10) {
                this.unlockLaunchVehicle('DELTA_IV_HEAVY');
            }

            if (this.amountSuccessfulLaunches > 15) {
                this.unlockLaunchVehicle('SHUTTLE');
            }

            if (this.amountSuccessfulLaunches > 20) {
                this.unlockLaunchVehicle('SLS');
            }

            if (rocket !== null) {
                this.funds += Math.round(this.launchVehicleData[rocket.rocketKey].cost * 1.5);
            }

            this.reputation += 4;
        }
        else if (successOrFailure === 'FAILURE') {
            this.amountFailedLaunches++;

            if (rocket !== null) {
                this.funds -= Math.round(this.launchVehicleData[rocket.rocketKey].cost * 1.5);
            }

            this.reputation -= 6;
        }
    }

    addDeploymentTally(successOrFailure) {
        this.amountDeployments++;

        if (successOrFailure === 'SUCCESS') {
            this.amountSuccessfulDeployments++;

            this.reputation += 4;
        }
        else if (successOrFailure === 'FAILURE') {
            this.amountFailedDeployments++;

            this.reputation -= 4;
        }
    }

    update(time, delta) {
        for (let i = 0; i < this.dishes.getChildren().length; i++) {
            let dish = this.dishes.getChildren()[i];

            if (dish.hasFocus) {
                dish.setTint(0xffff00);
            }
            else {
                dish.setTint(0xffffff);
            }

            dish.rotation = Phaser.Math.Angle.RotateTo(
                dish.rotation,
                dish.rotationTarget,
                dish.rotationSpeed * 0.005 * delta
            );
        }

        for (let i = 0; i < this.radioWaves.getChildren().length; i++) {
            let radioWave = this.radioWaves.getChildren()[i];

            radioWave.setScale(radioWave.scaleX + 0.1, radioWave.scaleY + 0.1);
            radioWave.alpha -= 0.03;

            if (radioWave.alpha <= 0) {
                radioWave.destroy();
                i--;
            }
        }

        for (let i = 0; i < this.rockets.length; i++) {
            let rocket = this.rockets[i];

            rocket.update();


            let spacecraftKey = 'sprSatelliteCOM1';

            if (rocket.rocketKey === 'SHUTTLE') {
                spacecraftKey = 'sprShuttleOrbiterSide';
            }

            if (rocket.x < 0) {
                let stage2 = null;
                for (let j = 0; j < rocket.parts.getChildren().length; j++) {
                    if (rocket.parts.getChildren()[j].partKey === 'STAGE_2' ||
                        rocket.parts.getChildren()[j].partKey === 'CAPSULE' ||
                        rocket.parts.getChildren()[j].partKey === 'ORBITER') {
                        stage2 = rocket.parts.getChildren()[j];
                    }
                }

                if (stage2 !== null) {
                    let spacecraft = new Spacecraft(this, this.scale.width, rocket.y, spacecraftKey);
                    spacecraft.id = this.spacecraftAutoIncrement;

                    let spacecraftAltitude = Math.abs(this.scale.height - spacecraft.y);

                    spacecraft.body.velocity.x = -((1/spacecraftAltitude) * 50000);

                    if (spacecraftAltitude > 300) {
                        switch (rocket.destination) {
                            case 'LOW': {
                                if (rocket.y >= 644 && rocket.y < 967) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }

                            case 'MED': {
                                if (rocket.y >= 340 && rocket.y < 644) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }

                            case 'HIGH': {
                                if (rocket.y >= 0 && rocket.y < 340) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }
                        }

                        this.addLaunchTally('SUCCESS', rocket);
                    }
                    else {
                        this.addLaunchTally('FAILURE', rocket);
                        this.addDeploymentTally('FAILURE');
                    }


                    this.spacecraft.add(spacecraft);
                    this.spacecraftAutoIncrement++;
                }

                rocket.canDestroy = true;
            }
            else if (rocket.x > this.scale.width) {
                let stage2 = null;
                for (let j = 0; j < rocket.parts.getChildren().length; j++) {
                    if (rocket.parts.getChildren()[j].partKey === 'STAGE_2' ||
                        rocket.parts.getChildren()[j].partKey === 'CAPSULE' ||
                        rocket.parts.getChildren()[j].partKey === 'ORBITER') {
                        stage2 = rocket.parts.getChildren()[j];
                    }
                }

                if (stage2 !== null) {
                    let spacecraft = new Spacecraft(this, 0, rocket.y, spacecraftKey);

                    let spacecraftAltitude = Math.abs(this.scale.height - spacecraft.y);

                    if (spacecraftAltitude > 300) {
                        switch (rocket.destination) {
                            case 'LOW': {
                                if (rocket.y >= 644 && rocket.y < 967) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }

                            case 'MED': {
                                if (rocket.y >= 340 && rocket.y < 644) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }

                            case 'HIGH': {
                                if (rocket.y >= 0 && rocket.y < 340) {
                                    this.addDeploymentTally('SUCCESS');
                                }
                                else {
                                    this.addDeploymentTally('FAILURE');
                                }
                                break;
                            }
                        }

                        this.addLaunchTally('SUCCESS', rocket);
                    }
                    else {
                        this.addLaunchTally('FAILURE', rocket);
                        this.addDeploymentTally('FAILURE');
                    }


                    spacecraft.body.velocity.x = (1/spacecraftAltitude) * 50000;

                    this.spacecraft.add(spacecraft);
                }

                rocket.canDestroy = true;
            }

            if (rocket.y < -96 || rocket.y > this.scale.height) {
                this.addLaunchTally('FAILURE', rocket);
                this.addDeploymentTally('FAILURE', rocket);

                rocket.canDestroy = true;
            }
        }

        for (let i = 0; i < this.rockets.length; i++) {
            let rocket = this.rockets[i];

            if (rocket.canDestroy) {
                rocket.destroy();
                this.rockets.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.spacecraft.getChildren().length; i++) {
            let spacecraft = this.spacecraft.getChildren()[i];

            spacecraft.update(time, delta);

            if (spacecraft.pulseTick < spacecraft.pulseDelay) {
                spacecraft.pulseTick++;
            }
            else {
                let nearestSpacecraft = null;

                // Check if there is a nearest spacecraft
                for (let j = 0; j < this.spacecraft.getChildren().length; j++) {
                    let otherSpacecraft = this.spacecraft.getChildren()[j];

                    if (spacecraft.id != otherSpacecraft.id) {
                        if (nearestSpacecraft === undefined || nearestSpacecraft === null) {
                            nearestSpacecraft = otherSpacecraft;
                        }
                        else {
                            if (Phaser.Math.Distance.Between(spacecraft.x, spacecraft.y, otherSpacecraft.x, otherSpacecraft.y) < Phaser.Math.Distance.Between(spacecraft.x, spacecraft.y, nearestSpacecraft.x, nearestSpacecraft.y)) {
                                nearestSpacecraft = otherSpacecraft;
                            }
                        }
                    }
                }

                // Check if there's a nearest rocket
                for (let j = 0; j < this.rockets.length; j++) {
                    let rocket = this.rockets[j];

                    for (let k = 0; k < rocket.parts.getChildren().length; k++) {
                        let part = rocket.parts.getChildren()[k];

                        if (part.rocket !== null &&
                            (part.partKey === 'CAPSULE' ||
                            part.partKey === 'STAGE_2')) {
                            let otherSpacecraft = part;

                            if (spacecraft.id != otherSpacecraft.id) {
                                if (nearestSpacecraft === undefined || nearestSpacecraft === null) {
                                    nearestSpacecraft = otherSpacecraft;
                                }
                                else {
                                    if (Phaser.Math.Distance.Between(spacecraft.x, spacecraft.y, otherSpacecraft.x, otherSpacecraft.y) < Phaser.Math.Distance.Between(spacecraft.x, spacecraft.y, nearestSpacecraft.x, nearestSpacecraft.y)) {
                                        nearestSpacecraft = otherSpacecraft;
                                    }
                                }
                            }
                        }
                    }
                }

                if (nearestSpacecraft !== null) {
                    if (Phaser.Math.Distance.Between(spacecraft.x, spacecraft.y, nearestSpacecraft.x, nearestSpacecraft.y) < 200) {
                        let radioWave = this.physics.add.sprite(spacecraft.x, spacecraft.y, 'sprRadioWave');
                        radioWave.alpha = 0.4;
                        radioWave.setData('spacecraftId', spacecraft.id);

                        let angleToNearestSpacecraft = Math.atan2(
                            nearestSpacecraft.y - spacecraft.y,
                            nearestSpacecraft.x - spacecraft.x
                        );

                        radioWave.body.velocity.x = Math.cos(angleToNearestSpacecraft) * 1000;
                        radioWave.body.velocity.y = Math.sin(angleToNearestSpacecraft) * 1000;

                        radioWave.setRotation(angleToNearestSpacecraft);

                        this.radioWaves.add(radioWave);
                    }
                }

                spacecraft.pulseTick = 0;
            }
        }

        this.fundsText.setText('Funds: ' + numberWithCommas(this.funds));

        if (this.reputation < -80) {
            this.reputationString = 'Very Bad';
        }
        else if (this.reputation < -60) {
            this.reputationString = 'Bad'
        }
        else if (this.reputation < -40) {
            this.reputationString = 'Not great';
        }
        else if (this.reputation < -20) {
            this.reputationString = 'Could be better';
        }
        else if (this.reputation < 0) {
            this.reputationString = 'Average';
        }
        else if (this.reputation < 20) {
            this.reputationString = 'Average';
        }
        else if (this.reputation < 40) {
            this.reputationString = 'Good';
        }
        else if (this.reputation < 60) {
            this.reputationString = 'Doing well';
        }
        else if (this.reputation < 80) {
            this.reputationString = 'Doing great';
        }
        else if (this.reputation < 100) {
            this.reputationString = 'Doing fantastic';
        }
        else if (this.reputation >= 100) {
            this.reputationString = 'Doing amazing';
        }
        this.reputationText.setText('Reputation: ' + this.reputationString);

        if (this.funds <= 0) {
            this.reputation -= 0.0001;
        }

        if (this.funds <= 300000000) {
            this.reputation -= 0.001;
        }

        if (this.reputation < -100) {
            this.scene.start('SceneFired');
        }



        this.amountLaunchesText.setText('Launches: ' + numberWithCommas(this.amountLaunches) + ' (successful: ' + numberWithCommas(this.amountSuccessfulLaunches) + ', failures: ' + numberWithCommas(this.amountFailedLaunches) + ')');

        this.amountDeploymentsText.setText('Deployments: ' + numberWithCommas(this.amountDeployments) + ' (successful: ' + numberWithCommas(this.amountSuccessfulDeployments) + ', failures: ' + numberWithCommas(this.amountFailedDeployments) + ')');
    }
}


let game = null;
document.addEventListener('DOMContentLoaded', function() {
    let config = {
        type: Phaser.AUTO,
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1920,
            height: 1440
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 2 }
            }
        },
        backgroundColor: '#000000',
        parent: 'game-container',
        title: 'Launch, Launch, Repeat.',
        scene: [SceneBoot, SceneMainMenu, SceneTutorial, SceneMain, SceneFired]
    };

    game = new Phaser.Game(config);
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}