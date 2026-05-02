/* ========================================
   Super Mario - Level Editor
   ======================================== */

const Editor = (() => {
    const TILE = Engine.TILE_SIZE;
    let enabled = false;
    let selectedTile = 1;
    let selectedTool = 'paint';
    let gridVisible = true;
    let undoStack = [];
    let redoStack = [];
    const MAX_UNDO = 50;
    let isDragging = false;
    let lastPaintCol = -1;
    let lastPaintRow = -1;
    let previewCol = -1;
    let previewRow = -1;
    let cameraSpeed = 8;
    let panMode = false;

    const TILE_PALETTE = [
        { category: '地形', tiles: [
            { id: 1, name: '地面', symbol: '🟫' },
            { id: 9, name: '地面顶', symbol: '⬛' },
            { id: 2, name: '砖块', symbol: '🧱' },
            { id: 7, name: '石头', symbol: '🪨' },
            { id: 8, name: '钢块', symbol: '⬜' },
            { id: 15, name: '阶梯', symbol: '📐' },
            { id: 20, name: '平台', symbol: '➖' },
            { id: 30, name: '半固体', symbol: '🔲' }
        ]},
        { category: '功能', tiles: [
            { id: 3, name: '问号块', symbol: '❓' },
            { id: 5, name: '金币块', symbol: '💰' },
            { id: 4, name: '隐藏块', symbol: '👻' },
            { id: 6, name: '空块', symbol: '⬜' }
        ]},
        { category: '管道', tiles: [
            { id: 10, name: '管道左上', symbol: '┏' },
            { id: 11, name: '管道右上', symbol: '┓' },
            { id: 12, name: '管道左', symbol: '┃' },
            { id: 13, name: '管道右', symbol: '┃' }
        ]},
        { category: '装饰', tiles: [
            { id: 50, name: '金币', symbol: '🪙' },
            { id: 61, name: '旗杆', symbol: '🚩' },
            { id: 60, name: '旗帜', symbol: '🏁' },
            { id: 14, name: '桥', symbol: '🌉' }
        ]},
        { category: '清除', tiles: [
            { id: 0, name: '橡皮擦', symbol: '🗑️' }
        ]}
    ];

    const ENEMY_PALETTE = [
        { type: 'goomba', name: '栗子怪', symbol: '🍄' },
        { type: 'koopa', name: '龟壳怪', symbol: '🐢' },
        { type: 'koopaRed', name: '红龟壳', symbol: '🐢' },
        { type: 'piranha', name: '食人花', symbol: '🌺' },
        { type: 'buzzyBeetle', name: '甲壳虫', symbol: '🐞' },
        { type: 'hammerBro', name: '锤子兄弟', symbol: '🔨' }
    ];

    const ITEM_PALETTE = [
        { type: 'mushroom', name: '蘑菇', symbol: '🍄' },
        { type: 'fireFlower', name: '火焰花', symbol: '🌸' },
        { type: 'star', name: '无敌星', symbol: '⭐' },
        { type: 'oneUpMushroom', name: '1UP蘑菇', symbol: '💚' }
    ];

    function enable() {
        enabled = true;
        Input.setEditorMode(true);
        buildEditorPanel();
        setupEditorInput();

        const panel = document.getElementById('editor-panel');
        if (panel) panel.classList.add('active');

        Engine.on('render', renderEditorOverlay);
        Engine.emit('editorEnabled');
    }

    function disable() {
        enabled = false;
        Input.setEditorMode(false);

        const panel = document.getElementById('editor-panel');
        if (panel) panel.classList.remove('active');

        Engine.off('render', renderEditorOverlay);
        Engine.emit('editorDisabled');
    }

    function buildEditorPanel() {
        let panel = document.getElementById('editor-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'editor-panel';
            document.getElementById('game-container').appendChild(panel);
        }

        panel.innerHTML = `
            <div class="editor-header">
                <h3>关卡编辑器</h3>
                <button class="editor-close" id="editor-close-btn">×</button>
            </div>
            <div class="editor-tools">
                <button class="editor-tool-btn active" data-tool="paint" data-tooltip="画笔">🖌️</button>
                <button class="editor-tool-btn" data-tool="erase" data-tooltip="橡皮擦">🗑️</button>
                <button class="editor-tool-btn" data-tool="fill" data-tooltip="填充">🪣</button>
                <button class="editor-tool-btn" data-tool="enemy" data-tooltip="敌人">👾</button>
                <button class="editor-tool-btn" data-tool="item" data-tooltip="道具">⭐</button>
                <button class="editor-tool-btn" data-tool="spawn" data-tooltip="起点">🏠</button>
            </div>
            <div class="editor-minimap" id="editor-minimap"></div>
            <div class="editor-tiles" id="editor-tile-list"></div>
            <div class="editor-actions">
                <button class="editor-btn" id="editor-test-btn">▶ 测试关卡</button>
                <button class="editor-btn" id="editor-save-btn">💾 保存关卡</button>
                <button class="editor-btn" id="editor-load-btn">📂 加载关卡</button>
                <button class="editor-btn" id="editor-clear-btn">🗑️ 清空关卡</button>
                <button class="editor-btn" id="editor-undo-btn">↩ 撤销</button>
                <button class="editor-btn" id="editor-redo-btn">↪ 重做</button>
                <button class="editor-btn primary" id="editor-exit-btn">退出编辑器</button>
            </div>
        `;

        buildTileList();
        setupEditorButtons();
    }

    function buildTileList() {
        const container = document.getElementById('editor-tile-list');
        if (!container) return;

        container.innerHTML = '';

        const toolBtns = document.querySelectorAll('.editor-tool-btn');
        const activeTool = selectedTool;

        if (activeTool === 'enemy') {
            const category = document.createElement('div');
            category.className = 'tile-category';
            category.innerHTML = '<h4>敌人</h4>';
            const grid = document.createElement('div');
            grid.className = 'tile-grid';

            for (const enemy of ENEMY_PALETTE) {
                const tile = document.createElement('div');
                tile.className = 'tile-option';
                tile.textContent = enemy.symbol;
                tile.dataset.enemyType = enemy.type;
                tile.innerHTML += `<span class="tile-label">${enemy.name}</span>`;
                tile.addEventListener('click', () => {
                    container.querySelectorAll('.tile-option').forEach(t => t.classList.remove('selected'));
                    tile.classList.add('selected');
                    selectedTile = enemy.type;
                });
                grid.appendChild(tile);
            }

            category.appendChild(grid);
            container.appendChild(category);
        } else if (activeTool === 'item') {
            const category = document.createElement('div');
            category.className = 'tile-category';
            category.innerHTML = '<h4>道具</h4>';
            const grid = document.createElement('div');
            grid.className = 'tile-grid';

            for (const item of ITEM_PALETTE) {
                const tile = document.createElement('div');
                tile.className = 'tile-option';
                tile.textContent = item.symbol;
                tile.dataset.itemType = item.type;
                tile.innerHTML += `<span class="tile-label">${item.name}</span>`;
                tile.addEventListener('click', () => {
                    container.querySelectorAll('.tile-option').forEach(t => t.classList.remove('selected'));
                    tile.classList.add('selected');
                    selectedTile = item.type;
                });
                grid.appendChild(tile);
            }

            category.appendChild(grid);
            container.appendChild(category);
        } else {
            for (const cat of TILE_PALETTE) {
                const category = document.createElement('div');
                category.className = 'tile-category';
                category.innerHTML = `<h4>${cat.category}</h4>`;
                const grid = document.createElement('div');
                grid.className = 'tile-grid';

                for (const t of cat.tiles) {
                    const tile = document.createElement('div');
                    tile.className = `tile-option ${t.id === selectedTile ? 'selected' : ''}`;
                    tile.textContent = t.symbol;
                    tile.dataset.tileId = t.id;
                    tile.innerHTML += `<span class="tile-label">${t.name}</span>`;
                    tile.addEventListener('click', () => {
                        container.querySelectorAll('.tile-option').forEach(el => el.classList.remove('selected'));
                        tile.classList.add('selected');
                        selectedTile = t.id;
                    });
                    grid.appendChild(tile);
                }

                category.appendChild(grid);
                container.appendChild(category);
            }
        }
    }

    function setupEditorButtons() {
        document.getElementById('editor-close-btn')?.addEventListener('click', disable);
        document.getElementById('editor-exit-btn')?.addEventListener('click', () => {
            disable();
            UI.showScreen('main-menu');
            Engine.setState('menu');
        });

        document.querySelectorAll('.editor-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.editor-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTool = btn.dataset.tool;
                buildTileList();
            });
        });

        document.getElementById('editor-test-btn')?.addEventListener('click', testLevel);
        document.getElementById('editor-save-btn')?.addEventListener('click', saveLevel);
        document.getElementById('editor-load-btn')?.addEventListener('click', loadLevel);
        document.getElementById('editor-clear-btn')?.addEventListener('click', clearLevel);
        document.getElementById('editor-undo-btn')?.addEventListener('click', undo);
        document.getElementById('editor-redo-btn')?.addEventListener('click', redo);
    }

    function setupEditorInput() {
        Engine.on('mousedown', onMouseDown);
        Engine.on('mousemove', onMouseMove);
        Engine.on('mouseup', onMouseUp);
    }

    function onMouseDown(mouse) {
        if (!enabled) return;
        isDragging = true;
        lastPaintCol = -1;
        lastPaintRow = -1;
        performAction(mouse);
    }

    function onMouseMove(mouse) {
        if (!enabled) return;

        const camera = Engine.getCamera();
        previewCol = Math.floor((mouse.x + camera.x) / TILE);
        previewRow = Math.floor((mouse.y + camera.y) / TILE);

        if (isDragging) {
            performAction(mouse);
        }
    }

    function onMouseUp() {
        isDragging = false;
        lastPaintCol = -1;
        lastPaintRow = -1;
    }

    function performAction(mouse) {
        const camera = Engine.getCamera();
        const col = Math.floor((mouse.x + camera.x) / TILE);
        const row = Math.floor((mouse.y + camera.y) / TILE);
        const level = Engine.getCurrentLevel();

        if (!level || col < 0 || col >= level.width || row < 0 || row >= level.height) return;
        if (col === lastPaintCol && row === lastPaintRow) return;

        lastPaintCol = col;
        lastPaintRow = row;

        switch (selectedTool) {
            case 'paint':
                paintTile(level, col, row, selectedTile);
                break;
            case 'erase':
                paintTile(level, col, row, 0);
                break;
            case 'fill':
                floodFill(level, col, row, selectedTile);
                break;
            case 'enemy':
                placeEnemy(level, col, row, selectedTile);
                break;
            case 'item':
                placeItem(level, col, row, selectedTile);
                break;
            case 'spawn':
                level.spawnX = col;
                level.spawnY = row;
                UI.showToast(`起点设为 (${col}, ${row})`, 'success');
                break;
        }
    }

    function paintTile(level, col, row, tileId) {
        const oldTile = Physics.getTile(level, col, row);
        if (oldTile === tileId) return;

        pushUndo(level);
        Physics.setTile(level, col, row, tileId);
    }

    function floodFill(level, col, row, tileId) {
        const targetTile = Physics.getTile(level, col, row);
        if (targetTile === tileId) return;

        pushUndo(level);

        const stack = [[col, row]];
        const visited = new Set();
        let fillCount = 0;
        const maxFill = 2000;

        while (stack.length > 0 && fillCount < maxFill) {
            const [c, r] = stack.pop();
            const key = `${c},${r}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (c < 0 || c >= level.width || r < 0 || r >= level.height) continue;
            if (Physics.getTile(level, c, r) !== targetTile) continue;

            Physics.setTile(level, c, r, tileId);
            fillCount++;

            stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
        }
    }

    function placeEnemy(level, col, row, enemyType) {
        if (!level.enemies) level.enemies = [];

        level.enemies = level.enemies.filter(e => !(e.x === col && e.y === row));
        level.enemies.push({ type: enemyType, x: col, y: row });

        const enemy = Enemies.create({ type: enemyType, x: col, y: row });
        if (enemy) {
            enemy.activated = true;
            Engine.addEntity(enemy);
        }
    }

    function placeItem(level, col, row, itemType) {
        if (!level.items) level.items = [];

        level.items = level.items.filter(i => !(i.x === col && i.y === row));
        level.items.push({ type: itemType, x: col, y: row });

        Items.spawn(itemType, col * TILE, row * TILE);
    }

    function pushUndo(level) {
        undoStack.push(JSON.stringify(level.tiles));
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        redoStack = [];
    }

    function undo() {
        const level = Engine.getCurrentLevel();
        if (!level || undoStack.length === 0) return;

        redoStack.push(JSON.stringify(level.tiles));
        level.tiles = JSON.parse(undoStack.pop());
        UI.showToast('已撤销', 'success');
    }

    function redo() {
        const level = Engine.getCurrentLevel();
        if (!level || redoStack.length === 0) return;

        undoStack.push(JSON.stringify(level.tiles));
        level.tiles = JSON.parse(redoStack.pop());
        UI.showToast('已重做', 'success');
    }

    function testLevel() {
        const level = Engine.getCurrentLevel();
        if (!level) return;

        disable();
        Player.spawn(level.spawnX || 3, level.spawnY || 12);
        Engine.setState('playing');
        Audio.playMusic(level.theme || 'overworld');
        UI.showToast('测试模式 - 按E返回编辑', 'success');

        const returnToEditor = ({ action }) => {
            if (action === 'editor') {
                Engine.off('keydown', returnToEditor);
                Engine.setState('editor');
                enable();
                Audio.stopMusic();
            }
        };
        Engine.on('keydown', returnToEditor);
    }

    function saveLevel() {
        const level = Engine.getCurrentLevel();
        if (!level) return;

        const name = `custom_${Date.now()}`;
        if (Levels.saveCustomLevel(name, level)) {
            UI.showToast(`关卡已保存: ${name}`, 'success');
        } else {
            UI.showToast('保存失败', 'error');
        }
    }

    function loadLevel() {
        const list = Levels.getCustomLevelList();
        if (list.length === 0) {
            UI.showToast('没有保存的关卡', 'warning');
            return;
        }

        const levelName = list[list.length - 1];
        const level = Levels.loadCustomLevel(levelName);
        if (level) {
            Engine.loadLevel(level);
            UI.showToast(`已加载: ${levelName}`, 'success');
        }
    }

    function clearLevel() {
        UI.showDialog('清空关卡', '确定要清空当前关卡吗？此操作不可撤销。', [
            { text: '取消', class: '' },
            {
                text: '清空', class: 'danger',
                callback: () => {
                    const level = Engine.getCurrentLevel();
                    if (level) {
                        pushUndo(level);
                        level.tiles = new Array(level.width * level.height).fill(0);
                        Levels.setTileRange(level, 0, level.height - 2, level.width - 1, level.height - 1, 1);
                        level.enemies = [];
                        level.items = [];
                        UI.showToast('关卡已清空', 'success');
                    }
                }
            }
        ]);
    }

    function renderEditorOverlay({ ctx, camera }) {
        if (!enabled) return;

        Renderer.renderGrid(ctx, camera, Engine.getCurrentLevel());

        if (previewCol >= 0 && previewRow >= 0) {
            const x = previewCol * TILE - camera.x;
            const y = previewRow * TILE - camera.y;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, TILE, TILE);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(x, y, TILE, TILE);
        }

        const level = Engine.getCurrentLevel();
        if (level && level.enemies) {
            for (const e of level.enemies) {
                const x = e.x * TILE - camera.x;
                const y = e.y * TILE - camera.y;
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y - TILE, TILE, TILE);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
                ctx.fillRect(x, y - TILE, TILE, TILE);
            }
        }

        if (level) {
            const spawnX = (level.spawnX || 3) * TILE - camera.x;
            const spawnY = (level.spawnY || 12) * TILE - camera.y;
            ctx.strokeStyle = '#43b047';
            ctx.lineWidth = 2;
            ctx.strokeRect(spawnX - 2, spawnY - TILE - 2, TILE + 4, TILE + 4);
            ctx.fillStyle = 'rgba(67, 176, 71, 0.2)';
            ctx.fillRect(spawnX, spawnY - TILE, TILE, TILE);
            ctx.fillStyle = '#43b047';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SPAWN', spawnX + TILE / 2, spawnY - TILE - 6);
        }

        handleEditorCamera();
    }

    function handleEditorCamera() {
        const camera = Engine.getCamera();
        const level = Engine.getCurrentLevel();
        if (!level) return;

        if (Input.isPressed('left')) camera.x -= cameraSpeed;
        if (Input.isPressed('right')) camera.x += cameraSpeed;
        if (Input.isPressed('up')) camera.y -= cameraSpeed;
        if (Input.isPressed('down')) camera.y += cameraSpeed;

        camera.x = Math.max(0, Math.min(camera.x, level.width * TILE - Engine.CANVAS_WIDTH));
        camera.y = Math.max(0, Math.min(camera.y, level.height * TILE - Engine.CANVAS_HEIGHT));
    }

    function isEnabled() { return enabled; }
    function getSelectedTile() { return selectedTile; }
    function getSelectedTool() { return selectedTool; }

    return {
        enable, disable, isEnabled,
        getSelectedTile, getSelectedTool,
        undo, redo, testLevel, saveLevel, loadLevel, clearLevel,
        TILE_PALETTE, ENEMY_PALETTE, ITEM_PALETTE
    };
})();
