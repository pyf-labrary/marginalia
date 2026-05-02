// ============================================================
// input.js - Keyboard, mouse, and touch input handling
// ============================================================
VF.Input = {
    keys: {},
    keysJustPressed: {},
    mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false, rightDown: false, clicked: false, rightClicked: false },
    _prevKeys: {},

    init() {
        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.keysJustPressed[e.code] = true;
            this.keys[e.code] = true;
            // Prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'KeyE', 'KeyQ'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', e => {
            if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
            if (e.button === 2) { this.mouse.rightDown = true; this.mouse.rightClicked = true; }
        });
        window.addEventListener('mouseup', e => {
            if (e.button === 0) this.mouse.down = false;
            if (e.button === 2) this.mouse.rightDown = false;
        });
        window.addEventListener('contextmenu', e => e.preventDefault());

        // Touch support
        window.addEventListener('touchstart', e => {
            const t = e.touches[0];
            this.mouse.x = t.clientX;
            this.mouse.y = t.clientY;
            this.mouse.down = true;
            this.mouse.clicked = true;
        });
        window.addEventListener('touchmove', e => {
            const t = e.touches[0];
            this.mouse.x = t.clientX;
            this.mouse.y = t.clientY;
        });
        window.addEventListener('touchend', () => {
            this.mouse.down = false;
        });

        console.log('[Input] Initialized');
    },

    // Call at end of each frame
    endFrame() {
        this.keysJustPressed = {};
        this.mouse.clicked = false;
        this.mouse.rightClicked = false;
    },

    // Helper methods
    isDown(code) { return !!this.keys[code]; },
    justPressed(code) { return !!this.keysJustPressed[code]; },

    // Get movement vector from WASD/arrows
    getMovement() {
        let x = 0, y = 0;
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
        // Normalize diagonal
        if (x !== 0 && y !== 0) {
            const inv = 1 / Math.SQRT2;
            x *= inv; y *= inv;
        }
        return { x, y };
    },

    // Update mouse world position based on camera
    updateWorldMouse(camera) {
        this.mouse.worldX = this.mouse.x + camera.x - VF.Engine.width / 2;
        this.mouse.worldY = this.mouse.y + camera.y - VF.Engine.height / 2;
    },

    // Gamepad support
    _gamepads: {},
    _gamepadDeadzone: 0.15,

    updateGamepads() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of gamepads) {
            if (!gp) continue;
            this._gamepads[gp.index] = {
                leftStick: { x: this._applyDeadzone(gp.axes[0]), y: this._applyDeadzone(gp.axes[1]) },
                rightStick: { x: this._applyDeadzone(gp.axes[2]), y: this._applyDeadzone(gp.axes[3]) },
                buttons: gp.buttons.map(b => b.pressed),
                triggers: { left: gp.buttons[6]?.value || 0, right: gp.buttons[7]?.value || 0 }
            };
        }
    },

    _applyDeadzone(value) {
        return Math.abs(value) < this._gamepadDeadzone ? 0 : value;
    },

    getGamepadMovement() {
        const gp = this._gamepads[0];
        if (!gp) return null;
        return gp.leftStick;
    },

    getGamepadAim() {
        const gp = this._gamepads[0];
        if (!gp) return null;
        if (gp.rightStick.x === 0 && gp.rightStick.y === 0) return null;
        return Math.atan2(gp.rightStick.y, gp.rightStick.x);
    },

    // Key binding system
    _bindings: {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight'],
        boost: ['ShiftLeft', 'ShiftRight'],
        fire: ['mouse0'],
        secondary: ['mouse2'],
        interact: ['KeyE'],
        warp: ['KeyF'],
        pause: ['Escape'],
        upgrades: ['KeyU'],
        inventory: ['KeyI'],
        galaxy: ['KeyG'],
        minimap: ['KeyM'],
        quickSave: ['F5'],
        weapon1: ['Digit1'],
        weapon2: ['Digit2'],
        weapon3: ['Digit3'],
        weapon4: ['Digit4']
    },

    isActionDown(action) {
        const bindings = this._bindings[action];
        if (!bindings) return false;
        for (const key of bindings) {
            if (key === 'mouse0' && this.mouse.down) return true;
            if (key === 'mouse2' && this.mouse.rightDown) return true;
            if (this.isDown(key)) return true;
        }
        return false;
    },

    isActionJustPressed(action) {
        const bindings = this._bindings[action];
        if (!bindings) return false;
        for (const key of bindings) {
            if (key === 'mouse0' && this.mouse.clicked) return true;
            if (key === 'mouse2' && this.mouse.rightClicked) return true;
            if (this.justPressed(key)) return true;
        }
        return false;
    },

    // Input recording for replay
    _recording: false,
    _recordedInputs: [],
    _recordTimer: 0,

    startRecording() {
        this._recording = true;
        this._recordedInputs = [];
        this._recordTimer = 0;
    },

    stopRecording() {
        this._recording = false;
        return this._recordedInputs;
    },

    recordFrame(dt) {
        if (!this._recording) return;
        this._recordTimer += dt;
        this._recordedInputs.push({
            time: this._recordTimer,
            keys: { ...this.keys },
            mouse: { ...this.mouse }
        });
    }
};
