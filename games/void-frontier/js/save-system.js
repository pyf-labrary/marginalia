// ============================================================
// save-system.js - Save/load game state to localStorage
// ============================================================
VF.SaveSystem = {
    SAVE_KEY: 'void_frontier_save',
    AUTO_SAVE_INTERVAL: 60, // seconds
    _autoSaveTimer: 0,
    hasSave: false,

    init() {
        this.hasSave = this.checkSave();
        this._autoSaveTimer = this.AUTO_SAVE_INTERVAL;
        console.log('[SaveSystem] Initialized, save exists:', this.hasSave);
    },

    update(dt) {
        this._autoSaveTimer -= dt;
        if (this._autoSaveTimer <= 0) {
            this._autoSaveTimer = this.AUTO_SAVE_INTERVAL;
            this.save();
        }
    },

    checkSave() {
        try {
            return localStorage.getItem(this.SAVE_KEY) !== null;
        } catch (e) {
            return false;
        }
    },

    save() {
        try {
            const data = {
                version: 1,
                timestamp: Date.now(),
                playTime: VF.Engine.time.elapsed,
                player: VF.Player.getSaveData(),
                resources: VF.Resources.getSaveData(),
                upgrades: VF.Upgrades.getSaveData(),
                missions: VF.Missions.getSaveData(),
                galaxy: {
                    seed: VF.Galaxy._seed,
                    currentSector: { ...VF.Galaxy.currentSector },
                    discoveredSystems: this._getDiscoveredSystems()
                },
                enemies: {
                    difficulty: VF.Enemies.difficulty,
                    waveNumber: VF.Enemies.waveNumber
                },
                bosses: {
                    bossesDefeated: VF.Bosses.bossesDefeated,
                    bossTimer: VF.Bosses.bossTimer
                },
                diplomacy: VF.Diplomacy ? VF.Diplomacy.getSaveData() : {},
                stats: {
                    totalKills: VF.Player.kills,
                    totalDamage: VF.Player.damageDealt,
                    systemsDiscovered: this._countDiscovered()
                }
            };

            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            this.hasSave = true;
            VF.HUD.notify('Game saved', '#088');
            return true;
        } catch (e) {
            console.error('[SaveSystem] Save failed:', e);
            VF.HUD.notify('Save failed!', '#f44');
            return false;
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data || data.version !== 1) return false;

            // Restore player
            VF.Player.loadSaveData(data.player);

            // Restore resources
            VF.Resources.loadSaveData(data.resources);

            // Restore upgrades
            VF.Upgrades.loadSaveData(data.upgrades);

            // Restore galaxy
            if (data.galaxy) {
                VF.Galaxy.init(data.galaxy.seed);
                VF.Galaxy.currentSector = data.galaxy.currentSector;
                // Restore discovered systems
                if (data.galaxy.discoveredSystems) {
                    for (const sysId of data.galaxy.discoveredSystems) {
                        this._markSystemDiscovered(sysId);
                    }
                }
            }

            // Restore enemy state
            if (data.enemies) {
                VF.Enemies.difficulty = data.enemies.difficulty;
                VF.Enemies.waveNumber = data.enemies.waveNumber;
            }

            // Restore boss state
            if (data.bosses) {
                VF.Bosses.bossesDefeated = data.bosses.bossesDefeated;
                VF.Bosses.bossTimer = data.bosses.bossTimer;
            }

            // Restore diplomacy
            if (data.diplomacy && VF.Diplomacy) {
                VF.Diplomacy.loadSaveData(data.diplomacy);
            }

            // Restore play time
            VF.Engine.time.elapsed = data.playTime || 0;

            // Move camera to player
            VF.Camera.setPosition(VF.Player.x, VF.Player.y);

            VF.HUD.notify('Game loaded', '#0ff');
            console.log('[SaveSystem] Game loaded successfully');
            return true;
        } catch (e) {
            console.error('[SaveSystem] Load failed:', e);
            VF.HUD.notify('Load failed!', '#f44');
            return false;
        }
    },

    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            this.hasSave = false;
            console.log('[SaveSystem] Save deleted');
        } catch (e) {
            console.error('[SaveSystem] Delete failed:', e);
        }
    },

    _getDiscoveredSystems() {
        const discovered = [];
        for (const sector of Object.values(VF.Galaxy.sectors)) {
            for (const sys of sector.systems) {
                if (sys.discovered) discovered.push(sys.id);
            }
        }
        return discovered;
    },

    _countDiscovered() {
        let count = 0;
        for (const sector of Object.values(VF.Galaxy.sectors)) {
            for (const sys of sector.systems) {
                if (sys.discovered) count++;
            }
        }
        return count;
    },

    _markSystemDiscovered(sysId) {
        for (const sector of Object.values(VF.Galaxy.sectors)) {
            for (const sys of sector.systems) {
                if (sys.id === sysId) sys.discovered = true;
            }
        }
    },

    getSaveInfo() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return {
                playTime: VF.Utils.formatTime(data.playTime || 0),
                level: data.player.level,
                credits: data.player.credits,
                kills: data.stats.totalKills,
                date: new Date(data.timestamp).toLocaleDateString()
            };
        } catch (e) {
            return null;
        }
    },

    // Export save as downloadable file
    exportSave() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) { VF.HUD.notify('No save to export!', '#f44'); return; }

            const blob = new Blob([raw], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `void_frontier_save_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            VF.HUD.notify('Save exported!', '#0f0');
        } catch (e) {
            VF.HUD.notify('Export failed!', '#f44');
        }
    },

    // Import save from file
    importSave(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data || data.version !== 1) {
                VF.HUD.notify('Invalid save file!', '#f44');
                return false;
            }
            localStorage.setItem(this.SAVE_KEY, jsonString);
            this.hasSave = true;
            VF.HUD.notify('Save imported! Restart to load.', '#0f0');
            return true;
        } catch (e) {
            VF.HUD.notify('Import failed!', '#f44');
            return false;
        }
    },

    // Multiple save slots
    SLOT_KEYS: ['void_frontier_save_1', 'void_frontier_save_2', 'void_frontier_save_3'],

    saveToSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_KEYS.length) return false;
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (raw) {
                localStorage.setItem(this.SLOT_KEYS[slotIndex], raw);
                VF.HUD.notify(`Saved to slot ${slotIndex + 1}`, '#0f0');
                return true;
            }
        } catch (e) {}
        return false;
    },

    loadFromSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_KEYS.length) return false;
        try {
            const raw = localStorage.getItem(this.SLOT_KEYS[slotIndex]);
            if (raw) {
                localStorage.setItem(this.SAVE_KEY, raw);
                VF.HUD.notify(`Loaded from slot ${slotIndex + 1}`, '#0ff');
                return true;
            }
        } catch (e) {}
        VF.HUD.notify('No save in that slot!', '#f44');
        return false;
    },

    getSlotInfo(slotIndex) {
        try {
            const raw = localStorage.getItem(this.SLOT_KEYS[slotIndex]);
            if (!raw) return null;
            const data = JSON.parse(raw);
            return {
                playTime: VF.Utils.formatTime(data.playTime || 0),
                level: data.player.level,
                date: new Date(data.timestamp).toLocaleDateString()
            };
        } catch (e) { return null; }
    },

    // Auto-backup system
    _backupKey: 'void_frontier_backup',
    _backupInterval: 300, // 5 minutes
    _backupTimer: 300,

    updateBackup(dt) {
        this._backupTimer -= dt;
        if (this._backupTimer <= 0) {
            this._backupTimer = this._backupInterval;
            try {
                const raw = localStorage.getItem(this.SAVE_KEY);
                if (raw) localStorage.setItem(this._backupKey, raw);
            } catch (e) {}
        }
    },

    restoreBackup() {
        try {
            const raw = localStorage.getItem(this._backupKey);
            if (raw) {
                localStorage.setItem(this.SAVE_KEY, raw);
                VF.HUD.notify('Backup restored!', '#0f0');
                return true;
            }
        } catch (e) {}
        VF.HUD.notify('No backup available!', '#f44');
        return false;
    }
};
