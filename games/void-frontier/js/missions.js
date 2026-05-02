// ============================================================
// missions.js - Mission and quest system
// ============================================================
VF.Missions = {
    active: [],
    completed: [],
    available: [],
    maxActive: 3,
    _missionIdCounter: 0,

    TEMPLATES: {
        kill_enemies: {
            name: 'Eliminate Hostiles',
            desc: 'Destroy {count} {enemyType} ships in this sector.',
            type: 'kill',
            generate(difficulty) {
                const types = ['scout', 'fighter', 'bomber', 'interceptor'];
                const enemyType = types[Math.min(Math.floor(difficulty / 2), types.length - 1)];
                const count = Math.floor(5 + difficulty * 2);
                return {
                    enemyType,
                    target: count,
                    progress: 0,
                    reward: { credits: count * 15 + difficulty * 20, xp: count * 5 }
                };
            },
            check(mission, event, data) {
                if (event === 'enemyKilled' && data.enemyType === mission.data.enemyType) {
                    mission.data.progress++;
                    return mission.data.progress >= mission.data.target;
                }
                return false;
            },
            getProgress(mission) {
                return `${mission.data.progress}/${mission.data.target}`;
            }
        },
        kill_any: {
            name: 'Clear the Sector',
            desc: 'Destroy {count} enemy ships of any type.',
            type: 'kill',
            generate(difficulty) {
                const count = Math.floor(8 + difficulty * 3);
                return {
                    target: count,
                    progress: 0,
                    reward: { credits: count * 10 + difficulty * 15, xp: count * 4 }
                };
            },
            check(mission, event) {
                if (event === 'enemyKilled') {
                    mission.data.progress++;
                    return mission.data.progress >= mission.data.target;
                }
                return false;
            },
            getProgress(mission) {
                return `${mission.data.progress}/${mission.data.target}`;
            }
        },
        explore_systems: {
            name: 'Stellar Cartography',
            desc: 'Discover {count} new star systems.',
            type: 'explore',
            generate(difficulty) {
                const count = Math.floor(2 + difficulty);
                return {
                    target: count,
                    progress: 0,
                    reward: { credits: count * 40, xp: count * 15 }
                };
            },
            check(mission, event) {
                if (event === 'systemDiscovered') {
                    mission.data.progress++;
                    return mission.data.progress >= mission.data.target;
                }
                return false;
            },
            getProgress(mission) {
                return `${mission.data.progress}/${mission.data.target}`;
            }
        },
        collect_resources: {
            name: 'Resource Acquisition',
            desc: 'Collect {count} units of {resourceType}.',
            type: 'collect',
            generate(difficulty) {
                const resources = ['iron', 'silicon', 'titanium', 'crystal'];
                const resourceType = resources[Math.min(Math.floor(difficulty / 2), resources.length - 1)];
                const count = Math.floor(10 + difficulty * 5);
                return {
                    resourceType,
                    target: count,
                    progress: 0,
                    reward: { credits: count * VF.Resources.TYPES[resourceType].value * 2, xp: count * 3 }
                };
            },
            check(mission, event, data) {
                if (event === 'resourceGained' && data === mission.data.resourceType) {
                    mission.data.progress += arguments[3] || 1;
                    return mission.data.progress >= mission.data.target;
                }
                return false;
            },
            getProgress(mission) {
                return `${mission.data.progress}/${mission.data.target}`;
            }
        },
        survive_time: {
            name: 'Endurance Run',
            desc: 'Survive for {time} seconds without dying.',
            type: 'survive',
            generate(difficulty) {
                const time = Math.floor(60 + difficulty * 30);
                return {
                    target: time,
                    progress: 0,
                    startTime: 0,
                    reward: { credits: time * 3, xp: time * 2 }
                };
            },
            check(mission) {
                mission.data.progress = VF.Engine.time.elapsed - mission.data.startTime;
                return mission.data.progress >= mission.data.target;
            },
            getProgress(mission) {
                return `${VF.Utils.formatTime(mission.data.progress)}/${VF.Utils.formatTime(mission.data.target)}`;
            }
        },
        reach_location: {
            name: 'Navigation Challenge',
            desc: 'Travel to coordinates ({x}, {y}).',
            type: 'travel',
            generate(difficulty) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 1000 + difficulty * 500;
                return {
                    targetX: VF.Player.x + Math.cos(angle) * dist,
                    targetY: VF.Player.y + Math.sin(angle) * dist,
                    radius: 200,
                    reward: { credits: Math.floor(dist * 0.1), xp: Math.floor(dist * 0.05) }
                };
            },
            check(mission) {
                const dx = VF.Player.x - mission.data.targetX;
                const dy = VF.Player.y - mission.data.targetY;
                return Math.sqrt(dx * dx + dy * dy) < mission.data.radius;
            },
            getProgress(mission) {
                const dist = Math.floor(VF.Vec2.dist(VF.Player, { x: mission.data.targetX, y: mission.data.targetY }));
                return `${dist}m away`;
            }
        },
        boss_hunt: {
            name: 'Boss Hunt',
            desc: 'Defeat the sector boss.',
            type: 'boss',
            generate(difficulty) {
                return {
                    bossSpawned: false,
                    bossDefeated: false,
                    reward: { credits: 200 + difficulty * 100, xp: 100 + difficulty * 50 }
                };
            },
            check(mission, event) {
                if (event === 'bossDefeated') {
                    mission.data.bossDefeated = true;
                    return true;
                }
                return false;
            },
            getProgress(mission) {
                return mission.data.bossDefeated ? 'Complete' : mission.data.bossSpawned ? 'In Progress' : 'Find Boss';
            }
        }
    },

    init() {
        this.active = [];
        this.completed = [];
        this.available = [];
        this._missionIdCounter = 0;

        // Listen for game events
        VF.Engine.on('enemyKilled', enemy => this._onEvent('enemyKilled', enemy));
        VF.Engine.on('systemDiscovered', sys => this._onEvent('systemDiscovered', sys));
        VF.Engine.on('resourceGained', (type, amount) => this._onEvent('resourceGained', type, amount));
        VF.Engine.on('bossDefeated', () => this._onEvent('bossDefeated'));

        this._generateAvailable();
        console.log('[Missions] Initialized');
    },

    _generateAvailable() {
        this.available = [];
        const templateKeys = Object.keys(this.TEMPLATES);
        const count = VF.Utils.randInt(3, 5);
        const difficulty = VF.Enemies.difficulty;

        for (let i = 0; i < count; i++) {
            const key = VF.Utils.randPick(templateKeys);
            const template = this.TEMPLATES[key];
            const data = template.generate(difficulty);

            this.available.push({
                id: ++this._missionIdCounter,
                templateKey: key,
                name: template.name,
                desc: template.desc
                    .replace('{count}', data.target || '')
                    .replace('{enemyType}', data.enemyType || '')
                    .replace('{resourceType}', data.resourceType || '')
                    .replace('{time}', data.target || '')
                    .replace('{x}', Math.floor(data.targetX || 0))
                    .replace('{y}', Math.floor(data.targetY || 0)),
                type: template.type,
                data,
                reward: data.reward
            });
        }
    },

    accept(missionId) {
        if (this.active.length >= this.maxActive) return false;
        const idx = this.available.findIndex(m => m.id === missionId);
        if (idx === -1) return false;

        const mission = this.available.splice(idx, 1)[0];
        if (mission.data.startTime !== undefined) {
            mission.data.startTime = VF.Engine.time.elapsed;
        }
        this.active.push(mission);
        VF.HUD.notify(`Mission accepted: ${mission.name}`, '#0ff');
        return true;
    },

    abandon(missionId) {
        const idx = this.active.findIndex(m => m.id === missionId);
        if (idx === -1) return;
        this.active.splice(idx, 1);
        VF.HUD.notify('Mission abandoned', '#f80');
    },

    _onEvent(event, ...args) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const mission = this.active[i];
            const template = this.TEMPLATES[mission.templateKey];
            if (template.check(mission, event, ...args)) {
                this._completeMission(i);
            }
        }
    },

    _completeMission(index) {
        const mission = this.active.splice(index, 1)[0];
        this.completed.push(mission);

        // Grant rewards
        if (mission.reward.credits) VF.Player.credits += mission.reward.credits;
        if (mission.reward.xp) VF.Player.addXP(mission.reward.xp);

        VF.HUD.notify(`Mission Complete: ${mission.name}! +${mission.reward.credits}⬡`, '#0f0');
        if (VF.Audio) VF.Audio.play('upgrade');
        if (VF.Particles) VF.Particles.emit('levelUp', VF.Player.x, VF.Player.y, 20);

        // Generate new available missions
        if (this.available.length < 3) this._generateAvailable();
    },

    update(dt) {
        // Check time-based missions
        for (let i = this.active.length - 1; i >= 0; i--) {
            const mission = this.active[i];
            const template = this.TEMPLATES[mission.templateKey];
            if (mission.type === 'survive' || mission.type === 'travel') {
                if (template.check(mission)) {
                    this._completeMission(i);
                }
            }
        }
    },

    render(ctx) {
        if (VF.Engine.state !== 'playing') return;
        if (this.active.length === 0) return;

        // Render active missions in top-right area
        const x = VF.Engine.width - 250;
        let y = 100;

        ctx.font = '10px Courier New';
        ctx.fillStyle = '#088';
        ctx.textAlign = 'left';
        ctx.fillText('ACTIVE MISSIONS', x, y);
        y += 16;

        for (const mission of this.active) {
            const template = this.TEMPLATES[mission.templateKey];
            const progress = template.getProgress(mission);

            ctx.fillStyle = '#0aa';
            ctx.font = '11px Courier New';
            ctx.fillText(`▸ ${mission.name}`, x, y);
            y += 14;

            ctx.fillStyle = '#666';
            ctx.font = '9px Courier New';
            ctx.fillText(`  ${progress}`, x, y);
            y += 16;
        }

        // Render waypoint for travel missions
        for (const mission of this.active) {
            if (mission.type === 'travel' && mission.data.targetX) {
                this._renderWaypoint(ctx, mission.data.targetX, mission.data.targetY);
            }
        }
    },

    _renderWaypoint(ctx, wx, wy) {
        const screen = VF.Camera.worldToScreen(wx, wy);
        const w = VF.Engine.width, h = VF.Engine.height;
        const margin = 30;

        // If off-screen, show arrow at edge
        if (screen.x < margin || screen.x > w - margin || screen.y < margin || screen.y > h - margin) {
            const cx = w / 2, cy = h / 2;
            const angle = Math.atan2(screen.y - cy, screen.x - cx);
            const edgeX = VF.Utils.clamp(screen.x, margin, w - margin);
            const edgeY = VF.Utils.clamp(screen.y, margin, h - margin);

            ctx.save();
            ctx.translate(edgeX, edgeY);
            ctx.rotate(angle);
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, -6);
            ctx.lineTo(-5, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            const dist = Math.floor(VF.Vec2.dist(VF.Player, { x: wx, y: wy }));
            ctx.font = '9px Courier New';
            ctx.fillStyle = '#ff0';
            ctx.textAlign = 'center';
            ctx.fillText(`${dist}m`, edgeX, edgeY + 15);
        } else {
            // On-screen marker
            const time = VF.Engine.time.elapsed;
            const pulse = 0.7 + Math.sin(time * 3) * 0.3;
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 2;
            VF.Renderer.drawDashedCircle(ctx, screen.x, screen.y, 20, '#ff0', 5, 5);
            ctx.fillStyle = '#ff0';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('◎', screen.x, screen.y + 4);
            ctx.restore();
        }
    },

    getSaveData() {
        return {
            active: VF.Utils.deepClone(this.active),
            completed: this.completed.length,
            available: VF.Utils.deepClone(this.available)
        };
    }
};
