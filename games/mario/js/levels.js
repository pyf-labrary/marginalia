/* ========================================
   Super Mario - Level Data & Management
   ======================================== */

const Levels = (() => {
    const TILE = Engine.TILE_SIZE;

    const LEVEL_WIDTH = 210;
    const LEVEL_HEIGHT = 15;

    function createEmptyLevel(width, height) {
        const tiles = new Array(width * height).fill(0);
        return {
            width,
            height,
            tiles,
            theme: 'overworld',
            timeLimit: 400,
            spawnX: 3,
            spawnY: height - 3,
            worldId: '1-1',
            enemies: [],
            items: [],
            pipes: [],
            blockContents: {},
            clouds: [],
            foreground: []
        };
    }

    function setTileRange(level, startCol, startRow, endCol, endRow, tileType) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row >= 0 && row < level.height && col >= 0 && col < level.width) {
                    level.tiles[row * level.width + col] = tileType;
                }
            }
        }
    }

    function buildPipe(level, col, row, height, destination) {
        for (let h = 0; h < height; h++) {
            const r = row - h;
            if (h === height - 1) {
                level.tiles[r * level.width + col] = 10;
                level.tiles[r * level.width + col + 1] = 11;
            } else {
                level.tiles[r * level.width + col] = 12;
                level.tiles[r * level.width + col + 1] = 13;
            }
        }

        if (destination) {
            if (!level.pipes) level.pipes = [];
            level.pipes.push({
                x: col,
                y: row - height + 1,
                destination
            });
        }
    }

    function buildStaircase(level, startCol, baseRow, height, direction) {
        for (let step = 0; step < height; step++) {
            const col = direction > 0 ? startCol + step : startCol - step;
            for (let h = 0; h <= step; h++) {
                const row = baseRow - h;
                if (row >= 0 && col >= 0 && col < level.width) {
                    level.tiles[row * level.width + col] = 15;
                }
            }
        }
    }

    function buildFlagPole(level, col, baseRow) {
        for (let row = baseRow - 10; row <= baseRow; row++) {
            level.tiles[row * level.width + col] = 61;
        }
        level.tiles[(baseRow - 10) * level.width + col] = 60;
    }

    function addCloudPattern(level) {
        const clouds = [];
        for (let x = 0; x < level.width * TILE; x += 200 + Math.random() * 300) {
            clouds.push({
                x,
                y: 20 + Math.random() * 50,
                w: 40 + Math.random() * 60
            });
        }
        level.clouds = clouds;
    }

    function generateLevel_1_1() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '1-1';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);

        setTileRange(level, 69, LEVEL_HEIGHT - 2, 70, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 86, LEVEL_HEIGHT - 2, 88, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 16, 9, 16, 9, 3);
        level.blockContents = { '16,9': 'coin' };

        setTileRange(level, 20, 9, 20, 9, 2);
        setTileRange(level, 21, 9, 21, 9, 3);
        setTileRange(level, 22, 9, 22, 9, 2);
        setTileRange(level, 23, 9, 23, 9, 3);
        setTileRange(level, 24, 9, 24, 9, 2);
        level.blockContents['21,9'] = 'mushroom';
        level.blockContents['23,9'] = 'coin';

        setTileRange(level, 22, 5, 22, 5, 3);
        level.blockContents['22,5'] = 'coin';

        buildPipe(level, 28, LEVEL_HEIGHT - 2, 2);
        buildPipe(level, 38, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 46, LEVEL_HEIGHT - 2, 4);
        buildPipe(level, 57, LEVEL_HEIGHT - 2, 4);

        setTileRange(level, 77, 9, 77, 9, 3);
        setTileRange(level, 78, 5, 78, 5, 3);
        level.blockContents['77,9'] = 'mushroom';
        level.blockContents['78,5'] = 'star';

        setTileRange(level, 80, 9, 87, 9, 2);
        setTileRange(level, 91, 9, 93, 9, 2);
        setTileRange(level, 91, 5, 93, 5, 2);
        setTileRange(level, 94, 9, 94, 9, 3);
        level.blockContents['94,9'] = 'coin';

        setTileRange(level, 100, 9, 100, 9, 2);
        setTileRange(level, 118, 9, 119, 9, 3);
        level.blockContents['118,9'] = 'coin';
        level.blockContents['119,9'] = 'coin';

        setTileRange(level, 128, 9, 131, 9, 2);
        setTileRange(level, 129, 5, 130, 5, 3);
        level.blockContents['129,5'] = 'coin';
        level.blockContents['130,5'] = 'coin';

        buildStaircase(level, 134, LEVEL_HEIGHT - 2, 4, 1);
        buildStaircase(level, 140, LEVEL_HEIGHT - 2, 4, -1);

        buildStaircase(level, 148, LEVEL_HEIGHT - 2, 4, 1);
        setTileRange(level, 152, LEVEL_HEIGHT - 6, 152, LEVEL_HEIGHT - 2, 15);
        buildStaircase(level, 155, LEVEL_HEIGHT - 2, 4, -1);

        buildStaircase(level, 181, LEVEL_HEIGHT - 2, 9, 1);

        buildFlagPole(level, 198, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 22, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 40, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 38.5, y: LEVEL_HEIGHT - 4 },
            { type: 'piranha', x: 46.5, y: LEVEL_HEIGHT - 5 },
            { type: 'goomba', x: 51, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 52, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 80, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 82, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 107, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 114, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 115, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 124, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 125, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 128, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 129, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 174, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 175, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 130, y: 3 },
            { type: 'coin', x: 131, y: 3 },
            { type: 'coin', x: 132, y: 3 },
            { type: 'coin', x: 170, y: 9 },
            { type: 'coin', x: 171, y: 9 },
            { type: 'coin', x: 172, y: 9 }
        ];

        addCloudPattern(level);

        return level;
    }

    function generateLevel_1_2() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'underground';
        level.worldId = '1-2';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, LEVEL_WIDTH - 1, 0, 7);

        setTileRange(level, 11, 9, 14, 9, 2);
        setTileRange(level, 12, 9, 12, 9, 3);
        level.blockContents['12,9'] = 'mushroom';

        setTileRange(level, 20, 9, 27, 9, 2);
        setTileRange(level, 22, 5, 25, 5, 2);

        setTileRange(level, 35, 9, 38, 9, 2);
        setTileRange(level, 36, 9, 36, 9, 3);
        setTileRange(level, 37, 9, 37, 9, 3);
        level.blockContents['36,9'] = 'coin';
        level.blockContents['37,9'] = 'fireFlower';

        buildPipe(level, 42, LEVEL_HEIGHT - 2, 2);
        buildPipe(level, 55, LEVEL_HEIGHT - 2, 3);

        setTileRange(level, 60, 7, 60, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 61, 5, 61, 5, 7);
        setTileRange(level, 62, 3, 62, 3, 7);

        setTileRange(level, 65, 9, 72, 9, 2);

        setTileRange(level, 80, 7, 85, 7, 2);
        setTileRange(level, 82, 7, 82, 7, 3);
        setTileRange(level, 84, 7, 84, 7, 3);
        level.blockContents['82,7'] = 'coin';
        level.blockContents['84,7'] = 'star';

        setTileRange(level, 90, LEVEL_HEIGHT - 2, 91, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 100, 5, 110, 5, 2);

        setTileRange(level, 120, 9, 128, 9, 2);
        setTileRange(level, 123, 9, 123, 9, 3);
        setTileRange(level, 125, 9, 125, 9, 3);
        level.blockContents['123,9'] = 'coin';
        level.blockContents['125,9'] = 'coin';

        buildStaircase(level, 140, LEVEL_HEIGHT - 2, 6, 1);
        buildStaircase(level, 149, LEVEL_HEIGHT - 2, 6, -1);

        buildPipe(level, 160, LEVEL_HEIGHT - 2, 2, { level: '1-3' });

        buildFlagPole(level, 190, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 15, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 16, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 30, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 45, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 46, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 50, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 55.5, y: LEVEL_HEIGHT - 4 },
            { type: 'buzzyBeetle', x: 65, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 67, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 100, y: 4 },
            { type: 'goomba', x: 103, y: 4 },
            { type: 'koopa', x: 115, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 130, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 132, y: LEVEL_HEIGHT - 2 },
            { type: 'koopaRed', x: 155, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 21, y: 7 },
            { type: 'coin', x: 22, y: 7 },
            { type: 'coin', x: 23, y: 7 },
            { type: 'coin', x: 24, y: 7 },
            { type: 'coin', x: 66, y: 7 },
            { type: 'coin', x: 67, y: 7 },
            { type: 'coin', x: 68, y: 7 },
            { type: 'coin', x: 102, y: 3 },
            { type: 'coin', x: 103, y: 3 },
            { type: 'coin', x: 104, y: 3 },
            { type: 'coin', x: 105, y: 3 }
        ];

        return level;
    }

    function generateLevel_1_3() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '1-3';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 300;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 15, LEVEL_HEIGHT - 1, 1);

        setTileRange(level, 18, 10, 24, 10, 20);
        setTileRange(level, 28, 8, 35, 8, 20);
        setTileRange(level, 38, 6, 44, 6, 20);
        setTileRange(level, 48, 8, 55, 8, 20);

        setTileRange(level, 50, 8, 50, 8, 3);
        level.blockContents['50,8'] = 'mushroom';

        setTileRange(level, 58, 10, 65, 10, 20);
        setTileRange(level, 68, 7, 75, 7, 20);

        setTileRange(level, 71, 7, 71, 7, 3);
        setTileRange(level, 73, 7, 73, 7, 3);
        level.blockContents['71,7'] = 'coin';
        level.blockContents['73,7'] = 'fireFlower';

        setTileRange(level, 80, 9, 90, 9, 20);
        setTileRange(level, 94, 6, 100, 6, 20);
        setTileRange(level, 104, 8, 112, 8, 20);
        setTileRange(level, 116, 10, 125, 10, 20);

        setTileRange(level, 130, LEVEL_HEIGHT - 2, 200, LEVEL_HEIGHT - 1, 1);

        buildStaircase(level, 170, LEVEL_HEIGHT - 2, 8, 1);
        buildFlagPole(level, 190, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'koopaRed', x: 20, y: 9 },
            { type: 'goomba', x: 30, y: 7 },
            { type: 'goomba', x: 32, y: 7 },
            { type: 'koopa', x: 42, y: 5 },
            { type: 'koopaRed', x: 52, y: 7 },
            { type: 'goomba', x: 60, y: 9 },
            { type: 'goomba', x: 62, y: 9 },
            { type: 'koopaRed', x: 70, y: 6 },
            { type: 'goomba', x: 85, y: 8 },
            { type: 'goomba', x: 87, y: 8 },
            { type: 'koopa', x: 96, y: 5 },
            { type: 'goomba', x: 108, y: 7 },
            { type: 'koopaRed', x: 120, y: 9 },
            { type: 'goomba', x: 140, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 142, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 19, y: 8 },
            { type: 'coin', x: 20, y: 8 },
            { type: 'coin', x: 21, y: 8 },
            { type: 'coin', x: 39, y: 4 },
            { type: 'coin', x: 40, y: 4 },
            { type: 'coin', x: 41, y: 4 },
            { type: 'coin', x: 69, y: 5 },
            { type: 'coin', x: 70, y: 5 },
            { type: 'coin', x: 71, y: 5 },
            { type: 'coin', x: 95, y: 4 },
            { type: 'coin', x: 96, y: 4 },
            { type: 'coin', x: 97, y: 4 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_1_4() {
        const level = createEmptyLevel(180, LEVEL_HEIGHT);
        level.theme = 'castle';
        level.worldId = '1-4';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 350;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 179, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, 179, 0, 7);

        // Section 1: Intro with elevated platforms
        setTileRange(level, 12, 10, 18, 10, 7);
        setTileRange(level, 14, 7, 14, 7, 3);
        level.blockContents['14,7'] = 'mushroom';

        // Lava pit 1
        setTileRange(level, 22, LEVEL_HEIGHT - 2, 25, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 22, LEVEL_HEIGHT - 1, 25, LEVEL_HEIGHT - 1, 14);

        // Section 2: Rising platforms over lava
        setTileRange(level, 28, 10, 32, 10, 7);
        setTileRange(level, 35, 8, 39, 8, 7);

        // Lava pit 2
        setTileRange(level, 42, LEVEL_HEIGHT - 2, 46, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 42, LEVEL_HEIGHT - 1, 46, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 44, 9, 44, 9, 7);

        // Section 3: Upper/lower path split
        setTileRange(level, 50, 6, 58, 6, 7);
        setTileRange(level, 50, 10, 58, 10, 7);
        setTileRange(level, 55, 3, 55, 3, 3);
        level.blockContents['55,3'] = 'fireFlower';

        // Lava pit 3 (wide)
        setTileRange(level, 62, LEVEL_HEIGHT - 2, 68, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 62, LEVEL_HEIGHT - 1, 68, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 64, 10, 64, 10, 7);
        setTileRange(level, 67, 9, 67, 9, 7);

        // Section 4: Narrow corridors
        setTileRange(level, 72, 5, 80, 5, 7);
        setTileRange(level, 72, 10, 80, 10, 7);
        setTileRange(level, 76, 5, 76, 10, 0);

        // Section 5: Platforming gauntlet
        setTileRange(level, 85, 10, 88, 10, 7);
        setTileRange(level, 91, 8, 94, 8, 7);
        setTileRange(level, 97, 10, 100, 10, 7);
        setTileRange(level, 103, 7, 106, 7, 7);
        setTileRange(level, 99, 4, 99, 4, 3);
        level.blockContents['99,4'] = 'star';

        // Lava pit 4
        setTileRange(level, 109, LEVEL_HEIGHT - 2, 113, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 109, LEVEL_HEIGHT - 1, 113, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 111, 9, 111, 9, 7);

        // Section 6: Final stretch with walls
        setTileRange(level, 118, 8, 122, 8, 7);
        setTileRange(level, 120, 8, 120, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 120, 10, 120, 11, 0);

        // Section 7: Bridge over lava before boss area
        setTileRange(level, 130, LEVEL_HEIGHT - 2, 140, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 130, LEVEL_HEIGHT - 1, 140, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 130, 10, 140, 10, 14);

        // Boss platform area
        setTileRange(level, 145, 9, 155, 9, 7);
        setTileRange(level, 145, LEVEL_HEIGHT - 2, 155, LEVEL_HEIGHT - 1, 7);

        // Exit corridor
        setTileRange(level, 158, LEVEL_HEIGHT - 2, 170, LEVEL_HEIGHT - 1, 7);
        buildStaircase(level, 162, LEVEL_HEIGHT - 2, 4, 1);

        buildFlagPole(level, 170, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 15, y: 9 },
            { type: 'goomba', x: 17, y: 9 },
            { type: 'koopa', x: 30, y: 9 },
            { type: 'goomba', x: 37, y: 7 },
            { type: 'goomba', x: 52, y: 5 },
            { type: 'goomba', x: 54, y: 9 },
            { type: 'buzzyBeetle', x: 73, y: 9 },
            { type: 'buzzyBeetle', x: 75, y: 9 },
            { type: 'goomba', x: 86, y: 9 },
            { type: 'goomba', x: 92, y: 7 },
            { type: 'koopa', x: 98, y: 9 },
            { type: 'hammerBro', x: 104, y: 5 },
            { type: 'goomba', x: 119, y: 7 },
            { type: 'hammerBro', x: 148, y: 7 },
            { type: 'goomba', x: 150, y: 8 },
            { type: 'goomba', x: 152, y: 8 }
        ];

        level.items = [
            { type: 'coin', x: 29, y: 8 },
            { type: 'coin', x: 30, y: 8 },
            { type: 'coin', x: 31, y: 8 },
            { type: 'coin', x: 36, y: 6 },
            { type: 'coin', x: 37, y: 6 },
            { type: 'coin', x: 51, y: 4 },
            { type: 'coin', x: 52, y: 4 },
            { type: 'coin', x: 53, y: 4 },
            { type: 'coin', x: 92, y: 6 },
            { type: 'coin', x: 93, y: 6 },
            { type: 'coin', x: 134, y: 8 },
            { type: 'coin', x: 136, y: 8 },
            { type: 'coin', x: 138, y: 8 }
        ];

        return level;
    }

    // ========== World 2 ==========

    function generateLevel_2_1() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '2-1';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);

        // Gap 1
        setTileRange(level, 18, LEVEL_HEIGHT - 2, 20, LEVEL_HEIGHT - 1, 0);

        // Block row with power-up
        setTileRange(level, 14, 9, 14, 9, 3);
        setTileRange(level, 15, 9, 17, 9, 2);
        level.blockContents = { '14,9': 'mushroom' };

        // Pipe section
        buildPipe(level, 25, LEVEL_HEIGHT - 2, 2);
        buildPipe(level, 32, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 38, LEVEL_HEIGHT - 2, 4);

        // Gap 2
        setTileRange(level, 43, LEVEL_HEIGHT - 2, 45, LEVEL_HEIGHT - 1, 0);

        // Mid section platforms
        setTileRange(level, 50, 9, 54, 9, 2);
        setTileRange(level, 52, 9, 52, 9, 3);
        level.blockContents['52,9'] = 'fireFlower';
        setTileRange(level, 52, 5, 52, 5, 3);
        level.blockContents['52,5'] = 'coin';

        setTileRange(level, 60, 7, 65, 7, 2);
        setTileRange(level, 60, 11, 65, 11, 1);

        // Gap 3 with stepping stone
        setTileRange(level, 70, LEVEL_HEIGHT - 2, 74, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 72, 10, 72, 10, 7);

        // High-low pattern
        setTileRange(level, 80, 9, 83, 9, 2);
        setTileRange(level, 87, 6, 90, 6, 2);
        setTileRange(level, 94, 9, 97, 9, 2);
        setTileRange(level, 89, 6, 89, 6, 3);
        level.blockContents['89,6'] = 'star';

        // Staircase platforms
        setTileRange(level, 105, 11, 108, 11, 1);
        setTileRange(level, 110, 9, 113, 9, 1);
        setTileRange(level, 115, 7, 118, 7, 1);

        // Gap 4
        setTileRange(level, 122, LEVEL_HEIGHT - 2, 124, LEVEL_HEIGHT - 1, 0);

        // Block puzzle
        setTileRange(level, 130, 9, 136, 9, 2);
        setTileRange(level, 132, 5, 134, 5, 2);
        setTileRange(level, 133, 9, 133, 9, 3);
        setTileRange(level, 133, 5, 133, 5, 3);
        level.blockContents['133,9'] = 'coin';
        level.blockContents['133,5'] = 'mushroom';

        // Gap 5
        setTileRange(level, 142, LEVEL_HEIGHT - 2, 144, LEVEL_HEIGHT - 1, 0);

        // Pipe bridge
        buildPipe(level, 150, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 156, LEVEL_HEIGHT - 2, 5);

        // End section
        buildStaircase(level, 170, LEVEL_HEIGHT - 2, 5, 1);
        buildStaircase(level, 178, LEVEL_HEIGHT - 2, 5, -1);

        buildStaircase(level, 185, LEVEL_HEIGHT - 2, 9, 1);
        buildFlagPole(level, 200, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 12, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 24, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 32.5, y: LEVEL_HEIGHT - 4 },
            { type: 'koopa', x: 30, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 35, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 36, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 38.5, y: LEVEL_HEIGHT - 5 },
            { type: 'koopa', x: 48, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 55, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 62, y: 6 },
            { type: 'koopaRed', x: 63, y: 6 },
            { type: 'goomba', x: 80, y: 8 },
            { type: 'goomba', x: 82, y: 8 },
            { type: 'koopa', x: 95, y: 8 },
            { type: 'goomba', x: 100, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 102, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 112, y: 8 },
            { type: 'goomba', x: 131, y: 8 },
            { type: 'goomba', x: 133, y: 8 },
            { type: 'koopa', x: 148, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 156.5, y: LEVEL_HEIGHT - 6 },
            { type: 'goomba', x: 165, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 167, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 15, y: 7 },
            { type: 'coin', x: 16, y: 7 },
            { type: 'coin', x: 61, y: 5 },
            { type: 'coin', x: 62, y: 5 },
            { type: 'coin', x: 63, y: 5 },
            { type: 'coin', x: 64, y: 5 },
            { type: 'coin', x: 88, y: 4 },
            { type: 'coin', x: 89, y: 4 },
            { type: 'coin', x: 116, y: 5 },
            { type: 'coin', x: 117, y: 5 },
            { type: 'coin', x: 175, y: 8 },
            { type: 'coin', x: 176, y: 8 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_2_2() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'underground';
        level.worldId = '2-2';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, LEVEL_WIDTH - 1, 0, 7);

        // Intro area with coins
        setTileRange(level, 10, 9, 16, 9, 2);
        setTileRange(level, 12, 9, 12, 9, 3);
        setTileRange(level, 14, 9, 14, 9, 3);
        level.blockContents = { '12,9': 'mushroom', '14,9': 'coin' };

        // Low ceiling section
        setTileRange(level, 20, 4, 35, 4, 7);
        setTileRange(level, 22, 8, 28, 8, 2);
        setTileRange(level, 24, 8, 24, 8, 3);
        setTileRange(level, 26, 8, 26, 8, 3);
        level.blockContents['24,8'] = 'coin';
        level.blockContents['26,8'] = 'fireFlower';

        // Pit section
        setTileRange(level, 38, LEVEL_HEIGHT - 2, 41, LEVEL_HEIGHT - 1, 0);

        // Elevated tunnels
        setTileRange(level, 45, 3, 60, 3, 7);
        setTileRange(level, 45, 7, 55, 7, 7);
        setTileRange(level, 48, 7, 48, 7, 0);
        setTileRange(level, 52, 7, 52, 7, 0);
        setTileRange(level, 58, 7, 60, 7, 0);

        // Secret area
        setTileRange(level, 50, 10, 54, 10, 7);
        setTileRange(level, 51, 3, 51, 3, 3);
        level.blockContents['51,3'] = 'star';

        // Pipe section
        buildPipe(level, 65, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 72, LEVEL_HEIGHT - 2, 4);
        buildPipe(level, 78, LEVEL_HEIGHT - 2, 2);

        // Floating brick rows
        setTileRange(level, 85, 9, 92, 9, 2);
        setTileRange(level, 85, 5, 92, 5, 2);
        setTileRange(level, 88, 5, 88, 5, 3);
        level.blockContents['88,5'] = 'coin';

        // Vertical wall with passage
        setTileRange(level, 98, 3, 98, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 98, 10, 98, 11, 0);

        // Gap
        setTileRange(level, 105, LEVEL_HEIGHT - 2, 108, LEVEL_HEIGHT - 1, 0);

        // Post-wall section
        setTileRange(level, 110, 8, 118, 8, 2);
        setTileRange(level, 113, 8, 113, 8, 3);
        setTileRange(level, 115, 8, 115, 8, 3);
        level.blockContents['113,8'] = 'coin';
        level.blockContents['115,8'] = 'mushroom';

        // Staircase section
        buildStaircase(level, 125, LEVEL_HEIGHT - 2, 5, 1);
        setTileRange(level, 130, LEVEL_HEIGHT - 7, 138, LEVEL_HEIGHT - 7, 7);

        buildStaircase(level, 143, LEVEL_HEIGHT - 2, 5, -1);

        // Low ceiling narrow
        setTileRange(level, 150, 5, 165, 5, 7);

        // Pipe exit
        buildPipe(level, 170, LEVEL_HEIGHT - 2, 3);

        // End
        buildStaircase(level, 180, LEVEL_HEIGHT - 2, 4, 1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 8, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 22, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 24, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 32, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 46, y: 6 },
            { type: 'goomba', x: 48, y: 6 },
            { type: 'koopa', x: 53, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 65.5, y: LEVEL_HEIGHT - 4 },
            { type: 'goomba', x: 68, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 70, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 72.5, y: LEVEL_HEIGHT - 5 },
            { type: 'buzzyBeetle', x: 87, y: 8 },
            { type: 'buzzyBeetle', x: 89, y: 8 },
            { type: 'goomba', x: 95, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 112, y: 7 },
            { type: 'goomba', x: 115, y: 7 },
            { type: 'buzzyBeetle', x: 135, y: LEVEL_HEIGHT - 8 },
            { type: 'goomba', x: 155, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 157, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 162, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 23, y: 6 },
            { type: 'coin', x: 24, y: 6 },
            { type: 'coin', x: 25, y: 6 },
            { type: 'coin', x: 46, y: 5 },
            { type: 'coin', x: 47, y: 5 },
            { type: 'coin', x: 86, y: 3 },
            { type: 'coin', x: 87, y: 3 },
            { type: 'coin', x: 88, y: 3 },
            { type: 'coin', x: 131, y: LEVEL_HEIGHT - 9 },
            { type: 'coin', x: 132, y: LEVEL_HEIGHT - 9 },
            { type: 'coin', x: 133, y: LEVEL_HEIGHT - 9 },
            { type: 'coin', x: 155, y: 3 },
            { type: 'coin', x: 156, y: 3 },
            { type: 'coin', x: 157, y: 3 }
        ];

        return level;
    }

    function generateLevel_2_3() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '2-3';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 350;

        // Starting ground
        setTileRange(level, 0, LEVEL_HEIGHT - 2, 12, LEVEL_HEIGHT - 1, 1);

        // Floating platform world
        setTileRange(level, 15, 10, 20, 10, 20);
        setTileRange(level, 24, 8, 30, 8, 20);
        setTileRange(level, 27, 8, 27, 8, 3);
        level.blockContents = { '27,8': 'mushroom' };

        setTileRange(level, 34, 10, 38, 10, 20);
        setTileRange(level, 42, 7, 47, 7, 20);
        setTileRange(level, 44, 7, 44, 7, 3);
        level.blockContents['44,7'] = 'fireFlower';

        setTileRange(level, 50, 10, 55, 10, 20);
        setTileRange(level, 58, 6, 63, 6, 20);

        // Tricky gap with small platforms
        setTileRange(level, 66, 9, 68, 9, 20);
        setTileRange(level, 71, 7, 73, 7, 20);
        setTileRange(level, 76, 9, 78, 9, 20);

        // Wide platform with blocks
        setTileRange(level, 82, 8, 92, 8, 20);
        setTileRange(level, 85, 5, 89, 5, 2);
        setTileRange(level, 87, 5, 87, 5, 3);
        level.blockContents['87,5'] = 'star';

        // Narrow alternating platforms
        setTileRange(level, 96, 10, 99, 10, 20);
        setTileRange(level, 103, 7, 106, 7, 20);
        setTileRange(level, 110, 10, 113, 10, 20);
        setTileRange(level, 117, 6, 120, 6, 20);

        // Danger zone - small platforms
        setTileRange(level, 124, 9, 126, 9, 20);
        setTileRange(level, 130, 7, 132, 7, 20);
        setTileRange(level, 136, 9, 138, 9, 20);
        setTileRange(level, 142, 6, 144, 6, 20);
        setTileRange(level, 131, 4, 131, 4, 3);
        level.blockContents['131,4'] = 'mushroom';

        // Landing area
        setTileRange(level, 150, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);

        // End section
        buildStaircase(level, 170, LEVEL_HEIGHT - 2, 8, 1);
        buildFlagPole(level, 190, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'koopaRed', x: 17, y: 9 },
            { type: 'goomba', x: 26, y: 7 },
            { type: 'goomba', x: 28, y: 7 },
            { type: 'koopaRed', x: 36, y: 9 },
            { type: 'koopa', x: 44, y: 6 },
            { type: 'goomba', x: 52, y: 9 },
            { type: 'goomba', x: 54, y: 9 },
            { type: 'koopaRed', x: 60, y: 5 },
            { type: 'goomba', x: 72, y: 6 },
            { type: 'koopaRed', x: 84, y: 7 },
            { type: 'goomba', x: 87, y: 7 },
            { type: 'goomba', x: 90, y: 7 },
            { type: 'koopaRed', x: 104, y: 6 },
            { type: 'goomba', x: 111, y: 9 },
            { type: 'koopaRed', x: 118, y: 5 },
            { type: 'goomba', x: 125, y: 8 },
            { type: 'koopa', x: 137, y: 8 },
            { type: 'goomba', x: 155, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 158, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 16, y: 8 },
            { type: 'coin', x: 17, y: 8 },
            { type: 'coin', x: 18, y: 8 },
            { type: 'coin', x: 35, y: 8 },
            { type: 'coin', x: 36, y: 8 },
            { type: 'coin', x: 43, y: 5 },
            { type: 'coin', x: 44, y: 5 },
            { type: 'coin', x: 45, y: 5 },
            { type: 'coin', x: 59, y: 4 },
            { type: 'coin', x: 60, y: 4 },
            { type: 'coin', x: 61, y: 4 },
            { type: 'coin', x: 83, y: 3 },
            { type: 'coin', x: 84, y: 3 },
            { type: 'coin', x: 85, y: 3 },
            { type: 'coin', x: 104, y: 5 },
            { type: 'coin', x: 105, y: 5 },
            { type: 'coin', x: 143, y: 4 },
            { type: 'coin', x: 144, y: 4 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_2_4() {
        const level = createEmptyLevel(200, LEVEL_HEIGHT);
        level.theme = 'castle';
        level.worldId = '2-4';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 350;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 199, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, 199, 0, 7);

        // Section 1: Warm-up corridor
        setTileRange(level, 10, 9, 15, 9, 7);
        setTileRange(level, 12, 9, 12, 9, 3);
        level.blockContents = { '12,9': 'mushroom' };

        // Lava pit 1
        setTileRange(level, 20, LEVEL_HEIGHT - 2, 24, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 20, LEVEL_HEIGHT - 1, 24, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 22, 10, 22, 10, 7);

        // Section 2: Low-ceiling maze
        setTileRange(level, 30, 5, 50, 5, 7);
        setTileRange(level, 32, 9, 38, 9, 7);
        setTileRange(level, 42, 9, 48, 9, 7);
        setTileRange(level, 40, 5, 40, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 40, 10, 40, 11, 0);
        setTileRange(level, 35, 9, 35, 9, 3);
        level.blockContents['35,9'] = 'fireFlower';

        // Lava pit 2 (wide)
        setTileRange(level, 55, LEVEL_HEIGHT - 2, 62, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 55, LEVEL_HEIGHT - 1, 62, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 57, 10, 57, 10, 7);
        setTileRange(level, 60, 9, 60, 9, 7);

        // Section 3: Rising platforms
        setTileRange(level, 66, 10, 70, 10, 7);
        setTileRange(level, 73, 8, 77, 8, 7);
        setTileRange(level, 80, 6, 84, 6, 7);
        setTileRange(level, 82, 6, 82, 6, 3);
        level.blockContents['82,6'] = 'star';

        // Section 4: Vertical obstacle
        setTileRange(level, 90, 3, 90, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 90, 10, 90, 11, 0);
        setTileRange(level, 88, 10, 88, 10, 7);

        // Section 5: Lava bridge run
        setTileRange(level, 95, LEVEL_HEIGHT - 2, 115, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 95, LEVEL_HEIGHT - 1, 115, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 95, 10, 115, 10, 14);

        // Section 6: Two-tier corridor
        setTileRange(level, 120, 6, 140, 6, 7);
        setTileRange(level, 120, 10, 140, 10, 7);
        setTileRange(level, 130, 6, 130, 10, 7);
        setTileRange(level, 130, 8, 130, 9, 0);

        // Lava pit 3
        setTileRange(level, 145, LEVEL_HEIGHT - 2, 150, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 145, LEVEL_HEIGHT - 1, 150, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 147, 10, 147, 10, 7);
        setTileRange(level, 149, 9, 149, 9, 7);

        // Section 7: Boss arena
        setTileRange(level, 155, 8, 170, 8, 7);
        setTileRange(level, 155, LEVEL_HEIGHT - 2, 170, LEVEL_HEIGHT - 1, 7);

        // Exit
        setTileRange(level, 175, LEVEL_HEIGHT - 2, 190, LEVEL_HEIGHT - 1, 7);
        buildStaircase(level, 178, LEVEL_HEIGHT - 2, 5, 1);
        buildFlagPole(level, 190, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 11, y: 8 },
            { type: 'goomba', x: 13, y: 8 },
            { type: 'buzzyBeetle', x: 33, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 35, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 43, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 45, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 67, y: 9 },
            { type: 'goomba', x: 74, y: 7 },
            { type: 'goomba', x: 76, y: 7 },
            { type: 'hammerBro', x: 82, y: 4 },
            { type: 'goomba', x: 95, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 122, y: 9 },
            { type: 'goomba', x: 125, y: 9 },
            { type: 'goomba', x: 133, y: 9 },
            { type: 'goomba', x: 135, y: 9 },
            { type: 'hammerBro', x: 138, y: 9 },
            { type: 'hammerBro', x: 160, y: 6 },
            { type: 'goomba', x: 163, y: 7 },
            { type: 'goomba', x: 165, y: 7 },
            { type: 'koopa', x: 167, y: 7 }
        ];

        level.items = [
            { type: 'coin', x: 33, y: 7 },
            { type: 'coin', x: 34, y: 7 },
            { type: 'coin', x: 35, y: 7 },
            { type: 'coin', x: 43, y: 7 },
            { type: 'coin', x: 44, y: 7 },
            { type: 'coin', x: 67, y: 8 },
            { type: 'coin', x: 68, y: 8 },
            { type: 'coin', x: 74, y: 6 },
            { type: 'coin', x: 75, y: 6 },
            { type: 'coin', x: 100, y: 8 },
            { type: 'coin', x: 102, y: 8 },
            { type: 'coin', x: 104, y: 8 },
            { type: 'coin', x: 122, y: 4 },
            { type: 'coin', x: 123, y: 4 },
            { type: 'coin', x: 124, y: 4 }
        ];

        return level;
    }

    // ========== World 3 ==========

    function generateLevel_3_1() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'night';
        level.worldId = '3-1';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);

        // Intro section with mushroom
        setTileRange(level, 12, 9, 16, 9, 2);
        setTileRange(level, 14, 9, 14, 9, 3);
        level.blockContents = { '14,9': 'mushroom' };

        // Pipe canyon
        buildPipe(level, 20, LEVEL_HEIGHT - 2, 3);
        setTileRange(level, 24, LEVEL_HEIGHT - 2, 27, LEVEL_HEIGHT - 1, 0);
        buildPipe(level, 30, LEVEL_HEIGHT - 2, 4);

        // Elevated section
        setTileRange(level, 35, 7, 40, 7, 2);
        setTileRange(level, 37, 7, 37, 7, 3);
        level.blockContents['37,7'] = 'fireFlower';

        // Double gap
        setTileRange(level, 45, LEVEL_HEIGHT - 2, 47, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 50, 11, 52, 11, 1);
        setTileRange(level, 55, LEVEL_HEIGHT - 2, 57, LEVEL_HEIGHT - 1, 0);

        // Multi-height platforms
        setTileRange(level, 62, 10, 66, 10, 2);
        setTileRange(level, 70, 7, 74, 7, 2);
        setTileRange(level, 78, 10, 82, 10, 2);
        setTileRange(level, 86, 5, 90, 5, 2);
        setTileRange(level, 72, 4, 72, 4, 3);
        level.blockContents['72,4'] = 'star';

        // Wide gap
        setTileRange(level, 95, LEVEL_HEIGHT - 2, 100, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 97, 10, 97, 10, 7);

        // Block towers
        setTileRange(level, 108, 9, 111, 9, 2);
        setTileRange(level, 108, 5, 111, 5, 2);
        setTileRange(level, 109, 5, 109, 5, 3);
        setTileRange(level, 110, 5, 110, 5, 3);
        level.blockContents['109,5'] = 'coin';
        level.blockContents['110,5'] = 'mushroom';

        // Pipe maze
        buildPipe(level, 120, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 126, LEVEL_HEIGHT - 2, 5);
        buildPipe(level, 132, LEVEL_HEIGHT - 2, 2);
        buildPipe(level, 138, LEVEL_HEIGHT - 2, 6);

        // Gap before end
        setTileRange(level, 145, LEVEL_HEIGHT - 2, 148, LEVEL_HEIGHT - 1, 0);

        // End section
        setTileRange(level, 155, 9, 162, 9, 2);
        buildStaircase(level, 170, LEVEL_HEIGHT - 2, 6, 1);
        buildStaircase(level, 180, LEVEL_HEIGHT - 2, 6, -1);
        buildStaircase(level, 188, LEVEL_HEIGHT - 2, 8, 1);
        buildFlagPole(level, 200, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 10, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 18, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 20.5, y: LEVEL_HEIGHT - 4 },
            { type: 'koopa', x: 28, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 30.5, y: LEVEL_HEIGHT - 5 },
            { type: 'goomba', x: 36, y: 6 },
            { type: 'goomba', x: 38, y: 6 },
            { type: 'koopaRed', x: 63, y: 9 },
            { type: 'goomba', x: 65, y: 9 },
            { type: 'koopa', x: 71, y: 6 },
            { type: 'goomba', x: 80, y: 9 },
            { type: 'koopaRed', x: 88, y: 4 },
            { type: 'goomba', x: 104, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 106, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 109, y: 8 },
            { type: 'koopa', x: 124, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 126.5, y: LEVEL_HEIGHT - 6 },
            { type: 'goomba', x: 130, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 135, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 138.5, y: LEVEL_HEIGHT - 7 },
            { type: 'goomba', x: 155, y: 8 },
            { type: 'goomba', x: 157, y: 8 },
            { type: 'koopa', x: 160, y: 8 }
        ];

        level.items = [
            { type: 'coin', x: 36, y: 5 },
            { type: 'coin', x: 37, y: 5 },
            { type: 'coin', x: 38, y: 5 },
            { type: 'coin', x: 62, y: 8 },
            { type: 'coin', x: 63, y: 8 },
            { type: 'coin', x: 71, y: 5 },
            { type: 'coin', x: 72, y: 5 },
            { type: 'coin', x: 87, y: 3 },
            { type: 'coin', x: 88, y: 3 },
            { type: 'coin', x: 89, y: 3 },
            { type: 'coin', x: 156, y: 7 },
            { type: 'coin', x: 157, y: 7 },
            { type: 'coin', x: 158, y: 7 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_3_2() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'underground';
        level.worldId = '3-2';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, LEVEL_WIDTH - 1, 0, 7);

        // Opening
        setTileRange(level, 10, 9, 14, 9, 2);
        setTileRange(level, 12, 9, 12, 9, 3);
        level.blockContents = { '12,9': 'mushroom' };

        // Spike ceiling section
        setTileRange(level, 18, 3, 35, 3, 7);
        setTileRange(level, 20, 9, 25, 9, 2);
        setTileRange(level, 22, 9, 22, 9, 3);
        level.blockContents['22,9'] = 'coin';
        setTileRange(level, 28, 7, 33, 7, 2);
        setTileRange(level, 30, 7, 30, 7, 3);
        level.blockContents['30,7'] = 'fireFlower';

        // Pit 1
        setTileRange(level, 38, LEVEL_HEIGHT - 2, 41, LEVEL_HEIGHT - 1, 0);

        // Winding tunnel
        setTileRange(level, 45, 4, 65, 4, 7);
        setTileRange(level, 45, 8, 55, 8, 7);
        setTileRange(level, 58, 8, 65, 8, 7);
        setTileRange(level, 55, 4, 55, 8, 7);
        setTileRange(level, 55, 6, 55, 7, 0);

        // Open area with columns
        setTileRange(level, 70, 3, 70, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 70, 9, 70, 10, 0);
        setTileRange(level, 80, 3, 80, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 80, 7, 80, 9, 0);

        // Floating blocks
        setTileRange(level, 85, 9, 92, 9, 2);
        setTileRange(level, 88, 9, 88, 9, 3);
        level.blockContents['88,9'] = 'star';
        setTileRange(level, 85, 5, 92, 5, 2);

        // Pit 2
        setTileRange(level, 98, LEVEL_HEIGHT - 2, 102, LEVEL_HEIGHT - 1, 0);

        // Elevated passage
        setTileRange(level, 108, 4, 125, 4, 7);
        setTileRange(level, 108, 9, 115, 9, 7);
        setTileRange(level, 118, 9, 125, 9, 7);
        setTileRange(level, 115, 4, 115, 9, 7);
        setTileRange(level, 115, 7, 115, 8, 0);

        // Block row with coins
        setTileRange(level, 130, 9, 140, 9, 2);
        setTileRange(level, 133, 9, 133, 9, 3);
        setTileRange(level, 137, 9, 137, 9, 3);
        level.blockContents['133,9'] = 'coin';
        level.blockContents['137,9'] = 'mushroom';

        // Pipe section
        buildPipe(level, 148, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 155, LEVEL_HEIGHT - 2, 4);
        buildPipe(level, 160, LEVEL_HEIGHT - 2, 2);

        // Staircase exit
        setTileRange(level, 170, 5, 180, 5, 7);
        buildStaircase(level, 175, LEVEL_HEIGHT - 2, 4, 1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'buzzyBeetle', x: 11, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 21, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 23, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 29, y: 6 },
            { type: 'goomba', x: 46, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 48, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 59, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 61, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 75, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 77, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 87, y: 8 },
            { type: 'goomba', x: 90, y: 8 },
            { type: 'goomba', x: 109, y: 8 },
            { type: 'goomba', x: 111, y: 8 },
            { type: 'buzzyBeetle', x: 119, y: 8 },
            { type: 'buzzyBeetle', x: 121, y: 8 },
            { type: 'koopa', x: 132, y: 8 },
            { type: 'goomba', x: 135, y: 8 },
            { type: 'goomba', x: 138, y: 8 },
            { type: 'piranha', x: 148.5, y: LEVEL_HEIGHT - 4 },
            { type: 'koopa', x: 152, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 155.5, y: LEVEL_HEIGHT - 5 },
            { type: 'goomba', x: 163, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 21, y: 7 },
            { type: 'coin', x: 22, y: 7 },
            { type: 'coin', x: 23, y: 7 },
            { type: 'coin', x: 46, y: 6 },
            { type: 'coin', x: 47, y: 6 },
            { type: 'coin', x: 48, y: 6 },
            { type: 'coin', x: 72, y: 7 },
            { type: 'coin', x: 73, y: 7 },
            { type: 'coin', x: 74, y: 7 },
            { type: 'coin', x: 86, y: 3 },
            { type: 'coin', x: 87, y: 3 },
            { type: 'coin', x: 88, y: 3 },
            { type: 'coin', x: 131, y: 7 },
            { type: 'coin', x: 132, y: 7 },
            { type: 'coin', x: 133, y: 7 }
        ];

        return level;
    }

    function generateLevel_3_3() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '3-3';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 350;

        // Starting ground
        setTileRange(level, 0, LEVEL_HEIGHT - 2, 10, LEVEL_HEIGHT - 1, 1);

        // Sky platforms (pure platforming)
        setTileRange(level, 13, 11, 17, 11, 20);
        setTileRange(level, 20, 9, 24, 9, 20);
        setTileRange(level, 22, 9, 22, 9, 3);
        level.blockContents = { '22,9': 'mushroom' };

        setTileRange(level, 28, 7, 31, 7, 20);
        setTileRange(level, 35, 10, 39, 10, 20);
        setTileRange(level, 42, 6, 46, 6, 20);
        setTileRange(level, 44, 3, 44, 3, 3);
        level.blockContents['44,3'] = 'fireFlower';

        // Moving gap section (small platforms)
        setTileRange(level, 50, 9, 52, 9, 20);
        setTileRange(level, 56, 7, 58, 7, 20);
        setTileRange(level, 62, 9, 64, 9, 20);
        setTileRange(level, 68, 5, 70, 5, 20);

        // Wide resting platform
        setTileRange(level, 74, 8, 84, 8, 20);
        setTileRange(level, 77, 5, 81, 5, 2);
        setTileRange(level, 79, 5, 79, 5, 3);
        level.blockContents['79,5'] = 'star';

        // Tricky section - ascending
        setTileRange(level, 88, 10, 91, 10, 20);
        setTileRange(level, 94, 8, 96, 8, 20);
        setTileRange(level, 99, 6, 101, 6, 20);
        setTileRange(level, 104, 4, 106, 4, 20);
        setTileRange(level, 109, 7, 112, 7, 20);

        // Descending back down
        setTileRange(level, 116, 9, 119, 9, 20);
        setTileRange(level, 123, 11, 126, 11, 20);
        setTileRange(level, 130, 8, 134, 8, 20);
        setTileRange(level, 132, 5, 132, 5, 3);
        level.blockContents['132,5'] = 'mushroom';

        // Final platforms
        setTileRange(level, 138, 10, 141, 10, 20);
        setTileRange(level, 145, 8, 148, 8, 20);
        setTileRange(level, 152, 10, 155, 10, 20);

        // Landing zone
        setTileRange(level, 160, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);
        buildStaircase(level, 175, LEVEL_HEIGHT - 2, 8, 1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'koopaRed', x: 14, y: 10 },
            { type: 'goomba', x: 21, y: 8 },
            { type: 'goomba', x: 23, y: 8 },
            { type: 'koopaRed', x: 29, y: 6 },
            { type: 'goomba', x: 36, y: 9 },
            { type: 'koopa', x: 43, y: 5 },
            { type: 'goomba', x: 51, y: 8 },
            { type: 'koopaRed', x: 57, y: 6 },
            { type: 'goomba', x: 63, y: 8 },
            { type: 'koopaRed', x: 69, y: 4 },
            { type: 'goomba', x: 76, y: 7 },
            { type: 'goomba', x: 78, y: 7 },
            { type: 'koopa', x: 82, y: 7 },
            { type: 'koopaRed', x: 95, y: 7 },
            { type: 'goomba', x: 100, y: 5 },
            { type: 'koopaRed', x: 110, y: 6 },
            { type: 'goomba', x: 117, y: 8 },
            { type: 'goomba', x: 124, y: 10 },
            { type: 'koopaRed', x: 131, y: 7 },
            { type: 'goomba', x: 146, y: 7 },
            { type: 'goomba', x: 165, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 14, y: 9 },
            { type: 'coin', x: 15, y: 9 },
            { type: 'coin', x: 29, y: 5 },
            { type: 'coin', x: 30, y: 5 },
            { type: 'coin', x: 43, y: 4 },
            { type: 'coin', x: 44, y: 4 },
            { type: 'coin', x: 57, y: 5 },
            { type: 'coin', x: 69, y: 3 },
            { type: 'coin', x: 70, y: 3 },
            { type: 'coin', x: 94, y: 6 },
            { type: 'coin', x: 95, y: 6 },
            { type: 'coin', x: 105, y: 2 },
            { type: 'coin', x: 106, y: 2 },
            { type: 'coin', x: 139, y: 8 },
            { type: 'coin', x: 140, y: 8 },
            { type: 'coin', x: 153, y: 8 },
            { type: 'coin', x: 154, y: 8 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_3_4() {
        const level = createEmptyLevel(220, LEVEL_HEIGHT);
        level.theme = 'castle';
        level.worldId = '3-4';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 219, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, 219, 0, 7);

        // Section 1: Intro
        setTileRange(level, 10, 9, 14, 9, 7);
        setTileRange(level, 12, 9, 12, 9, 3);
        level.blockContents = { '12,9': 'mushroom' };

        // Lava pit 1
        setTileRange(level, 18, LEVEL_HEIGHT - 2, 22, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 18, LEVEL_HEIGHT - 1, 22, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 20, 10, 20, 10, 7);

        // Section 2: Platform climb
        setTileRange(level, 26, 10, 30, 10, 7);
        setTileRange(level, 33, 8, 37, 8, 7);
        setTileRange(level, 35, 8, 35, 8, 3);
        level.blockContents['35,8'] = 'fireFlower';
        setTileRange(level, 40, 6, 44, 6, 7);

        // Lava pit 2 (wide)
        setTileRange(level, 48, LEVEL_HEIGHT - 2, 56, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 48, LEVEL_HEIGHT - 1, 56, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 50, 10, 50, 10, 7);
        setTileRange(level, 53, 9, 53, 9, 7);

        // Section 3: Maze-like corridors
        setTileRange(level, 60, 5, 80, 5, 7);
        setTileRange(level, 60, 9, 68, 9, 7);
        setTileRange(level, 72, 9, 80, 9, 7);
        setTileRange(level, 68, 5, 68, 9, 7);
        setTileRange(level, 68, 7, 68, 8, 0);
        setTileRange(level, 65, 9, 65, 9, 3);
        level.blockContents['65,9'] = 'star';

        // Lava pit 3
        setTileRange(level, 84, LEVEL_HEIGHT - 2, 90, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 84, LEVEL_HEIGHT - 1, 90, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 86, 10, 86, 10, 7);
        setTileRange(level, 89, 9, 89, 9, 7);

        // Section 4: Gauntlet run
        setTileRange(level, 95, 8, 100, 8, 7);
        setTileRange(level, 103, 10, 107, 10, 7);
        setTileRange(level, 110, 7, 114, 7, 7);
        setTileRange(level, 117, 10, 121, 10, 7);
        setTileRange(level, 124, 6, 128, 6, 7);

        // Lava bridge
        setTileRange(level, 132, LEVEL_HEIGHT - 2, 145, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 132, LEVEL_HEIGHT - 1, 145, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 132, 10, 145, 10, 14);

        // Section 5: Wall barriers
        setTileRange(level, 150, 4, 150, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 150, 10, 150, 11, 0);
        setTileRange(level, 148, 10, 148, 10, 7);

        // Section 6: Final corridor
        setTileRange(level, 155, 6, 170, 6, 7);
        setTileRange(level, 155, 10, 170, 10, 7);
        setTileRange(level, 163, 6, 163, 10, 7);
        setTileRange(level, 163, 8, 163, 9, 0);

        // Lava pit 4
        setTileRange(level, 175, LEVEL_HEIGHT - 2, 182, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 175, LEVEL_HEIGHT - 1, 182, LEVEL_HEIGHT - 1, 14);
        setTileRange(level, 177, 10, 177, 10, 7);
        setTileRange(level, 180, 9, 180, 9, 7);

        // Boss area (large)
        setTileRange(level, 188, 8, 200, 8, 7);
        setTileRange(level, 188, LEVEL_HEIGHT - 2, 200, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 195, 5, 195, 5, 3);
        level.blockContents['195,5'] = 'star';

        // Exit
        setTileRange(level, 205, LEVEL_HEIGHT - 2, 215, LEVEL_HEIGHT - 1, 7);
        buildStaircase(level, 207, LEVEL_HEIGHT - 2, 5, 1);
        buildFlagPole(level, 215, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'goomba', x: 11, y: 8 },
            { type: 'goomba', x: 13, y: 8 },
            { type: 'buzzyBeetle', x: 27, y: 9 },
            { type: 'goomba', x: 34, y: 7 },
            { type: 'goomba', x: 36, y: 7 },
            { type: 'koopa', x: 42, y: 5 },
            { type: 'goomba', x: 61, y: 8 },
            { type: 'goomba', x: 63, y: 8 },
            { type: 'buzzyBeetle', x: 73, y: 8 },
            { type: 'buzzyBeetle', x: 75, y: 8 },
            { type: 'hammerBro', x: 78, y: 7 },
            { type: 'goomba', x: 96, y: 7 },
            { type: 'goomba', x: 98, y: 7 },
            { type: 'koopa', x: 104, y: 9 },
            { type: 'hammerBro', x: 112, y: 5 },
            { type: 'goomba', x: 118, y: 9 },
            { type: 'goomba', x: 120, y: 9 },
            { type: 'buzzyBeetle', x: 126, y: 5 },
            { type: 'goomba', x: 156, y: 9 },
            { type: 'goomba', x: 158, y: 9 },
            { type: 'hammerBro', x: 165, y: 8 },
            { type: 'koopa', x: 168, y: 9 },
            { type: 'hammerBro', x: 192, y: 6 },
            { type: 'hammerBro', x: 196, y: 6 },
            { type: 'goomba', x: 194, y: 7 },
            { type: 'goomba', x: 198, y: 7 }
        ];

        level.items = [
            { type: 'coin', x: 27, y: 8 },
            { type: 'coin', x: 28, y: 8 },
            { type: 'coin', x: 34, y: 6 },
            { type: 'coin', x: 35, y: 6 },
            { type: 'coin', x: 36, y: 6 },
            { type: 'coin', x: 62, y: 3 },
            { type: 'coin', x: 63, y: 3 },
            { type: 'coin', x: 64, y: 3 },
            { type: 'coin', x: 73, y: 3 },
            { type: 'coin', x: 74, y: 3 },
            { type: 'coin', x: 96, y: 6 },
            { type: 'coin', x: 97, y: 6 },
            { type: 'coin', x: 111, y: 5 },
            { type: 'coin', x: 112, y: 5 },
            { type: 'coin', x: 136, y: 8 },
            { type: 'coin', x: 138, y: 8 },
            { type: 'coin', x: 140, y: 8 },
            { type: 'coin', x: 156, y: 4 },
            { type: 'coin', x: 157, y: 4 },
            { type: 'coin', x: 158, y: 4 }
        ];

        return level;
    }

    // ========== World 4 ==========

    function generateLevel_4_1() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'overworld';
        level.worldId = '4-1';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 350;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);

        setTileRange(level, 16, LEVEL_HEIGHT - 2, 18, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 24, LEVEL_HEIGHT - 2, 27, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 20, 9, 22, 9, 3);
        level.blockContents = { '20,9': 'mushroom', '21,9': 'coin', '22,9': 'coin' };

        buildPipe(level, 32, LEVEL_HEIGHT - 2, 3);
        buildPipe(level, 40, LEVEL_HEIGHT - 2, 5);
        setTileRange(level, 36, LEVEL_HEIGHT - 2, 38, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 48, 7, 55, 7, 2);
        setTileRange(level, 51, 7, 51, 7, 3);
        level.blockContents['51,7'] = 'fireFlower';
        setTileRange(level, 48, 11, 55, 11, 20);

        setTileRange(level, 60, LEVEL_HEIGHT - 2, 64, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 62, 9, 62, 9, 2);
        setTileRange(level, 64, 7, 64, 7, 2);
        setTileRange(level, 66, 5, 66, 5, 2);

        buildStaircase(level, 72, LEVEL_HEIGHT - 2, 5, 1);
        setTileRange(level, 77, LEVEL_HEIGHT - 2, 80, LEVEL_HEIGHT - 1, 0);
        buildStaircase(level, 85, LEVEL_HEIGHT - 2, 5, -1);

        setTileRange(level, 90, 8, 95, 8, 2);
        setTileRange(level, 92, 8, 92, 8, 3);
        level.blockContents['92,8'] = 'star';

        setTileRange(level, 100, LEVEL_HEIGHT - 2, 103, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 101, 9, 102, 9, 20);

        buildPipe(level, 110, LEVEL_HEIGHT - 2, 4);
        buildPipe(level, 118, LEVEL_HEIGHT - 2, 3);
        setTileRange(level, 115, LEVEL_HEIGHT - 2, 116, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 125, 6, 132, 6, 2);
        setTileRange(level, 128, 6, 128, 6, 3);
        level.blockContents['128,6'] = 'mushroom';
        setTileRange(level, 125, 10, 132, 10, 2);

        setTileRange(level, 140, LEVEL_HEIGHT - 2, 144, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 141, 10, 143, 10, 20);

        buildStaircase(level, 155, LEVEL_HEIGHT - 2, 6, 1);
        buildStaircase(level, 165, LEVEL_HEIGHT - 2, 4, -1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'koopa', x: 14, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 22, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 32.5, y: LEVEL_HEIGHT - 4 },
            { type: 'goomba', x: 34, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 40.5, y: LEVEL_HEIGHT - 6 },
            { type: 'hammerBro', x: 50, y: 6 },
            { type: 'goomba', x: 53, y: 10 },
            { type: 'koopa', x: 58, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 75, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 77, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 92, y: 7 },
            { type: 'goomba', x: 105, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 108, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 110.5, y: LEVEL_HEIGHT - 5 },
            { type: 'goomba', x: 113, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 118.5, y: LEVEL_HEIGHT - 4 },
            { type: 'hammerBro', x: 127, y: 5 },
            { type: 'goomba', x: 130, y: 9 },
            { type: 'koopa', x: 148, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 150, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 160, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 162, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 49, y: 5 },
            { type: 'coin', x: 50, y: 5 },
            { type: 'coin', x: 51, y: 5 },
            { type: 'coin', x: 63, y: 5 },
            { type: 'coin', x: 65, y: 3 },
            { type: 'coin', x: 126, y: 4 },
            { type: 'coin', x: 127, y: 4 },
            { type: 'coin', x: 128, y: 4 },
            { type: 'coin', x: 156, y: 5 },
            { type: 'coin', x: 157, y: 4 },
            { type: 'coin', x: 158, y: 3 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_4_2() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'underground';
        level.worldId = '4-2';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 400;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, LEVEL_WIDTH - 1, 0, 7);

        setTileRange(level, 12, 9, 18, 9, 2);
        setTileRange(level, 15, 9, 15, 9, 3);
        level.blockContents = { '15,9': 'mushroom' };

        setTileRange(level, 22, 4, 38, 4, 7);
        setTileRange(level, 22, 10, 30, 10, 7);
        setTileRange(level, 30, 4, 30, 10, 7);
        setTileRange(level, 30, 7, 30, 8, 0);

        setTileRange(level, 34, 10, 38, 10, 7);
        setTileRange(level, 38, 4, 38, 10, 7);
        setTileRange(level, 38, 6, 38, 7, 0);

        setTileRange(level, 44, LEVEL_HEIGHT - 2, 47, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 52, 4, 68, 4, 7);
        setTileRange(level, 52, 8, 60, 8, 7);
        setTileRange(level, 60, 4, 60, 8, 7);
        setTileRange(level, 60, 5, 60, 6, 0);
        setTileRange(level, 64, 8, 68, 8, 7);
        setTileRange(level, 68, 4, 68, 8, 7);
        setTileRange(level, 68, 6, 68, 7, 0);

        setTileRange(level, 55, 7, 55, 7, 3);
        level.blockContents['55,7'] = 'fireFlower';

        setTileRange(level, 75, 9, 82, 9, 2);
        setTileRange(level, 78, 9, 78, 9, 3);
        level.blockContents['78,9'] = 'star';
        setTileRange(level, 75, 5, 82, 5, 2);

        setTileRange(level, 88, LEVEL_HEIGHT - 2, 91, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 96, 3, 115, 3, 7);
        setTileRange(level, 96, 10, 106, 10, 7);
        setTileRange(level, 106, 3, 106, 10, 7);
        setTileRange(level, 106, 7, 106, 9, 0);
        setTileRange(level, 110, 10, 115, 10, 7);
        setTileRange(level, 115, 3, 115, 10, 7);
        setTileRange(level, 115, 5, 115, 6, 0);

        setTileRange(level, 100, 9, 100, 9, 3);
        level.blockContents['100,9'] = 'mushroom';

        setTileRange(level, 120, 8, 130, 8, 2);
        setTileRange(level, 125, 8, 125, 8, 3);
        level.blockContents['125,8'] = 'coin';

        buildPipe(level, 140, LEVEL_HEIGHT - 2, 3);

        setTileRange(level, 150, 5, 165, 5, 7);
        buildStaircase(level, 170, LEVEL_HEIGHT - 2, 4, 1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'buzzyBeetle', x: 14, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 24, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 26, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 33, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 54, y: 7 },
            { type: 'goomba', x: 56, y: 7 },
            { type: 'buzzyBeetle', x: 65, y: 7 },
            { type: 'koopa', x: 77, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 80, y: 4 },
            { type: 'goomba', x: 98, y: 9 },
            { type: 'goomba', x: 100, y: 9 },
            { type: 'buzzyBeetle', x: 111, y: 9 },
            { type: 'koopa', x: 122, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 125, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 128, y: LEVEL_HEIGHT - 2 },
            { type: 'piranha', x: 140.5, y: LEVEL_HEIGHT - 4 },
            { type: 'hammerBro', x: 155, y: 4 }
        ];

        level.items = [
            { type: 'coin', x: 25, y: 8 },
            { type: 'coin', x: 26, y: 8 },
            { type: 'coin', x: 53, y: 6 },
            { type: 'coin', x: 54, y: 6 },
            { type: 'coin', x: 55, y: 6 },
            { type: 'coin', x: 76, y: 3 },
            { type: 'coin', x: 77, y: 3 },
            { type: 'coin', x: 78, y: 3 },
            { type: 'coin', x: 99, y: 7 },
            { type: 'coin', x: 100, y: 7 },
            { type: 'coin', x: 121, y: 6 },
            { type: 'coin', x: 122, y: 6 },
            { type: 'coin', x: 123, y: 6 }
        ];

        return level;
    }

    function generateLevel_4_3() {
        const level = createEmptyLevel(LEVEL_WIDTH, LEVEL_HEIGHT);
        level.theme = 'night';
        level.worldId = '4-3';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 300;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 8, LEVEL_HEIGHT - 1, 1);

        setTileRange(level, 12, 11, 16, 11, 20);
        setTileRange(level, 20, 9, 25, 9, 20);
        setTileRange(level, 22, 9, 22, 9, 3);
        level.blockContents = { '22,9': 'mushroom' };

        setTileRange(level, 30, 7, 34, 7, 20);
        setTileRange(level, 38, 10, 42, 10, 20);
        setTileRange(level, 46, 8, 50, 8, 20);
        setTileRange(level, 48, 8, 48, 8, 3);
        level.blockContents['48,8'] = 'fireFlower';

        setTileRange(level, 55, 6, 58, 6, 20);
        setTileRange(level, 62, 9, 66, 9, 20);
        setTileRange(level, 70, 7, 74, 7, 20);
        setTileRange(level, 72, 7, 72, 7, 3);
        level.blockContents['72,7'] = 'star';

        setTileRange(level, 78, 10, 82, 10, 20);
        setTileRange(level, 86, 8, 90, 8, 20);
        setTileRange(level, 94, 6, 98, 6, 20);

        setTileRange(level, 103, 9, 107, 9, 20);
        setTileRange(level, 111, 7, 115, 7, 20);
        setTileRange(level, 113, 7, 113, 7, 3);
        level.blockContents['113,7'] = 'mushroom';

        setTileRange(level, 119, 10, 124, 10, 20);
        setTileRange(level, 128, 8, 132, 8, 20);
        setTileRange(level, 136, 6, 142, 6, 20);

        setTileRange(level, 148, LEVEL_HEIGHT - 2, 155, LEVEL_HEIGHT - 1, 1);
        buildStaircase(level, 155, LEVEL_HEIGHT - 2, 5, 1);
        setTileRange(level, 162, LEVEL_HEIGHT - 2, LEVEL_WIDTH - 1, LEVEL_HEIGHT - 1, 1);
        buildFlagPole(level, 195, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'koopa', x: 14, y: 10 },
            { type: 'goomba', x: 22, y: 8 },
            { type: 'koopaRed', x: 32, y: 6 },
            { type: 'goomba', x: 39, y: 9 },
            { type: 'goomba', x: 41, y: 9 },
            { type: 'koopa', x: 47, y: 7 },
            { type: 'koopaRed', x: 56, y: 5 },
            { type: 'goomba', x: 63, y: 8 },
            { type: 'goomba', x: 65, y: 8 },
            { type: 'hammerBro', x: 71, y: 6 },
            { type: 'goomba', x: 80, y: 9 },
            { type: 'koopa', x: 87, y: 7 },
            { type: 'koopaRed', x: 95, y: 5 },
            { type: 'goomba', x: 104, y: 8 },
            { type: 'hammerBro', x: 112, y: 6 },
            { type: 'goomba', x: 121, y: 9 },
            { type: 'koopa', x: 129, y: 7 },
            { type: 'koopaRed', x: 138, y: 5 },
            { type: 'goomba', x: 140, y: 5 }
        ];

        level.items = [
            { type: 'coin', x: 13, y: 9 },
            { type: 'coin', x: 15, y: 9 },
            { type: 'coin', x: 31, y: 5 },
            { type: 'coin', x: 33, y: 5 },
            { type: 'coin', x: 56, y: 4 },
            { type: 'coin', x: 57, y: 4 },
            { type: 'coin', x: 87, y: 6 },
            { type: 'coin', x: 88, y: 6 },
            { type: 'coin', x: 95, y: 4 },
            { type: 'coin', x: 96, y: 4 },
            { type: 'coin', x: 129, y: 6 },
            { type: 'coin', x: 130, y: 6 },
            { type: 'coin', x: 137, y: 4 },
            { type: 'coin', x: 138, y: 4 },
            { type: 'coin', x: 139, y: 4 }
        ];

        addCloudPattern(level);
        return level;
    }

    function generateLevel_4_4() {
        const level = createEmptyLevel(240, LEVEL_HEIGHT);
        level.theme = 'castle';
        level.worldId = '4-4';
        level.spawnX = 3;
        level.spawnY = LEVEL_HEIGHT - 3;
        level.timeLimit = 450;

        setTileRange(level, 0, LEVEL_HEIGHT - 2, 239, LEVEL_HEIGHT - 1, 7);
        setTileRange(level, 0, 0, 239, 0, 7);

        setTileRange(level, 15, 9, 20, 9, 2);
        setTileRange(level, 17, 9, 17, 9, 3);
        level.blockContents = { '17,9': 'mushroom' };

        setTileRange(level, 25, 6, 25, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 25, 9, 25, 10, 0);

        setTileRange(level, 30, LEVEL_HEIGHT - 2, 34, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 31, 10, 33, 10, 20);
        setTileRange(level, 32, 10, 32, 10, 50);

        setTileRange(level, 40, 4, 55, 4, 7);
        setTileRange(level, 40, 10, 48, 10, 7);
        setTileRange(level, 48, 4, 48, 10, 7);
        setTileRange(level, 48, 7, 48, 9, 0);
        setTileRange(level, 52, 10, 55, 10, 7);
        setTileRange(level, 55, 4, 55, 10, 7);
        setTileRange(level, 55, 6, 55, 7, 0);

        setTileRange(level, 44, 9, 44, 9, 3);
        level.blockContents['44,9'] = 'fireFlower';

        setTileRange(level, 62, 6, 62, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 62, 8, 62, 9, 0);

        setTileRange(level, 68, LEVEL_HEIGHT - 2, 72, LEVEL_HEIGHT - 1, 0);

        setTileRange(level, 78, 8, 85, 8, 2);
        setTileRange(level, 81, 8, 81, 8, 3);
        level.blockContents['81,8'] = 'star';

        setTileRange(level, 90, 5, 90, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 90, 8, 90, 10, 0);
        setTileRange(level, 98, 5, 98, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 98, 6, 98, 7, 0);

        setTileRange(level, 105, LEVEL_HEIGHT - 2, 110, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 106, 10, 109, 10, 20);

        setTileRange(level, 115, 4, 130, 4, 7);
        setTileRange(level, 115, 9, 122, 9, 7);
        setTileRange(level, 122, 4, 122, 9, 7);
        setTileRange(level, 122, 6, 122, 7, 0);
        setTileRange(level, 126, 9, 130, 9, 7);
        setTileRange(level, 130, 4, 130, 9, 7);
        setTileRange(level, 130, 7, 130, 8, 0);

        setTileRange(level, 118, 8, 118, 8, 3);
        level.blockContents['118,8'] = 'mushroom';

        setTileRange(level, 138, 6, 138, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 138, 9, 138, 10, 0);
        setTileRange(level, 145, 6, 145, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 145, 7, 145, 8, 0);

        setTileRange(level, 150, LEVEL_HEIGHT - 2, 155, LEVEL_HEIGHT - 1, 0);
        setTileRange(level, 151, 10, 154, 10, 20);

        setTileRange(level, 162, 8, 170, 8, 2);
        setTileRange(level, 166, 8, 166, 8, 3);
        level.blockContents['166,8'] = 'fireFlower';

        setTileRange(level, 175, 5, 175, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 175, 9, 175, 11, 0);
        setTileRange(level, 182, 5, 182, LEVEL_HEIGHT - 2, 7);
        setTileRange(level, 182, 6, 182, 7, 0);

        setTileRange(level, 188, LEVEL_HEIGHT - 2, 192, LEVEL_HEIGHT - 1, 0);

        buildStaircase(level, 200, LEVEL_HEIGHT - 2, 5, 1);
        buildFlagPole(level, 220, LEVEL_HEIGHT - 2);

        level.enemies = [
            { type: 'buzzyBeetle', x: 12, y: LEVEL_HEIGHT - 2 },
            { type: 'goomba', x: 18, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 42, y: 9 },
            { type: 'buzzyBeetle', x: 45, y: 9 },
            { type: 'goomba', x: 53, y: 9 },
            { type: 'koopa', x: 65, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 80, y: 7 },
            { type: 'goomba', x: 83, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 93, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 95, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 117, y: 8 },
            { type: 'goomba', x: 119, y: 8 },
            { type: 'buzzyBeetle', x: 127, y: 8 },
            { type: 'koopa', x: 140, y: LEVEL_HEIGHT - 2 },
            { type: 'koopa', x: 143, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 164, y: 7 },
            { type: 'goomba', x: 167, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 178, y: LEVEL_HEIGHT - 2 },
            { type: 'buzzyBeetle', x: 180, y: LEVEL_HEIGHT - 2 },
            { type: 'hammerBro', x: 195, y: LEVEL_HEIGHT - 2, direction: -1 },
            { type: 'goomba', x: 198, y: LEVEL_HEIGHT - 2 }
        ];

        level.items = [
            { type: 'coin', x: 42, y: 7 },
            { type: 'coin', x: 43, y: 7 },
            { type: 'coin', x: 44, y: 7 },
            { type: 'coin', x: 79, y: 6 },
            { type: 'coin', x: 80, y: 6 },
            { type: 'coin', x: 81, y: 6 },
            { type: 'coin', x: 107, y: 8 },
            { type: 'coin', x: 108, y: 8 },
            { type: 'coin', x: 116, y: 6 },
            { type: 'coin', x: 117, y: 6 },
            { type: 'coin', x: 152, y: 8 },
            { type: 'coin', x: 153, y: 8 },
            { type: 'coin', x: 163, y: 6 },
            { type: 'coin', x: 164, y: 6 },
            { type: 'coin', x: 165, y: 6 }
        ];

        return level;
    }

    const levelGenerators = {
        '1-1': generateLevel_1_1,
        '1-2': generateLevel_1_2,
        '1-3': generateLevel_1_3,
        '1-4': generateLevel_1_4,
        '2-1': generateLevel_2_1,
        '2-2': generateLevel_2_2,
        '2-3': generateLevel_2_3,
        '2-4': generateLevel_2_4,
        '3-1': generateLevel_3_1,
        '3-2': generateLevel_3_2,
        '3-3': generateLevel_3_3,
        '3-4': generateLevel_3_4,
        '4-1': generateLevel_4_1,
        '4-2': generateLevel_4_2,
        '4-3': generateLevel_4_3,
        '4-4': generateLevel_4_4
    };

    function getLevel(worldId) {
        const generator = levelGenerators[worldId];
        if (generator) {
            return generator();
        }
        return generateLevel_1_1();
    }

    const LEVEL_THEMES = {
        '1-1': 'overworld', '1-2': 'underground', '1-3': 'overworld', '1-4': 'castle',
        '2-1': 'overworld', '2-2': 'underground', '2-3': 'overworld', '2-4': 'castle',
        '3-1': 'night',     '3-2': 'underground', '3-3': 'overworld', '3-4': 'castle',
        '4-1': 'overworld', '4-2': 'underground', '4-3': 'night',     '4-4': 'castle'
    };

    function getLevelList() {
        return Object.keys(levelGenerators).map(id => ({
            id,
            name: `World ${id}`,
            theme: LEVEL_THEMES[id] || 'overworld'
        }));
    }

    function getNextLevel(currentId) {
        const ids = Object.keys(levelGenerators);
        const idx = ids.indexOf(currentId);
        if (idx >= 0 && idx < ids.length - 1) {
            return ids[idx + 1];
        }
        return null;
    }

    function saveCustomLevel(name, levelData) {
        try {
            const saves = JSON.parse(localStorage.getItem('mario_custom_levels') || '{}');
            saves[name] = levelData;
            localStorage.setItem('mario_custom_levels', JSON.stringify(saves));
            return true;
        } catch (e) {
            return false;
        }
    }

    function loadCustomLevel(name) {
        try {
            const saves = JSON.parse(localStorage.getItem('mario_custom_levels') || '{}');
            return saves[name] || null;
        } catch (e) {
            return null;
        }
    }

    function getCustomLevelList() {
        try {
            const saves = JSON.parse(localStorage.getItem('mario_custom_levels') || '{}');
            return Object.keys(saves);
        } catch (e) {
            return [];
        }
    }

    function deleteCustomLevel(name) {
        try {
            const saves = JSON.parse(localStorage.getItem('mario_custom_levels') || '{}');
            delete saves[name];
            localStorage.setItem('mario_custom_levels', JSON.stringify(saves));
            return true;
        } catch (e) {
            return false;
        }
    }

    return {
        getLevel, getLevelList, getNextLevel,
        createEmptyLevel, setTileRange, buildPipe, buildStaircase, buildFlagPole,
        saveCustomLevel, loadCustomLevel, getCustomLevelList, deleteCustomLevel,
        LEVEL_WIDTH, LEVEL_HEIGHT
    };
})();
