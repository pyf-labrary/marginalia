/* ========================================
   Super Mario - Input Management System
   ======================================== */

const Input = (() => {
    const keys = {};
    const justPressed = {};
    const justReleased = {};
    const prevKeys = {};
    const keyBindings = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowUp': 'jump',
        'ArrowDown': 'down',
        'KeyA': 'left',
        'KeyD': 'right',
        'KeyW': 'jump',
        'KeyS': 'down',
        'Space': 'jump',
        'KeyZ': 'jump',
        'ShiftLeft': 'run',
        'ShiftRight': 'run',
        'KeyX': 'run',
        'Escape': 'pause',
        'KeyP': 'pause',
        'Enter': 'confirm',
        'KeyE': 'editor',
        'KeyR': 'reset',
        'KeyF': 'fullscreen',
        'Digit1': 'debug1',
        'Digit2': 'debug2',
        'Digit3': 'debug3'
    };

    let touchState = {
        left: false,
        right: false,
        jump: false,
        run: false,
        up: false,
        down: false
    };

    let touchEnabled = false;
    let mouseState = { x: 0, y: 0, down: false, button: 0, justClicked: false };
    let editorMode = false;
    let inputEnabled = true;
    let vibrationEnabled = true;
    let lastInputDevice = 'keyboard';

    const inputBuffer = [];
    const BUFFER_SIZE = 10;
    const BUFFER_WINDOW = 200;

    let gamepadConnected = false;
    let gamepadIndex = -1;
    let gamepadState = {};
    const GAMEPAD_DEADZONE = 0.3;

    function init() {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('contextmenu', e => { if (editorMode) e.preventDefault(); });

        initTouch();
        initGamepad();

        Engine.on('frame', updateInputState);
    }

    function onKeyDown(e) {
        const action = keyBindings[e.code];
        if (!action) return;

        e.preventDefault();
        lastInputDevice = 'keyboard';

        if (!keys[action]) {
            justPressed[action] = true;
            addToBuffer(action);
        }
        keys[action] = true;

        if (action === 'pause' && inputEnabled) {
            Engine.emit('pauseToggle');
        }

        if (action === 'fullscreen') {
            toggleFullscreen();
        }

        Engine.emit('keydown', { action, code: e.code });
    }

    function onKeyUp(e) {
        const action = keyBindings[e.code];
        if (!action) return;

        e.preventDefault();

        keys[action] = false;
        justReleased[action] = true;

        Engine.emit('keyup', { action, code: e.code });
    }

    function onMouseMove(e) {
        const canvas = Engine.getCanvas();
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = Engine.CANVAS_WIDTH / rect.width;
        const scaleY = Engine.CANVAS_HEIGHT / rect.height;

        mouseState.x = (e.clientX - rect.left) * scaleX;
        mouseState.y = (e.clientY - rect.top) * scaleY;

        if (editorMode) {
            const camera = Engine.getCamera();
            mouseState.worldX = mouseState.x + camera.x;
            mouseState.worldY = mouseState.y + camera.y;
            mouseState.tileCol = Math.floor(mouseState.worldX / Engine.TILE_SIZE);
            mouseState.tileRow = Math.floor(mouseState.worldY / Engine.TILE_SIZE);
        }

        Engine.emit('mousemove', mouseState);
    }

    function onMouseDown(e) {
        mouseState.down = true;
        mouseState.justClicked = true;
        mouseState.button = e.button;
        lastInputDevice = 'mouse';
        Engine.emit('mousedown', mouseState);
    }

    function onMouseUp(e) {
        mouseState.down = false;
        Engine.emit('mouseup', mouseState);
    }

    function initTouch() {
        const touchBtns = document.querySelectorAll('.touch-btn');
        touchBtns.forEach(btn => {
            const key = btn.dataset.key;
            if (!key) return;

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                touchState[key] = true;
                keys[key] = true;
                justPressed[key] = true;
                lastInputDevice = 'touch';
                vibrate(10);
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                touchState[key] = false;
                keys[key] = false;
                justReleased[key] = true;
            }, { passive: false });

            btn.addEventListener('touchcancel', (e) => {
                touchState[key] = false;
                keys[key] = false;
            });
        });

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            enableTouch();
        }
    }

    function enableTouch() {
        touchEnabled = true;
        const controls = document.getElementById('touch-controls');
        if (controls) controls.classList.remove('hidden');
    }

    function disableTouch() {
        touchEnabled = false;
        const controls = document.getElementById('touch-controls');
        if (controls) controls.classList.add('hidden');
    }

    function initGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            gamepadConnected = true;
            gamepadIndex = e.gamepad.index;
            lastInputDevice = 'gamepad';
            Engine.emit('gamepadConnected', e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            if (e.gamepad.index === gamepadIndex) {
                gamepadConnected = false;
                gamepadIndex = -1;
                gamepadState = {};
                Engine.emit('gamepadDisconnected');
            }
        });
    }

    function pollGamepad() {
        if (!gamepadConnected) return;

        const gamepads = navigator.getGamepads();
        const gp = gamepads[gamepadIndex];
        if (!gp) return;

        const leftX = gp.axes[0];
        const leftY = gp.axes[1];

        gamepadState.left = leftX < -GAMEPAD_DEADZONE;
        gamepadState.right = leftX > GAMEPAD_DEADZONE;
        gamepadState.up = leftY < -GAMEPAD_DEADZONE;
        gamepadState.down = leftY > GAMEPAD_DEADZONE;

        gamepadState.jump = gp.buttons[0]?.pressed || false;
        gamepadState.run = gp.buttons[1]?.pressed || gp.buttons[2]?.pressed || false;
        gamepadState.pause = gp.buttons[9]?.pressed || false;
        gamepadState.confirm = gp.buttons[0]?.pressed || false;

        const dpUp = gp.buttons[12]?.pressed || false;
        const dpDown = gp.buttons[13]?.pressed || false;
        const dpLeft = gp.buttons[14]?.pressed || false;
        const dpRight = gp.buttons[15]?.pressed || false;

        gamepadState.left = gamepadState.left || dpLeft;
        gamepadState.right = gamepadState.right || dpRight;
        gamepadState.up = gamepadState.up || dpUp;
        gamepadState.down = gamepadState.down || dpDown;

        for (const action in gamepadState) {
            if (gamepadState[action] && !keys[action]) {
                keys[action] = true;
                justPressed[action] = true;
                lastInputDevice = 'gamepad';
            } else if (!gamepadState[action] && keys[action] && lastInputDevice === 'gamepad') {
                keys[action] = false;
                justReleased[action] = true;
            }
        }
    }

    function updateInputState() {
        for (const key in justPressed) {
            justPressed[key] = false;
        }
        for (const key in justReleased) {
            justReleased[key] = false;
        }
        mouseState.justClicked = false;

        pollGamepad();

        for (let i = inputBuffer.length - 1; i >= 0; i--) {
            if (Date.now() - inputBuffer[i].time > BUFFER_WINDOW) {
                inputBuffer.splice(i, 1);
            }
        }
    }

    function addToBuffer(action) {
        inputBuffer.push({ action, time: Date.now() });
        if (inputBuffer.length > BUFFER_SIZE) {
            inputBuffer.shift();
        }
    }

    function checkBuffer(action) {
        for (let i = inputBuffer.length - 1; i >= 0; i--) {
            if (inputBuffer[i].action === action) {
                inputBuffer.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function consumeBuffer(action) {
        for (let i = inputBuffer.length - 1; i >= 0; i--) {
            if (inputBuffer[i].action === action) {
                inputBuffer.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function isPressed(action) {
        if (!inputEnabled) return false;
        return !!keys[action];
    }

    function isJustPressed(action) {
        if (!inputEnabled) return false;
        return !!justPressed[action];
    }

    function isJustReleased(action) {
        if (!inputEnabled) return false;
        return !!justReleased[action];
    }

    function getAxis(negative, positive) {
        let value = 0;
        if (isPressed(negative)) value -= 1;
        if (isPressed(positive)) value += 1;
        return value;
    }

    function getHorizontalAxis() {
        return getAxis('left', 'right');
    }

    function getVerticalAxis() {
        return getAxis('up', 'down');
    }

    function getMouse() {
        return { ...mouseState };
    }

    function isMouseDown() {
        return mouseState.down;
    }

    function isMouseJustClicked() {
        return mouseState.justClicked;
    }

    function setEditorMode(enabled) {
        editorMode = enabled;
    }

    function setInputEnabled(enabled) {
        inputEnabled = enabled;
    }

    function vibrate(duration) {
        if (!vibrationEnabled || !navigator.vibrate) return;
        navigator.vibrate(duration);
    }

    function toggleFullscreen() {
        const container = document.getElementById('game-container');
        if (!document.fullscreenElement) {
            container.requestFullscreen?.() || container.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }

    function rebindKey(code, action) {
        for (const key in keyBindings) {
            if (keyBindings[key] === action) {
                delete keyBindings[key];
            }
        }
        keyBindings[code] = action;
    }

    function getBindings() {
        return { ...keyBindings };
    }

    function resetBindings() {
        Object.keys(keyBindings).forEach(k => delete keyBindings[k]);
        Object.assign(keyBindings, {
            'ArrowLeft': 'left', 'ArrowRight': 'right',
            'ArrowUp': 'jump', 'ArrowDown': 'down',
            'KeyA': 'left', 'KeyD': 'right',
            'KeyW': 'jump', 'KeyS': 'down',
            'Space': 'jump', 'KeyZ': 'jump',
            'ShiftLeft': 'run', 'ShiftRight': 'run', 'KeyX': 'run',
            'Escape': 'pause', 'KeyP': 'pause',
            'Enter': 'confirm', 'KeyE': 'editor'
        });
    }

    function getLastInputDevice() {
        return lastInputDevice;
    }

    function isTouchEnabled() {
        return touchEnabled;
    }

    function isGamepadConnected() {
        return gamepadConnected;
    }

    function setVibrationEnabled(enabled) {
        vibrationEnabled = enabled;
    }

    function clearAll() {
        for (const key in keys) keys[key] = false;
        for (const key in justPressed) justPressed[key] = false;
        for (const key in justReleased) justReleased[key] = false;
        for (const key in touchState) touchState[key] = false;
        inputBuffer.length = 0;
    }

    return {
        init, isPressed, isJustPressed, isJustReleased,
        getAxis, getHorizontalAxis, getVerticalAxis,
        getMouse, isMouseDown, isMouseJustClicked, setEditorMode, setInputEnabled,
        enableTouch, disableTouch, isTouchEnabled,
        vibrate, toggleFullscreen,
        rebindKey, getBindings, resetBindings,
        checkBuffer, consumeBuffer,
        getLastInputDevice, isGamepadConnected, setVibrationEnabled,
        clearAll
    };
})();
