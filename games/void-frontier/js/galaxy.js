// ============================================================
// galaxy.js - Procedural galaxy: star systems, planets, sectors
// ============================================================
VF.Galaxy = {
    sectors: {},
    currentSector: { x: 0, y: 0 },
    sectorSize: 5000,
    systems: [],
    currentSystem: null,
    _seed: 42,

    STAR_TYPES: [
        { type: 'O', color: '#aaccff', tempRange: [30000, 50000], sizeRange: [1.5, 2.5], rarity: 0.03 },
        { type: 'B', color: '#bbddff', tempRange: [10000, 30000], sizeRange: [1.2, 2.0], rarity: 0.08 },
        { type: 'A', color: '#ffffff', tempRange: [7500, 10000], sizeRange: [1.0, 1.5], rarity: 0.12 },
        { type: 'F', color: '#ffffcc', tempRange: [6000, 7500], sizeRange: [0.9, 1.3], rarity: 0.15 },
        { type: 'G', color: '#ffff00', tempRange: [5200, 6000], sizeRange: [0.8, 1.1], rarity: 0.25 },
        { type: 'K', color: '#ffaa44', tempRange: [3700, 5200], sizeRange: [0.6, 0.9], rarity: 0.22 },
        { type: 'M', color: '#ff4422', tempRange: [2400, 3700], sizeRange: [0.3, 0.6], rarity: 0.15 }
    ],

    PLANET_TYPES: [
        { type: 'rocky', color: '#886644', resources: ['iron', 'silicon'], habitability: 0.2 },
        { type: 'gas_giant', color: '#dd8844', resources: ['hydrogen', 'helium'], habitability: 0 },
        { type: 'ice', color: '#88ccff', resources: ['water', 'nitrogen'], habitability: 0.1 },
        { type: 'volcanic', color: '#ff4400', resources: ['titanium', 'crystal'], habitability: 0.05 },
        { type: 'ocean', color: '#2266cc', resources: ['water', 'organic'], habitability: 0.6 },
        { type: 'terran', color: '#44aa44', resources: ['organic', 'water', 'iron'], habitability: 0.9 },
        { type: 'desert', color: '#ccaa44', resources: ['silicon', 'crystal'], habitability: 0.3 },
        { type: 'toxic', color: '#88ff00', resources: ['exotic', 'crystal'], habitability: 0.02 }
    ],

    init(seed) {
        this._seed = seed || 42;
        VF.Noise.init(this._seed);
        this.sectors = {};
        this.systems = [];
        this.generateSector(0, 0);
        console.log('[Galaxy] Initialized with seed:', this._seed);
    },

    generateSector(sx, sy) {
        const key = `${sx},${sy}`;
        if (this.sectors[key]) return this.sectors[key];

        const rng = VF.Utils.seededRNG(this._seed + sx * 73856093 + sy * 19349663);
        const systemCount = Math.floor(rng() * 5) + 3;
        const sector = { x: sx, y: sy, systems: [], stations: [], anomalies: [] };

        for (let i = 0; i < systemCount; i++) {
            const system = this._generateSystem(rng, sx, sy, i);
            sector.systems.push(system);
        }

        // Add space stations (1-2 per sector)
        const stationCount = Math.floor(rng() * 2) + 1;
        for (let i = 0; i < stationCount; i++) {
            sector.stations.push({
                id: VF.Utils.uid(),
                x: (rng() - 0.5) * this.sectorSize,
                y: (rng() - 0.5) * this.sectorSize,
                name: this._generateStationName(rng),
                faction: this._randomFaction(rng),
                services: ['trade', 'repair', 'upgrade'],
                discovered: false
            });
        }

        // Add anomalies (0-2 per sector)
        const anomalyCount = Math.floor(rng() * 3);
        for (let i = 0; i < anomalyCount; i++) {
            sector.anomalies.push({
                id: VF.Utils.uid(),
                x: (rng() - 0.5) * this.sectorSize,
                y: (rng() - 0.5) * this.sectorSize,
                type: ['wormhole', 'nebula_dense', 'derelict', 'signal'][Math.floor(rng() * 4)],
                discovered: false,
                explored: false
            });
        }

        this.sectors[key] = sector;
        return sector;
    },

    _generateSystem(rng, sx, sy, index) {
        // Pick star type by rarity
        const starRoll = rng();
        let cumulative = 0;
        let starTemplate = this.STAR_TYPES[4]; // default G
        for (const st of this.STAR_TYPES) {
            cumulative += st.rarity;
            if (starRoll <= cumulative) { starTemplate = st; break; }
        }

        const worldX = sx * this.sectorSize + (rng() - 0.5) * this.sectorSize * 0.8;
        const worldY = sy * this.sectorSize + (rng() - 0.5) * this.sectorSize * 0.8;

        const system = {
            id: VF.Utils.uid(),
            name: this._generateSystemName(rng),
            x: worldX,
            y: worldY,
            star: {
                type: starTemplate.type,
                color: starTemplate.color,
                size: starTemplate.sizeRange[0] + rng() * (starTemplate.sizeRange[1] - starTemplate.sizeRange[0]),
                temp: starTemplate.tempRange[0] + rng() * (starTemplate.tempRange[1] - starTemplate.tempRange[0])
            },
            planets: [],
            discovered: false,
            dangerLevel: Math.floor(rng() * 5) + 1,
            faction: this._randomFaction(rng)
        };

        // Generate planets
        const planetCount = Math.floor(rng() * 6) + 1;
        for (let p = 0; p < planetCount; p++) {
            const planetType = this.PLANET_TYPES[Math.floor(rng() * this.PLANET_TYPES.length)];
            system.planets.push({
                name: system.name + ' ' + String.fromCharCode(98 + p), // b, c, d...
                type: planetType.type,
                color: planetType.color,
                orbitRadius: 80 + p * 60 + rng() * 30,
                orbitSpeed: (0.3 + rng() * 0.5) / (p + 1),
                orbitAngle: rng() * Math.PI * 2,
                size: 8 + rng() * 20,
                resources: planetType.resources,
                habitability: planetType.habitability,
                moons: Math.floor(rng() * 3),
                hasRings: rng() < 0.15,
                scanned: false
            });
        }

        return system;
    },

    _generateSystemName(rng) {
        const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Sigma', 'Omega', 'Nova', 'Proxima', 'Kepler', 'Gliese', 'Tau', 'Vega'];
        const suffixes = ['Prime', 'Major', 'Minor', 'Centauri', 'Eridani', 'Cygni', 'Draconis', 'Orionis'];
        const name = prefixes[Math.floor(rng() * prefixes.length)];
        if (rng() < 0.4) return name + ' ' + suffixes[Math.floor(rng() * suffixes.length)];
        return name + '-' + Math.floor(rng() * 999 + 1);
    },

    _generateStationName(rng) {
        const prefixes = ['Deep Space', 'Orbital', 'Frontier', 'Haven', 'Nexus', 'Beacon', 'Outpost', 'Citadel'];
        const suffixes = ['Alpha', 'Beta', 'Gamma', 'One', 'Prime', 'Station', 'Hub', 'Port'];
        return prefixes[Math.floor(rng() * prefixes.length)] + ' ' + suffixes[Math.floor(rng() * suffixes.length)];
    },

    _randomFaction(rng) {
        const factions = ['terran', 'voidborn', 'crystalline', 'mechanic', 'neutral', 'pirate'];
        return factions[Math.floor(rng() * factions.length)];
    },

    // Get current sector based on player position
    updateCurrentSector(playerX, playerY) {
        const sx = Math.floor(playerX / this.sectorSize + 0.5);
        const sy = Math.floor(playerY / this.sectorSize + 0.5);

        if (sx !== this.currentSector.x || sy !== this.currentSector.y) {
            this.currentSector = { x: sx, y: sy };
            // Generate surrounding sectors
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    this.generateSector(sx + dx, sy + dy);
                }
            }
            VF.Engine.emit('sectorChange', sx, sy);
        }
    },

    // Get nearby systems within range
    getNearbySystems(x, y, range) {
        const results = [];
        const sx = Math.floor(x / this.sectorSize + 0.5);
        const sy = Math.floor(y / this.sectorSize + 0.5);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const sector = this.sectors[`${sx + dx},${sy + dy}`];
                if (!sector) continue;
                for (const sys of sector.systems) {
                    if (VF.Vec2.dist({ x, y }, sys) < range) {
                        results.push(sys);
                    }
                }
            }
        }
        return results;
    },

    // Render star systems on the game view
    render(ctx) {
        const cam = VF.Camera;
        const nearby = this.getNearbySystems(cam.x, cam.y, 3000);

        cam.begin(ctx);

        for (const sys of nearby) {
            if (!cam.isVisible(sys.x, sys.y, 200)) continue;

            const starSize = sys.star.size * 20;

            // Star glow
            const gradient = ctx.createRadialGradient(sys.x, sys.y, 0, sys.x, sys.y, starSize * 3);
            gradient.addColorStop(0, sys.star.color);
            gradient.addColorStop(0.3, sys.star.color + '44');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(sys.x - starSize * 3, sys.y - starSize * 3, starSize * 6, starSize * 6);

            // Star body
            VF.Renderer.drawCircle(ctx, sys.x, sys.y, starSize, sys.star.color, null);

            // Planets (only when zoomed in enough)
            if (cam.zoom > 0.5) {
                const time = VF.Engine.time.elapsed;
                for (const planet of sys.planets) {
                    const angle = planet.orbitAngle + time * planet.orbitSpeed;
                    const px = sys.x + Math.cos(angle) * planet.orbitRadius;
                    const py = sys.y + Math.sin(angle) * planet.orbitRadius;

                    // Orbit line
                    VF.Renderer.drawOrbit(ctx, sys.x, sys.y, planet.orbitRadius, '#ffffff', 0.08);

                    // Planet
                    VF.Renderer.drawCircle(ctx, px, py, planet.size / 2, planet.color, null);

                    // Rings
                    if (planet.hasRings) {
                        ctx.save();
                        ctx.globalAlpha = 0.4;
                        ctx.strokeStyle = planet.color;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.ellipse(px, py, planet.size, planet.size * 0.3, 0.3, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }

            // System name label
            if (cam.zoom > 0.4) {
                ctx.save();
                ctx.font = '11px Courier New';
                ctx.fillStyle = sys.discovered ? '#0ff' : '#446';
                ctx.textAlign = 'center';
                ctx.fillText(sys.discovered ? sys.name : '???', sys.x, sys.y + starSize * 3 + 15);
                ctx.restore();
            }
        }

        // Render stations
        this._renderStations(ctx, cam);
        // Render anomalies
        this._renderAnomalies(ctx, cam);

        cam.end(ctx);
    },

    _renderStations(ctx, cam) {
        const sx = this.currentSector.x;
        const sy = this.currentSector.y;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const sector = this.sectors[`${sx + dx},${sy + dy}`];
                if (!sector) continue;
                for (const station of sector.stations) {
                    if (!cam.isVisible(station.x, station.y, 100)) continue;

                    // Station shape - hexagonal
                    const time = VF.Engine.time.elapsed;
                    ctx.save();
                    ctx.translate(station.x, station.y);
                    ctx.rotate(time * 0.2);

                    ctx.strokeStyle = '#0ff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const a = (i / 6) * Math.PI * 2;
                        const r = 20;
                        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                    }
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(0,40,60,0.8)';
                    ctx.fill();
                    ctx.stroke();

                    // Inner ring
                    VF.Renderer.drawCircle(ctx, 0, 0, 8, null, '#088', 1);

                    ctx.restore();

                    // Label
                    if (cam.zoom > 0.4) {
                        ctx.save();
                        ctx.font = '10px Courier New';
                        ctx.fillStyle = '#0ff';
                        ctx.textAlign = 'center';
                        ctx.fillText(station.name, station.x, station.y + 30);
                        ctx.restore();
                    }
                }
            }
        }
    },

    _renderAnomalies(ctx, cam) {
        const sx = this.currentSector.x;
        const sy = this.currentSector.y;
        const time = VF.Engine.time.elapsed;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const sector = this.sectors[`${sx + dx},${sy + dy}`];
                if (!sector) continue;
                for (const anomaly of sector.anomalies) {
                    if (!cam.isVisible(anomaly.x, anomaly.y, 100)) continue;

                    ctx.save();
                    ctx.translate(anomaly.x, anomaly.y);

                    // Pulsing effect
                    const pulse = 0.8 + Math.sin(time * 2) * 0.2;
                    const color = anomaly.type === 'wormhole' ? '#f0f' :
                                  anomaly.type === 'derelict' ? '#ff0' : '#0f0';

                    // Question mark / anomaly indicator
                    ctx.globalAlpha = pulse * 0.6;
                    VF.Renderer.drawCircle(ctx, 0, 0, 15, null, color, 1);
                    VF.Renderer.drawDashedCircle(ctx, 0, 0, 25, color, 4, 4);

                    ctx.font = '16px Courier New';
                    ctx.fillStyle = color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('?', 0, 0);

                    ctx.restore();
                }
            }
        }
    },

    // Discover a system when player gets close
    discoverNearby(playerX, playerY, range = 300) {
        const nearby = this.getNearbySystems(playerX, playerY, range);
        for (const sys of nearby) {
            if (!sys.discovered) {
                sys.discovered = true;
                VF.Engine.emit('systemDiscovered', sys);
            }
        }
    },

    // Get statistics about explored galaxy
    getExplorationStats() {
        let totalSystems = 0, discoveredSystems = 0;
        let totalPlanets = 0, scannedPlanets = 0;
        let totalStations = 0, discoveredStations = 0;

        for (const sector of Object.values(this.sectors)) {
            for (const sys of sector.systems) {
                totalSystems++;
                if (sys.discovered) discoveredSystems++;
                for (const planet of sys.planets) {
                    totalPlanets++;
                    if (planet.scanned) scannedPlanets++;
                }
            }
            for (const station of sector.stations) {
                totalStations++;
                if (station.discovered) discoveredStations++;
            }
        }

        return {
            systems: { total: totalSystems, discovered: discoveredSystems },
            planets: { total: totalPlanets, scanned: scannedPlanets },
            stations: { total: totalStations, discovered: discoveredStations },
            sectors: Object.keys(this.sectors).length,
            explorationPct: totalSystems > 0 ? (discoveredSystems / totalSystems * 100).toFixed(1) : 0
        };
    },

    // Find the nearest station
    findNearestStation(x, y) {
        let nearest = null, nearestDist = Infinity;
        for (const sector of Object.values(this.sectors)) {
            for (const station of sector.stations) {
                const dist = VF.Vec2.dist({ x, y }, station);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = station;
                }
            }
        }
        return nearest ? { station: nearest, distance: nearestDist } : null;
    },

    // Scan a planet for detailed info
    scanPlanet(system, planetIndex) {
        if (!system || !system.planets[planetIndex]) return null;
        const planet = system.planets[planetIndex];
        if (planet.scanned) return planet;

        planet.scanned = true;
        planet.detailedInfo = {
            atmosphere: VF.Utils.randPick(['None', 'Thin', 'Standard', 'Dense', 'Toxic']),
            temperature: VF.Utils.randInt(-200, 500) + '°C',
            gravity: (VF.Utils.rand(0.1, 3.0)).toFixed(1) + 'g',
            population: planet.habitability > 0.5 ? VF.Utils.randInt(0, 1000000) : 0,
            anomalies: Math.random() < 0.2 ? VF.Utils.randPick(['Ancient ruins', 'Energy signature', 'Mineral deposit', 'Crashed ship']) : 'None'
        };

        VF.HUD.notify(`Scanned: ${planet.name}`, '#0ff');
        VF.Player.addXP(10);
        return planet;
    },

    // Generate a trade route between two stations
    generateTradeRoute() {
        const stations = [];
        for (const sector of Object.values(this.sectors)) {
            for (const station of sector.stations) {
                if (station.discovered) stations.push(station);
            }
        }
        if (stations.length < 2) return null;

        const start = VF.Utils.randPick(stations);
        let end = VF.Utils.randPick(stations);
        while (end === start) end = VF.Utils.randPick(stations);

        const distance = VF.Vec2.dist(start, end);
        const reward = Math.floor(distance * 0.1 + 100);

        return {
            from: start,
            to: end,
            distance: Math.floor(distance),
            reward,
            cargo: VF.Utils.randPick(['Medical Supplies', 'Rare Minerals', 'Technology', 'Food Stores', 'Weapons']),
            timeLimit: Math.floor(distance / 200 + 30)
        };
    }
};
