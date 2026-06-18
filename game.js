/**
 * Joan Pintor - Rooftop Dodger
 * Core Game Engine Logic
 */

// --- Audio Controller (Web Audio API Synthesizer) ---
class AudioController {
    constructor() {
        this.ctx = null;
        try {
            this.muted = localStorage.getItem('joan_pintor_muted') === 'true';
        } catch (e) {
            this.muted = false;
        }
        this.updateMuteButtonUI();
    }

    init() {
        try {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (e) {
            console.warn("AudioContext init failed:", e);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        try {
            localStorage.setItem('joan_pintor_muted', this.muted);
        } catch (e) {}
        this.updateMuteButtonUI();
        this.playClick();
    }

    updateMuteButtonUI() {
        const btn = document.getElementById('btn-mute');
        if (btn) {
            btn.textContent = this.muted ? '🔇' : '🔊';
        }
    }

    playClick() {
        try {
            this.init();
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);
        } catch (e) {
            console.warn("Error playing click:", e);
        }
    }

    playDrop() {
        try {
            this.init();
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.linearRampToValueAtTime(120, now + 0.25);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
            
            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {
            console.warn("Error playing drop:", e);
        }
    }

    playSplat() {
        try {
            this.init();
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            // Wet noise burst synthesis
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.linearRampToValueAtTime(150, now + 0.12);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            noise.start(now);
        } catch (e) {
            console.warn("Error playing splat:", e);
        }
    }

    playHit() {
        try {
            this.init();
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(160, now);
            osc1.frequency.linearRampToValueAtTime(40, now + 0.35);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(90, now);
            osc2.frequency.linearRampToValueAtTime(20, now + 0.35);
            
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.35);
            osc2.stop(now + 0.35);
        } catch (e) {
            console.warn("Error playing hit:", e);
        }
    }

    playLevelUp() {
        try {
            this.init();
            if (this.muted || !this.ctx) return;
            const now = this.ctx.currentTime;
            
            const tones = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 arpeggio
            tones.forEach((freq, idx) => {
                const toneTime = now + (idx * 0.08);
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, toneTime);
                
                gain.gain.setValueAtTime(0.06, toneTime);
                gain.gain.linearRampToValueAtTime(0.001, toneTime + 0.15);
                
                osc.start(toneTime);
                osc.stop(toneTime + 0.15);
            });
        } catch (e) {
            console.warn("Error playing levelUp:", e);
        }
    }
}

// --- Pixel Art Characters Data ---
const SPRITES = {
    // 16x16 Pixel Art Player (Idle)
    playerIdle: [
        "..HHHHHH........",
        ".HHHHHHHH.......",
        "HHWWWWWWWH......",
        "HWWWWWWWWWH.....",
        "HWHHHHHHHWH.....",
        "HWHHHHHHHWH.....",
        ".FEEEEEEEF......",
        ".FEYEYEYEF......",
        ".FEEYYYEEF......",
        "..EEEEEEE.......",
        "..SSSSSSS.......",
        ".SSSSSSSSS......",
        ".OOSSSSOO.......",
        ".OOSSSSOO.......",
        ".OOSSSSOO.......",
        ".BB....BB......."
    ],
    // 16x16 Pixel Art Player (Walk Frame 1)
    playerWalk1: [
        "..HHHHHH........",
        ".HHHHHHHH.......",
        "HHWWWWWWWH......",
        "HWWWWWWWWWH.....",
        "HWHHHHHHHWH.....",
        "HWHHHHHHHWH.....",
        ".FEEEEEEEF......",
        ".FEYEYEYEF......",
        ".FEEYYYEEF......",
        "..EEEEEEE.......",
        "..SSSSSSS.......",
        ".SSSSSSSSS......",
        ".OOSSSSOO.......",
        "..OSSSSO........",
        "..OSSSSO........",
        "..BBB.BB........"
    ],
    // 16x16 Pixel Art Player (Walk Frame 2)
    playerWalk2: [
        "..HHHHHH........",
        ".HHHHHHHH.......",
        "HHWWWWWWWH......",
        "HWWWWWWWWWH.....",
        "HWHHHHHHHWH.....",
        "HWHHHHHHHWH.....",
        ".FEEEEEEEF......",
        ".FEYEYEYEF......",
        ".FEEYYYEEF......",
        "..EEEEEEE.......",
        "..SSSSSSS.......",
        ".SSSSSSSSS......",
        "..OOSSSSOO......",
        "...OSSSSO.......",
        "...OSSSSO.......",
        "....BB.BBB......"
    ],
    
    // 24x24 Pixel Art Joan Pintor (Rooftop Artist)
    joanIdle: [
        "......BBBBBBBB..........",
        ".....BBBBBBBBBB.........",
        "....BBBBBBBBBBBB........",
        "....CCCCCCCCCCCC........",
        "....CCCCCCCCCCCC........",
        "....CCEEEEEEEECC........",
        "....CCEYEYEYEECC........",
        "....CCEEEYYYEECC........",
        ".....EEEEEEEEEE.........",
        ".....EEEEFEEEEE.........",
        "......EEEEEEEE..........",
        ".....OOOOOOOOOO.........",
        "....OOOOOOOOOOOO........",
        "...OOOOSSSSOOOOO........",
        "...OOOOSSSSOOOOO........",
        "...OOOOSSSSOOOOO........",
        "...OOOOSSSSOOOOO........",
        "....OOOSSSSOOOO.........",
        "....OOOSSSSOOOO.........",
        ".....OOSSSSOOO..........",
        ".....KK....KK...",
        ".....KK....KK...",
        "....KKK....KKK..",
        "....KKK....KKK.."
    ]
};

// Character Sprite Color Palette
const COLOR_MAP = {
    'H': '#64748b', // Helmet Gray
    'W': '#ffffff', // Highlight White
    'E': '#ffd1a9', // Skin tone
    'F': '#78350f', // Brown hair
    'Y': '#000000', // Black eyes
    'S': '#ef4444', // Red shirt
    'O': '#1e3a8a', // Denim Blue
    'B': '#451a03', // Dark brown boots/hair
    'C': '#00d5ff', // Cyan bandana
    'K': '#78350f', // Joan's boots
    '.': null       // Transparent
};

// --- Game Engine ---
class JoanPintorGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set logical/virtual game resolution (aspect ratio 9:16)
        this.logicalWidth = 540;
        this.logicalHeight = 960;
        
        this.audio = new AudioController();
        
        // Game states
        this.gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        try {
            this.highScore = parseInt(localStorage.getItem('joan_pintor_highscore')) || 0;
        } catch (e) {
            this.highScore = 0;
        }
        
        // Gameplay objects
        this.playerX = this.logicalWidth / 2;
        this.playerTargetX = this.playerX;
        this.playerSpeed = 0;
        this.playerMaxSpeed = 7.5;
        this.playerFriction = 0.85;
        this.playerAcceleration = 0.9;
        this.playerWidth = 46;
        this.playerHeight = 62;
        this.playerDirection = 1; // -1: Left, 1: Right
        
        // Invulnerability and Paint cover
        this.invulnerabilityTime = 0;
        this.paintCoverColor = null;
        this.paintCoverTime = 0;
        
        // Screen Shake
        this.shakeTime = 0;
        this.shakeMagnitude = 0;
        
        // Joan Pintor
        this.joanX = this.logicalWidth / 2;
        this.joanTargetX = this.joanX;
        this.joanSpeed = 3;
        this.joanWidth = 60;
        this.joanHeight = 80;
        this.joanThrowProgress = 0; // Animates throwing motion
        this.joanThrowing = false;
        
        // Spawn configuration
        this.rollers = [];
        this.paintStreaks = []; // Background drips running down facade
        this.particles = [];
        this.scorePopups = []; // Floating numbers (+100)
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 2200; // ms
        
        // Input tracking
        this.keys = {};
        this.touchLeft = false;
        this.touchRight = false;
        
        // Colors array for paint
        this.paintColors = ['#f8c922', '#00d5ff', '#e82c88', '#3cd070']; // Yellow, Cyan, Magenta, Green
        
        // Decorative building details
        this.generateBuildingWindows();
        this.streetCars = [
            { x: 40, y: 880, color: '#f5b041', speed: 0, scale: 0.85, dir: 1 }, // Yellow car
            { x: 440, y: 910, color: '#3498db', speed: 0, scale: 0.9, dir: -1 } // Blue car
        ];
        
        this.bindEvents();
        this.resize();
        
        // Initialize UI values
        document.getElementById('high-score-val').textContent = this.highScore;
        
        // Start Game loop
        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }
    
    bindEvents() {
        // Window events
        window.addEventListener('resize', () => this.resize());
        
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.gameState === 'PLAYING') {
                if (e.code === 'KeyP' || e.code === 'Escape') this.pauseGame();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // HUD Click Actions
        document.getElementById('btn-mute').addEventListener('click', (e) => {
            e.stopPropagation();
            this.audio.toggleMute();
        });
        
        document.getElementById('btn-pause').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.gameState === 'PLAYING') this.pauseGame();
        });
        
        // Screen Overlay buttons
        document.getElementById('btn-start').addEventListener('click', () => {
            this.audio.playClick();
            this.startGame();
        });
        
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.audio.playClick();
            this.resumeGame();
        });
        
        document.getElementById('btn-restart-pause').addEventListener('click', () => {
            this.audio.playClick();
            this.startGame();
        });
        
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.audio.playClick();
            this.startGame();
        });
        
        document.getElementById('btn-exit').addEventListener('click', () => {
            this.audio.playClick();
            this.setGameState('START');
        });
        
        // Touch input zones
        const leftZone = document.getElementById('zone-left');
        const rightZone = document.getElementById('zone-right');
        
        leftZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchLeft = true;
        });
        leftZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchLeft = false;
        });
        leftZone.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.touchLeft = false;
        });
        
        rightZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchRight = true;
        });
        rightZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchRight = false;
        });
        rightZone.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.touchRight = false;
        });
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Physical dimensions matching display size * device pixel ratio
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Normalise scale for clean rendering
        this.ctx.imageSmoothingEnabled = false;
    }
    
    setGameState(state) {
        this.gameState = state;
        
        // Hide all screens
        document.getElementById('screen-start').classList.add('hidden');
        document.getElementById('screen-start').classList.remove('active');
        document.getElementById('screen-pause').classList.add('hidden');
        document.getElementById('screen-pause').classList.remove('active');
        document.getElementById('screen-gameover').classList.add('hidden');
        document.getElementById('screen-gameover').classList.remove('active');
        document.getElementById('hud').classList.add('hidden');
        
        if (state === 'START') {
            document.getElementById('screen-start').classList.add('active');
            document.getElementById('screen-start').classList.remove('hidden');
            document.getElementById('high-score-val').textContent = this.highScore;
        } else if (state === 'PLAYING') {
            document.getElementById('hud').classList.remove('hidden');
        } else if (state === 'PAUSED') {
            document.getElementById('hud').classList.remove('hidden');
            document.getElementById('screen-pause').classList.add('active');
            document.getElementById('screen-pause').classList.remove('hidden');
        } else if (state === 'GAMEOVER') {
            document.getElementById('screen-gameover').classList.add('active');
            document.getElementById('screen-gameover').classList.remove('hidden');
            
            document.getElementById('final-score-val').textContent = this.score;
            document.getElementById('final-level-val').textContent = this.level;
            
            const badge = document.getElementById('new-record-badge');
            if (this.score > this.highScore) {
                this.highScore = this.score;
                try {
                    localStorage.setItem('joan_pintor_highscore', this.highScore);
                } catch (e) {}
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.playerX = this.logicalWidth / 2;
        this.playerTargetX = this.playerX;
        this.playerSpeed = 0;
        this.touchLeft = false;
        this.touchRight = false;
        
        this.rollers = [];
        this.paintStreaks = []; // Reset streaks so clean building starts
        this.particles = [];
        this.scorePopups = [];
        
        this.joanX = this.logicalWidth / 2;
        this.joanTargetX = this.joanX;
        this.joanThrowing = false;
        this.joanThrowProgress = 0;
        
        this.spawnInterval = 2200;
        this.lastSpawnTime = 0;
        
        this.paintCoverColor = null;
        this.paintCoverTime = 0;
        this.invulnerabilityTime = 0;
        this.shakeTime = 0;
        
        // Update HUD
        document.getElementById('score-val').textContent = this.score;
        document.getElementById('level-val').textContent = this.level;
        document.getElementById('lives-val').textContent = this.lives;
        
        this.audio.playLevelUp(); // Starting jingle
        this.setGameState('PLAYING');
    }
    
    pauseGame() {
        this.setGameState('PAUSED');
    }
    
    resumeGame() {
        this.setGameState('PLAYING');
    }
    
    // --- Facade Decoration Generators ---
    generateBuildingWindows() {
        this.windows = [];
        const rows = [250, 450, 650]; // Y positions of window levels
        const cols = [130, 270, 410]; // X positions of columns
        
        rows.forEach((y) => {
            cols.forEach((x) => {
                // Randomly open/close shutters for variety
                this.windows.push({
                    x: x,
                    y: y,
                    isOpenLeft: Math.random() > 0.4,
                    isOpenRight: Math.random() > 0.4,
                    balconyWidth: 70,
                    balconyHeight: 25
                });
            });
        });
    }
    
    // --- Main Game Loop ---
    loop(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;
        
        try {
            this.update(time, dt);
            this.draw();
        } catch (e) {
            console.error("Game loop error:", e);
        }
        
        requestAnimationFrame((t) => this.loop(t));
    }
    
    // --- Update Logic ---
    update(time, dt) {
        if (this.gameState !== 'PLAYING') return;
        
        // Time tickers
        if (this.invulnerabilityTime > 0) this.invulnerabilityTime -= dt;
        if (this.paintCoverTime > 0) {
            this.paintCoverTime -= dt;
            if (this.paintCoverTime <= 0) this.paintCoverColor = null;
        }
        if (this.shakeTime > 0) this.shakeTime -= dt;
        
        // Update Player Physics
        this.updatePlayer(dt);
        
        // Update Joan Pintor (AI movements and drops)
        this.updateJoan(time, dt);
        
        // Update Game Objects (Rollers, Streaks, Particles, Popups)
        this.updateGameObjects(time, dt);
        
        // Check collisions
        this.checkCollisions();
    }
    
    updatePlayer(dt) {
        let moveDir = 0;
        
        // Keyboard controls
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            moveDir = -1;
            this.playerDirection = -1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            moveDir = 1;
            this.playerDirection = 1;
        }
        
        // Touch controls (combines with keyboard)
        if (this.touchLeft) {
            moveDir = -1;
            this.playerDirection = -1;
        } else if (this.touchRight) {
            moveDir = 1;
            this.playerDirection = 1;
        }
        
        // Apply acceleration & friction
        if (moveDir !== 0) {
            this.playerSpeed += moveDir * this.playerAcceleration;
            // Cap at max speed
            this.playerSpeed = Math.max(-this.playerMaxSpeed, Math.min(this.playerMaxSpeed, this.playerSpeed));
        } else {
            this.playerSpeed *= this.playerFriction;
        }
        
        // Apply speed to position
        this.playerX += this.playerSpeed;
        
        // Screen bounds (leaving street padding)
        const minX = 60 + this.playerWidth / 2;
        const maxX = 480 - this.playerWidth / 2;
        
        if (this.playerX < minX) {
            this.playerX = minX;
            this.playerSpeed = 0;
        } else if (this.playerX > maxX) {
            this.playerX = maxX;
            this.playerSpeed = 0;
        }
    }
    
    updateJoan(time, dt) {
        // Joan Pintor moves on roof (X: 80 to 460)
        const minX = 90;
        const maxX = 450;
        
        // Handle throwing state animation
        if (this.joanThrowing) {
            this.joanThrowProgress += 0.08;
            if (this.joanThrowProgress >= 1) {
                this.joanThrowing = false;
                this.joanThrowProgress = 0;
                this.spawnRoller();
            }
            return; // Don't move while throwing
        }
        
        // Logic to track player or wander
        if (Math.abs(this.joanX - this.joanTargetX) < 10) {
            // Set new target
            if (this.level >= 3 && Math.random() > 0.4) {
                // Focus on player position at higher levels
                this.joanTargetX = Math.max(minX, Math.min(maxX, this.playerX + (Math.random() * 80 - 40)));
            } else {
                // Random position
                this.joanTargetX = minX + Math.random() * (maxX - minX);
            }
            // Adjust speed randomly
            this.joanSpeed = 2.5 + Math.random() * (2 + this.level * 0.5);
        }
        
        // Move towards target
        const dir = this.joanTargetX > this.joanX ? 1 : -1;
        this.joanX += dir * this.joanSpeed;
        
        // Spawn/Throw timer
        if (time - this.lastSpawnTime > this.spawnInterval) {
            this.joanThrowing = true;
            this.joanThrowProgress = 0;
            this.lastSpawnTime = time;
            
            // Scaled spawn rate - more gradual to support many levels without hitting a wall
            this.spawnInterval = Math.max(450, 2400 - (this.level * 180));
        }
    }
    
    spawnRoller() {
        // Random color
        const color = this.paintColors[Math.floor(Math.random() * this.paintColors.length)];
        
        // Determine roller type based on level
        let type = 'standard';
        const rand = Math.random();
        
        if (this.level === 2) {
            if (rand > 0.6) type = 'wobbly';
        } else if (this.level === 3) {
            if (rand > 0.7) type = 'heavy';
            else if (rand > 0.4) type = 'wobbly';
        } else if (this.level >= 4) {
            if (rand > 0.8) type = 'bouncy';
            else if (rand > 0.5) type = 'heavy';
            else if (rand > 0.25) type = 'wobbly';
        }
        
        const roller = {
            id: Math.random().toString(36).substr(2, 9),
            x: this.joanX,
            y: 130,
            type: type,
            color: color,
            speedY: 3.5 + (this.level * 0.4) + (type === 'heavy' ? 2.5 : 0),
            angle: 0,
            rotSpeed: 0.05 + Math.random() * 0.08,
            width: type === 'heavy' ? 44 : 32,
            height: type === 'heavy' ? 28 : 20,
            wobbleOffset: Math.random() * Math.PI * 2,
            streakId: null,
            bounced: false
        };
        
        // Create matching background streak starting point
        const streak = {
            id: Math.random().toString(36).substr(2, 9),
            x: roller.x,
            startY: roller.y,
            endY: roller.y,
            color: roller.color,
            width: type === 'heavy' ? 14 : 10,
            opacity: 1
        };
        
        roller.streakId = streak.id;
        this.paintStreaks.push(streak);
        this.rollers.push(roller);
        
        this.audio.playDrop();
        
        // Dual drop at level 4+ with 30% probability
        if (this.level >= 4 && Math.random() < 0.35) {
            setTimeout(() => {
                if (this.gameState === 'PLAYING') {
                    const extraColor = this.paintColors[Math.floor(Math.random() * this.paintColors.length)];
                    const extraRoller = {
                        id: Math.random().toString(36).substr(2, 9),
                        x: Math.max(90, Math.min(450, this.joanX + (Math.random() > 0.5 ? 90 : -90))),
                        y: 130,
                        type: 'standard',
                        color: extraColor,
                        speedY: 3.5 + (this.level * 0.4),
                        angle: 0,
                        rotSpeed: 0.07,
                        width: 32,
                        height: 20,
                        wobbleOffset: Math.random(),
                        streakId: null
                    };
                    const extraStreak = {
                        id: Math.random().toString(36).substr(2, 9),
                        x: extraRoller.x,
                        startY: extraRoller.y,
                        endY: extraRoller.y,
                        color: extraRoller.color,
                        width: 10,
                        opacity: 1
                    };
                    extraRoller.streakId = extraStreak.id;
                    this.paintStreaks.push(extraStreak);
                    this.rollers.push(extraRoller);
                    this.audio.playDrop();
                }
            }, 300);
        }
    }
    
    updateGameObjects(time, dt) {
        // 1. Update Rollers
        for (let i = this.rollers.length - 1; i >= 0; i--) {
            const r = this.rollers[i];
            
            // Movement mechanics by type
            r.y += r.speedY;
            r.angle += r.rotSpeed;
            
            if (r.type === 'wobbly') {
                r.x += Math.sin(time * 0.005 + r.wobbleOffset) * 2.2;
            } else if (r.type === 'bouncy' && !r.bounced) {
                // Bounces X-direction once if passing window heights
                if (r.y > 300 && r.y < 500) {
                    r.x += (r.x < this.logicalWidth / 2 ? 1.5 : -1.5) * 1.5;
                    // Bouncy effects on streaks
                    r.bounced = true;
                }
            }
            
            // Keep rollers in bounds
            r.x = Math.max(70, Math.min(470, r.x));
            
            // Update its trailing paint streak
            const streak = this.paintStreaks.find(s => s.id === r.streakId);
            if (streak) {
                streak.endY = r.y;
            }
            
            // Floor hit Y: 820
            if (r.y >= 820) {
                // Successful dodge!
                this.rollers.splice(i, 1);
                this.audio.playSplat();
                this.createSplash(r.x, 820, r.color);
                
                // Finalize streak
                if (streak) streak.endY = 820;
                
                // Add Score & popup
                this.score += 100;
                document.getElementById('score-val').textContent = this.score;
                this.scorePopups.push({
                    x: r.x,
                    y: 800,
                    text: '+100',
                    alpha: 1,
                    color: r.color
                });
                
                // Check Level Up
                const nextLevel = Math.floor(this.score / 500) + 1;
                if (nextLevel > this.level) {
                    this.level = nextLevel;
                    document.getElementById('level-val').textContent = this.level;
                    this.audio.playLevelUp();
                    
                    // Nivel superado popup feedback
                    this.scorePopups.push({
                        x: 270, // centro
                        y: 450,
                        text: '¡NIVEL ' + this.level + '!',
                        alpha: 1.5,
                        color: '#f8c922'
                    });
                }
            }
        }
        
        // Limit total background paint streaks (to avoid performance degradation)
        if (this.paintStreaks.length > 50) {
            // Fade out older static streaks
            const staticStreaks = this.paintStreaks.filter(s => {
                const isActive = this.rollers.some(r => r.streakId === s.id);
                return !isActive;
            });
            if (staticStreaks.length > 30) {
                const oldest = this.paintStreaks.indexOf(staticStreaks[0]);
                if (oldest > -1) this.paintStreaks.splice(oldest, 1);
            }
        }
        
        // 2. Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= 0.02;
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // 3. Update Score Popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const sp = this.scorePopups[i];
            sp.y -= 1.2;
            sp.alpha -= 0.015;
            if (sp.alpha <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    }
    
    createSplash(x, y, color) {
        // Spawn explosion particles
        const numParticles = 14 + Math.floor(Math.random() * 8);
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.PI + (Math.random() * Math.PI); // Half circle upwards
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.22,
                color: color,
                radius: 2 + Math.random() * 5,
                alpha: 1
            });
        }
    }
    
    checkCollisions() {
        if (this.invulnerabilityTime > 0) return;
        
        const pLeft = this.playerX - this.playerWidth / 2;
        const pRight = this.playerX + this.playerWidth / 2;
        const pTop = 870 - this.playerHeight;
        const pBottom = 870;
        
        for (let i = this.rollers.length - 1; i >= 0; i--) {
            const r = this.rollers[i];
            
            // Tighten bounding box for roller
            const rLeft = r.x - r.width * 0.4;
            const rRight = r.x + r.width * 0.4;
            const rTop = r.y - r.height * 0.4;
            const rBottom = r.y + r.height * 0.4;
            
            // Check box overlap
            if (rRight > pLeft && rLeft < pRight && rBottom > pTop && rTop < pBottom) {
                // Collision!
                this.rollers.splice(i, 1);
                this.handlePlayerHit(r.color);
                break;
            }
        }
    }
    
    handlePlayerHit(color) {
        this.lives--;
        document.getElementById('lives-val').textContent = this.lives;
        
        this.audio.playHit();
        
        // Visual impact feedback
        this.shakeTime = 300; // ms
        this.shakeMagnitude = 10;
        this.invulnerabilityTime = 1200; // ms
        this.paintCoverColor = color;
        this.paintCoverTime = 1000; // ms
        
        // Spawn hit particles
        const numParticles = 25;
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            this.particles.push({
                x: this.playerX,
                y: 840,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.18,
                color: color,
                radius: 3 + Math.random() * 6,
                alpha: 1
            });
        }
        
        // Check game over
        if (this.lives <= 0) {
            setTimeout(() => {
                this.setGameState('GAMEOVER');
            }, 500);
        }
    }
    
    // --- Rendering System ---
    draw() {
        this.ctx.save();
        
        // Clear screen with solid dark
        this.ctx.fillStyle = '#0b0b0d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset scale and adjust to logical resolution
        const scaleX = this.canvas.width / this.logicalWidth;
        const scaleY = this.canvas.height / this.logicalHeight;
        this.ctx.scale(scaleX, scaleY);
        
        // Apply Screen Shake if active
        if (this.shakeTime > 0) {
            const dx = (Math.random() - 0.5) * this.shakeMagnitude;
            const dy = (Math.random() - 0.5) * this.shakeMagnitude;
            this.ctx.translate(dx, dy);
        }
        
        // Draw layers
        this.drawBackground();
        this.drawFacadeStreaks(); // Streaks painted on the facade
        this.drawBuildingWindows();
        this.drawRooftop();
        this.drawJoanPintor();
        this.drawStreetAndSidewalk();
        
        // Draw warnings for heavy rollers
        this.drawRollerWarnings();
        
        // Draw active rollers
        this.drawRollers();
        
        // Draw Player
        this.drawPlayer();
        
        // Draw foreground effects (particles, text popups)
        this.drawParticles();
        this.drawScorePopups();
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Sky gradient at very top
        const skyGrd = this.ctx.createLinearGradient(0, 0, 0, 120);
        skyGrd.addColorStop(0, '#100c24');
        skyGrd.addColorStop(1, '#2c254e');
        this.ctx.fillStyle = skyGrd;
        this.ctx.fillRect(0, 0, this.logicalWidth, 120);
        
        // Building main facade background (brick red style)
        // Draw facade canvas base (X: 60 to 480)
        this.ctx.fillStyle = '#b85f42'; // Classic warm ceramic brick color
        this.ctx.fillRect(60, 120, 420, 680);
        
        // Sidebar buildings parallax shadows (black gradient edges)
        this.ctx.fillStyle = '#0f0f12';
        this.ctx.fillRect(0, 120, 60, 680);
        this.ctx.fillRect(480, 120, 60, 680);
        
        // Add vertical facade edge borders
        this.ctx.strokeStyle = '#421a0c';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(60, 120);
        this.ctx.lineTo(60, 800);
        this.ctx.moveTo(480, 120);
        this.ctx.lineTo(480, 800);
        this.ctx.stroke();
        
        // Draw subtle brick lines
        this.ctx.strokeStyle = 'rgba(66, 26, 12, 0.15)';
        this.ctx.lineWidth = 2;
        for (let y = 140; y < 800; y += 36) {
            this.ctx.beginPath();
            this.ctx.moveTo(60, y);
            this.ctx.lineTo(480, y);
            this.ctx.stroke();
        }
    }
    
    drawFacadeStreaks() {
        this.paintStreaks.forEach((s) => {
            this.ctx.strokeStyle = s.color;
            this.ctx.lineCap = 'round';
            this.ctx.lineWidth = s.width;
            this.ctx.globalAlpha = s.opacity;
            
            // Draw streak drip path
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.startY);
            this.ctx.lineTo(s.x, s.endY);
            this.ctx.stroke();
            
            // Draw some splats running off the streaks
            this.ctx.fillStyle = s.color;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.endY, s.width * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1.0;
    }
    
    drawBuildingWindows() {
        this.windows.forEach((w) => {
            // Draw window background hole
            this.ctx.fillStyle = '#261c16';
            this.ctx.fillRect(w.x - 25, w.y - 40, 50, 80);
            
            // Draw window glow (simulating lights)
            const lightGrd = this.ctx.createLinearGradient(w.x, w.y - 40, w.x, w.y + 40);
            lightGrd.addColorStop(0, '#f9e79f');
            lightGrd.addColorStop(1, '#d5dbdb');
            this.ctx.fillStyle = lightGrd;
            this.ctx.fillRect(w.x - 22, w.y - 37, 44, 74);
            
            // Draw window glass panes dividers
            this.ctx.strokeStyle = '#4a2306';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(w.x, w.y - 37);
            this.ctx.lineTo(w.x, w.y + 37);
            this.ctx.moveTo(w.x - 22, w.y);
            this.ctx.lineTo(w.x + 22, w.y);
            this.ctx.stroke();
            
            // Draw shutters (persianas)
            this.ctx.fillStyle = '#784524';
            this.ctx.strokeStyle = '#3d200e';
            this.ctx.lineWidth = 2;
            
            if (w.isOpenLeft) {
                // Open left shutter (angled)
                this.ctx.beginPath();
                this.ctx.rect(w.x - 45, w.y - 38, 20, 76);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Closed left shutter overlay
                this.ctx.beginPath();
                this.ctx.rect(w.x - 24, w.y - 38, 22, 76);
                this.ctx.fill();
                this.ctx.stroke();
            }
            
            if (w.isOpenRight) {
                // Open right shutter (angled)
                this.ctx.beginPath();
                this.ctx.rect(w.x + 25, w.y - 38, 20, 76);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Closed right shutter overlay
                this.ctx.beginPath();
                this.ctx.rect(w.x + 2, w.y - 38, 22, 76);
                this.ctx.fill();
                this.ctx.stroke();
            }
            
            // Draw Balcony ledge
            this.ctx.fillStyle = '#8e44ad'; // Ledge concrete cover
            this.ctx.fillStyle = '#bdc3c7'; // Concrete gray
            this.ctx.fillRect(w.x - w.balconyWidth/2, w.y + 38, w.balconyWidth, 10);
            this.ctx.strokeStyle = '#7f8c8d';
            this.ctx.strokeRect(w.x - w.balconyWidth/2, w.y + 38, w.balconyWidth, 10);
            
            // Draw Metal Balcony Railings (Iron style)
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            
            const railYStart = w.y + 15;
            const railYEnd = w.y + 38;
            
            // Top railing bar
            this.ctx.moveTo(w.x - w.balconyWidth/2 + 2, railYStart);
            this.ctx.lineTo(w.x + w.balconyWidth/2 - 2, railYStart);
            
            // Vertical bars
            for (let rx = w.x - w.balconyWidth/2 + 6; rx <= w.x + w.balconyWidth/2 - 6; rx += 8) {
                this.ctx.moveTo(rx, railYStart);
                this.ctx.lineTo(rx, railYEnd);
            }
            this.ctx.stroke();
        });
    }
    
    drawRooftop() {
        // Roof floor tile (Y: 100 to 120)
        this.ctx.fillStyle = '#d35400'; // Dark terracotta tiles
        this.ctx.fillRect(60, 100, 420, 20);
        
        // Horizontal separation line
        this.ctx.strokeStyle = '#4e1d03';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(60, 120);
        this.ctx.lineTo(480, 120);
        this.ctx.stroke();
        
        // Draw concrete details under tiles
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(60, 115, 420, 5);
        
        // Draw the rooftop background contents (Table and Buckets)
        // Table (X: 100 to 160)
        this.ctx.fillStyle = '#873600';
        this.ctx.fillRect(100, 80, 60, 8); // Table top
        this.ctx.fillRect(108, 88, 6, 12);  // Left leg
        this.ctx.fillRect(146, 88, 6, 12);  // Right leg
        
        // Buckets on the table
        const bColors = ['#f8c922', '#e82c88', '#00d5ff'];
        bColors.forEach((color, idx) => {
            const bx = 110 + (idx * 16);
            this.ctx.fillStyle = '#b2baf2'; // Metallic bucket
            this.ctx.fillRect(bx, 68, 10, 12);
            // Paint inside
            this.ctx.fillStyle = color;
            this.ctx.fillRect(bx, 68, 10, 3);
        });
        
        // Plants on the sides
        this.ctx.fillStyle = '#d35400'; // Clay pot
        this.ctx.fillRect(75, 85, 14, 15);
        this.ctx.fillStyle = '#27ae60'; // Green bush
        this.ctx.beginPath();
        this.ctx.arc(82, 76, 10, 0, Math.PI * 2);
        this.ctx.arc(76, 70, 8, 0, Math.PI * 2);
        this.ctx.arc(88, 70, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw Rooftop Handrail (Balustrada)
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(60, 75);
        this.ctx.lineTo(480, 75); // Handrail top
        
        // Balusters
        for (let bx = 70; bx < 480; bx += 14) {
            this.ctx.moveTo(bx, 75);
            this.ctx.lineTo(bx, 100);
        }
        this.ctx.stroke();
    }
    
    drawJoanPintor() {
        // Draw Joan Pintor standing on the roof deck
        const jx = this.joanX - this.joanWidth / 2;
        const jy = 100 - this.joanHeight;
        
        this.drawPixelSprite(SPRITES.joanIdle, jx, jy, this.joanWidth, this.joanHeight);
        
        // Procedural arm and roller draw
        this.ctx.save();
        this.ctx.translate(this.joanX + 16, 70); // Arm pivot
        
        let armAngle = -Math.PI / 4;
        if (this.joanThrowing) {
            // Animate throwing sweep
            armAngle = -Math.PI / 4 + (Math.sin(this.joanThrowProgress * Math.PI) * (Math.PI / 2));
        }
        
        this.ctx.rotate(armAngle);
        
        // Draw arm
        this.ctx.strokeStyle = '#ffd1a9'; // Skin color
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -25);
        this.ctx.stroke();
        
        // Draw wooden roller handle
        this.ctx.strokeStyle = '#8a5a36'; // Wood brown
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -20);
        this.ctx.lineTo(0, -50);
        this.ctx.stroke();
        
        // Draw Roller head
        this.ctx.fillStyle = '#85929e'; // Metal bracket
        this.ctx.fillRect(-12, -52, 24, 4);
        
        // Roller paint cylinder
        this.ctx.fillStyle = this.paintColors[Math.floor(this.score / 500) % this.paintColors.length]; // Paint color
        this.ctx.fillRect(-10, -66, 20, 14);
        
        this.ctx.restore();
    }
    
    drawStreetAndSidewalk() {
        // Y: 800 to 820 Sidewalk (Concrete gray slabs)
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fillRect(0, 800, this.logicalWidth, 20);
        
        // Sidewalk slab lines
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 2;
        for (let sx = 0; sx < this.logicalWidth; sx += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(sx, 800);
            this.ctx.lineTo(sx, 820);
            this.ctx.stroke();
        }
        
        // Concrete top border (border tiles)
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.fillRect(0, 816, this.logicalWidth, 4);
        
        // Y: 820 to 960 Street pavement (dark asphalt)
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(0, 820, this.logicalWidth, 140);
        
        // Draw perspective dashed lane lines
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([15, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 895);
        this.ctx.lineTo(this.logicalWidth, 895);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset dashed
        
        // Draw background street assets (Cars, pedestrians preview)
        this.streetCars.forEach((c) => {
            this.drawStreetCar(c.x, c.y, c.color, c.scale, c.dir);
        });
    }
    
    drawStreetCar(x, y, color, scale, dir) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale * dir, scale);
        
        // Body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-24, -10, 48, 14); // lower base
        this.ctx.fillRect(-16, -18, 30, 10); // roof cabin
        
        // Windows
        this.ctx.fillStyle = '#aed6f1';
        this.ctx.fillRect(-10, -16, 10, 7);
        this.ctx.fillRect(2, -16, 10, 7);
        
        // Wheels
        this.ctx.fillStyle = '#111';
        this.ctx.beginPath();
        this.ctx.arc(-14, 5, 6, 0, Math.PI * 2);
        this.ctx.arc(14, 5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hubcaps
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.beginPath();
        this.ctx.arc(-14, 5, 3, 0, Math.PI * 2);
        this.ctx.arc(14, 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Headlights
        this.ctx.fillStyle = '#f9e79f';
        this.ctx.fillRect(21, -8, 3, 4);
        
        this.ctx.restore();
    }
    
    drawRollerWarnings() {
        this.rollers.forEach((r) => {
            if (r.type === 'heavy' && r.y < 700) {
                // Draw a flashing warning vertical column
                const opacity = 0.12 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.15;
                this.ctx.fillStyle = 'rgba(232, 44, 136, ' + opacity + ')';
                this.ctx.fillRect(r.x - 16, 120, 32, 700);
                
                // Draw target crosshair at street Y: 820
                this.ctx.strokeStyle = '#e82c88';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(r.x, 820, 16, 0, Math.PI * 2);
                this.ctx.moveTo(r.x - 22, 820);
                this.ctx.lineTo(r.x + 22, 820);
                this.ctx.moveTo(r.x, 820 - 22);
                this.ctx.lineTo(r.x, 820 + 22);
                this.ctx.stroke();
                
                // Draw text warning
                this.ctx.fillStyle = '#e82c88';
                this.ctx.font = "900 12px 'Fredoka'";
                this.ctx.textAlign = 'center';
                this.ctx.fillText("¡ALERTA!", r.x, 780);
            }
        });
    }
    
    drawRollers() {
        this.rollers.forEach((r) => {
            this.ctx.save();
            this.ctx.translate(r.x, r.y);
            this.ctx.rotate(r.angle);
            
            const rw = r.width;
            const rh = r.height;
            
            // Draw wooden handle
            this.ctx.fillStyle = '#8a5a36';
            this.ctx.fillRect(-2, 0, 4, rh * 0.7);
            
            // Metal rod support
            this.ctx.strokeStyle = '#95a5a6';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, rh * 0.2);
            this.ctx.lineTo(-rw * 0.45, 0);
            this.ctx.lineTo(-rw * 0.45, -rh * 0.4);
            this.ctx.stroke();
            
            // Draw Paint Cylinder
            // Dark outline
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(-rw/2 - 1, -rh/2 - 1, rw + 2, rh + 2);
            // Main saturated color
            this.ctx.fillStyle = r.color;
            this.ctx.fillRect(-rw/2, -rh/2, rw, rh);
            
            // Highlights (top light reflection)
            this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
            this.ctx.fillRect(-rw/2, -rh/2, rw, rh * 0.25);
            
            this.ctx.restore();
            
            // Sparkles on wobbly rollers
            if (r.type === 'wobbly' && Math.random() > 0.8) {
                this.particles.push({
                    x: r.x + (Math.random() * 20 - 10),
                    y: r.y + (Math.random() * 20 - 10),
                    vx: Math.random() * 2 - 1,
                    vy: Math.random() * 2 - 1,
                    gravity: 0,
                    color: '#ffffff',
                    radius: 2,
                    alpha: 0.8
                });
            }
        });
    }
    
    drawPlayer() {
        const px = this.playerX - this.playerWidth / 2;
        const py = 870 - this.playerHeight;
        
        this.ctx.save();
        
        // Flash alpha if invulnerable
        if (this.invulnerabilityTime > 0) {
            const val = Math.floor(this.invulnerabilityTime / 80) % 2;
            if (val === 0) this.ctx.globalAlpha = 0.35;
        }
        
        // Choose walk frames based on velocity
        let sprite = SPRITES.playerIdle;
        if (Math.abs(this.playerSpeed) > 0.5) {
            const frame = Math.floor(Date.now() / 120) % 2;
            sprite = frame === 0 ? SPRITES.playerWalk1 : SPRITES.playerWalk2;
        }
        
        // Flip sprite context to face movement direction
        if (this.playerDirection === -1) {
            this.ctx.translate(this.playerX * 2, 0);
            this.ctx.scale(-1, 1);
        }
        
        this.drawPixelSprite(sprite, px, py, this.playerWidth, this.playerHeight);
        
        this.ctx.restore();
        
        // Draw Paint splattered overlays if hit
        if (this.paintCoverColor && this.paintCoverTime > 0) {
            this.ctx.fillStyle = this.paintCoverColor;
            
            // Splat blobs on player's position
            this.ctx.beginPath();
            this.ctx.arc(this.playerX - 6, 840, 8, 0, Math.PI*2);
            this.ctx.arc(this.playerX + 4, 826, 12, 0, Math.PI*2);
            this.ctx.arc(this.playerX + 2, 854, 7, 0, Math.PI*2);
            this.ctx.fill();
        }
    }
    
    // --- Helper to Render Pixel Art from Sprites ---
    drawPixelSprite(spriteArray, startX, startY, width, height) {
        const rows = spriteArray.length;
        const cols = spriteArray[0].length;
        
        const pixelW = width / cols;
        const pixelH = height / rows;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const char = spriteArray[r][c];
                const color = COLOR_MAP[char];
                if (color) {
                    this.ctx.fillStyle = color;
                    // Draw square pixel aligned to virtual grid
                    this.ctx.fillRect(
                        Math.floor(startX + c * pixelW), 
                        Math.floor(startY + r * pixelH), 
                        Math.ceil(pixelW), 
                        Math.ceil(pixelH)
                    );
                }
            }
        }
    }
    
    drawParticles() {
        this.particles.forEach((p) => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        this.ctx.globalAlpha = 1.0;
    }
    
    drawScorePopups() {
        this.scorePopups.forEach((sp) => {
            this.ctx.save();
            this.ctx.globalAlpha = sp.alpha;
            this.ctx.fillStyle = sp.color;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            
            this.ctx.font = "bold 20px 'Fredoka'";
            this.ctx.textAlign = 'center';
            
            this.ctx.strokeText(sp.text, sp.x, sp.y);
            this.ctx.fillText(sp.text, sp.x, sp.y);
            this.ctx.restore();
        });
        this.ctx.globalAlpha = 1.0;
    }
}

// --- Initialize Game ---
window.game = new JoanPintorGame();
