// ============================================================
// dialog.js - Dialog and story system with branching choices
// ============================================================
VF.Dialog = {
    active: false,
    currentDialog: null,
    currentNode: null,
    _typewriterText: '',
    _typewriterIndex: 0,
    _typewriterSpeed: 30, // chars per second
    _typewriterTimer: 0,
    history: [],

    DIALOGS: {
        intro: {
            speaker: 'COMMAND',
            portrait: '#0ff',
            nodes: {
                start: {
                    text: 'Welcome to the Void Frontier, pilot. You are the last hope of the Terran Expeditionary Fleet. Our colony ships have been scattered across uncharted space. Your mission: explore, survive, and find our people.',
                    choices: [
                        { text: 'I understand. What are my orders?', next: 'orders' },
                        { text: 'What happened to the fleet?', next: 'fleet_info' }
                    ]
                },
                orders: {
                    text: 'Explore nearby star systems, gather resources, and upgrade your ship. Be wary of hostile alien factions. Dock at space stations for supplies and missions. Good luck, pilot.',
                    choices: [
                        { text: 'Roger that. Launching now.', next: null, action: 'start_game' }
                    ]
                },
                fleet_info: {
                    text: 'A void storm scattered our fleet across multiple sectors. We lost contact with most ships. Some may have been captured by the Voidborn or the Crystalline Collective. We need you to find them.',
                    choices: [
                        { text: 'I\'ll find them. What should I do first?', next: 'orders' },
                        { text: 'Sounds dangerous. Let\'s go.', next: null, action: 'start_game' }
                    ]
                }
            }
        },
        station_greeting: {
            speaker: 'STATION AI',
            portrait: '#0ff',
            nodes: {
                start: {
                    text: 'Welcome, pilot. This station offers repair services, trade goods, and mission contracts. How can we assist you?',
                    choices: [
                        { text: 'Show me what you have.', next: null, action: 'open_trade' },
                        { text: 'Any news from the frontier?', next: 'news' },
                        { text: 'Never mind.', next: null, action: 'close' }
                    ]
                },
                news: {
                    text: 'Sensors detect increased Voidborn activity in adjacent sectors. The Crystalline Collective has been expanding their territory. Pirate raids are on the rise. Stay vigilant.',
                    choices: [
                        { text: 'Thanks for the intel.', next: null, action: 'close' }
                    ]
                }
            }
        },
        alien_contact: {
            speaker: 'UNKNOWN SIGNAL',
            portrait: '#f0f',
            nodes: {
                start: {
                    text: '...signal detected... We are the Voidborn. Your kind trespasses in our domain. Leave now, or face annihilation.',
                    choices: [
                        { text: 'We come in peace.', next: 'peace', action: 'diplomacy_positive' },
                        { text: 'This space belongs to no one.', next: 'hostile', action: 'diplomacy_negative' },
                        { text: '[Attack]', next: null, action: 'start_combat' }
                    ]
                },
                peace: {
                    text: '...peace... An unusual concept from your kind. Perhaps we can coexist. Prove your worth by eliminating the pirate threat in this sector.',
                    choices: [
                        { text: 'Consider it done.', next: null, action: 'accept_alien_mission' },
                        { text: 'I\'ll think about it.', next: null, action: 'close' }
                    ]
                },
                hostile: {
                    text: 'Foolish creature. You will learn the price of defiance. Our fleet approaches.',
                    choices: [
                        { text: 'Bring it on.', next: null, action: 'start_combat' }
                    ]
                }
            }
        },
        derelict_ship: {
            speaker: 'SHIP LOG',
            portrait: '#ff0',
            nodes: {
                start: {
                    text: '[CORRUPTED LOG] ...day 47... systems failing... the void storm... something in the darkness... it watches us... coordinates encoded in nav computer...',
                    choices: [
                        { text: 'Download nav data.', next: 'download', action: 'gain_nav_data' },
                        { text: 'Search for survivors.', next: 'search' },
                        { text: 'Leave the wreck.', next: null, action: 'close' }
                    ]
                },
                download: {
                    text: 'Nav data downloaded. New system coordinates added to your star map. The data mentions a "Void Gate" - an ancient structure of unknown origin.',
                    choices: [
                        { text: 'Interesting. I\'ll investigate.', next: null, action: 'close' }
                    ]
                },
                search: {
                    text: 'No survivors found. The crew quarters are empty, but you find a cache of resources and a strange crystal pulsing with energy.',
                    choices: [
                        { text: 'Take the crystal.', next: null, action: 'gain_crystal' },
                        { text: 'Leave it. Something feels wrong.', next: null, action: 'close' }
                    ]
                }
            }
        },
        level_up: {
            speaker: 'SHIP AI',
            portrait: '#0f0',
            nodes: {
                start: {
                    text: 'Pilot, your combat experience has increased. Ship systems have been optimized. New capabilities are available for upgrade.',
                    choices: [
                        { text: 'Open upgrades.', next: null, action: 'open_upgrades' },
                        { text: 'Later.', next: null, action: 'close' }
                    ]
                }
            }
        },
        void_gate: {
            speaker: 'ANCIENT TERMINAL',
            portrait: '#a0f',
            nodes: {
                start: {
                    text: 'You approach the Void Gate - a massive ring structure of unknown origin. Energy readings are off the charts. Ancient symbols pulse with light along its surface.',
                    choices: [
                        { text: 'Attempt to activate the gate.', next: 'activate' },
                        { text: 'Scan the structure.', next: 'scan' },
                        { text: 'Leave it alone.', next: null, action: 'close' }
                    ]
                },
                activate: {
                    text: 'The gate hums to life! A portal opens, revealing a swirling vortex of purple energy. Through it, you glimpse an alien star system unlike anything in your charts.',
                    choices: [
                        { text: 'Enter the portal.', next: 'enter_portal' },
                        { text: 'Not yet. Back away.', next: null, action: 'close' }
                    ]
                },
                scan: {
                    text: 'Scans reveal the gate is over 2 million years old. It uses a form of energy manipulation beyond current understanding. Your ship AI detects encoded coordinates within the structure.',
                    choices: [
                        { text: 'Download the coordinates.', next: null, action: 'gain_nav_data' },
                        { text: 'Try to activate it.', next: 'activate' }
                    ]
                },
                enter_portal: {
                    text: 'You plunge through the portal! Space warps around you. When your vision clears, you find yourself in an uncharted sector filled with ancient structures and rare resources.',
                    choices: [
                        { text: 'Begin exploring.', next: null, action: 'warp_random' }
                    ]
                }
            }
        },
        distress_signal: {
            speaker: 'DISTRESS BEACON',
            portrait: '#f80',
            nodes: {
                start: {
                    text: 'MAYDAY MAYDAY! This is the cargo vessel Meridian Star. We are under attack by pirates! Shields failing! Anyone receiving this, please assist!',
                    choices: [
                        { text: 'I\'m on my way! Hold on!', next: 'respond', action: 'spawn_rescue_mission' },
                        { text: 'Sorry, can\'t help right now.', next: 'ignore' },
                        { text: 'What\'s your cargo?', next: 'cargo_info' }
                    ]
                },
                respond: {
                    text: 'Thank the stars! We\'re transmitting our coordinates now. Hurry, pilot - we can\'t hold out much longer! There are at least five pirate ships!',
                    choices: [
                        { text: 'Engaging hostiles!', next: null, action: 'start_combat' }
                    ]
                },
                ignore: {
                    text: '...please... anyone... *static* ...the signal fades to silence.',
                    choices: [
                        { text: '...', next: null, action: 'close' }
                    ]
                },
                cargo_info: {
                    text: 'We\'re carrying medical supplies and rare crystals for the frontier colonies! Please, this isn\'t about cargo - there are 47 souls aboard!',
                    choices: [
                        { text: 'I\'ll save you. Sending coordinates.', next: 'respond', action: 'spawn_rescue_mission' },
                        { text: 'Crystals, you say? I\'ll help... for a fee.', next: 'negotiate' }
                    ]
                },
                negotiate: {
                    text: 'Fine! 200 credits and 5 crystals if you save us! Just hurry!',
                    choices: [
                        { text: 'Deal. On my way.', next: null, action: 'start_combat' }
                    ]
                }
            }
        },
        mechanic_trade: {
            speaker: 'MECHANIC SYNDICATE',
            portrait: '#ff0',
            nodes: {
                start: {
                    text: 'GREETING PROTOCOL INITIATED. We are Unit-7734 of the Mechanic Syndicate. We offer technological exchange. Your organic inefficiencies can be... optimized.',
                    choices: [
                        { text: 'What do you have to offer?', next: 'offer' },
                        { text: 'I don\'t trust machines.', next: 'distrust' },
                        { text: 'Goodbye.', next: null, action: 'close' }
                    ]
                },
                offer: {
                    text: 'We can enhance your ship systems with nano-repair drones (+30 HP), overclock your weapons (+15% damage), or install an energy capacitor (+25 energy). Each costs 150 credits.',
                    choices: [
                        { text: 'Nano-repair drones, please.', next: null, action: 'mechanic_heal' },
                        { text: 'Overclock weapons.', next: null, action: 'mechanic_damage' },
                        { text: 'Energy capacitor.', next: null, action: 'mechanic_energy' },
                        { text: 'No thanks.', next: null, action: 'close' }
                    ]
                },
                distrust: {
                    text: 'ANALYSIS: Organic prejudice detected. Probability of future cooperation: 34.7%. We will be here if you change your mind. Logic always prevails.',
                    choices: [
                        { text: 'Maybe next time.', next: null, action: 'close' }
                    ]
                }
            }
        },
        crystalline_encounter: {
            speaker: 'CRYSTALLINE ENTITY',
            portrait: '#f8f',
            nodes: {
                start: {
                    text: '*A cascade of prismatic light washes over your ship* We sense... curiosity. You are not like the others who come with weapons drawn. What do you seek in the void?',
                    choices: [
                        { text: 'Knowledge. I want to understand the galaxy.', next: 'knowledge' },
                        { text: 'Resources. I need to survive.', next: 'resources' },
                        { text: 'Peace. I want to end the conflicts.', next: 'peace' }
                    ]
                },
                knowledge: {
                    text: '*The light intensifies* Knowledge... yes. We have existed for millennia. We will share what we know. The Void Gates were built by the Ancients to connect distant stars. Seek them out.',
                    choices: [
                        { text: 'Thank you. Where can I find a Void Gate?', next: null, action: 'gain_nav_data' }
                    ]
                },
                resources: {
                    text: '*The light dims slightly* Survival... a primal drive. We understand. Take these crystals as a gift. May they serve you well.',
                    choices: [
                        { text: 'Thank you for your generosity.', next: null, action: 'gain_crystal' }
                    ]
                },
                peace: {
                    text: '*The light pulses warmly* Peace... a noble pursuit. The factions war because they fear each other. Show them there is another way. We will support your efforts.',
                    choices: [
                        { text: 'I will try.', next: null, action: 'diplomacy_positive' }
                    ]
                }
            }
        }
    },

    init() {
        this.active = false;
        this.currentDialog = null;
        this.history = [];
        console.log('[Dialog] Initialized');
    },

    start(dialogKey, nodeKey = 'start') {
        const dialog = this.DIALOGS[dialogKey];
        if (!dialog) return;

        this.active = true;
        this.currentDialog = dialog;
        this.currentNode = dialog.nodes[nodeKey];
        this._typewriterText = '';
        this._typewriterIndex = 0;
        this._typewriterTimer = 0;
        this.history.push(dialogKey);
    },

    selectChoice(index) {
        if (!this.active || !this.currentNode) return;
        const choice = this.currentNode.choices[index];
        if (!choice) return;

        // Execute action
        if (choice.action) this._executeAction(choice.action);

        // Navigate to next node
        if (choice.next && this.currentDialog.nodes[choice.next]) {
            this.currentNode = this.currentDialog.nodes[choice.next];
            this._typewriterText = '';
            this._typewriterIndex = 0;
            this._typewriterTimer = 0;
        } else {
            this.close();
        }
    },

    close() {
        this.active = false;
        this.currentDialog = null;
        this.currentNode = null;
    },

    _executeAction(action) {
        switch (action) {
            case 'start_game': VF.Engine.emit('dialogAction', 'start_game'); break;
            case 'open_trade': VF.Engine.emit('dialogAction', 'open_trade'); break;
            case 'open_upgrades': VF.UIMenus.toggle('upgrade'); break;
            case 'close': break;
            case 'diplomacy_positive':
                if (VF.Diplomacy) VF.Diplomacy.modifyRelation('voidborn', 10);
                break;
            case 'diplomacy_negative':
                if (VF.Diplomacy) VF.Diplomacy.modifyRelation('voidborn', -15);
                break;
            case 'start_combat':
                for (let i = 0; i < 5; i++) {
                    const a = Math.random() * Math.PI * 2;
                    VF.Enemies.createEnemy('fighter',
                        VF.Player.x + Math.cos(a) * 400,
                        VF.Player.y + Math.sin(a) * 400);
                }
                break;
            case 'accept_alien_mission':
                // Create a kill mission
                if (VF.Missions.active.length < VF.Missions.maxActive) {
                    VF.Missions.available.push({
                        id: ++VF.Missions._missionIdCounter,
                        templateKey: 'kill_any',
                        name: 'Voidborn Request',
                        desc: 'Eliminate 10 pirates to prove your worth.',
                        type: 'kill',
                        data: { target: 10, progress: 0, reward: { credits: 300, xp: 100 } },
                        reward: { credits: 300, xp: 100 }
                    });
                    VF.HUD.notify('New mission available!', '#f0f');
                }
                break;
            case 'gain_nav_data':
                const nearby = VF.Galaxy.getNearbySystems(VF.Player.x, VF.Player.y, 5000);
                for (const sys of nearby) sys.discovered = true;
                VF.HUD.notify('Star map updated!', '#ff0');
                break;
            case 'gain_crystal':
                VF.Resources.add('crystal', 5);
                VF.Resources.add('exotic', 2);
                break;
            case 'warp_random':
                const angle2 = Math.random() * Math.PI * 2;
                const dist2 = VF.Utils.rand(2000, 4000);
                VF.Warp.startCharge(
                    VF.Player.x + Math.cos(angle2) * dist2,
                    VF.Player.y + Math.sin(angle2) * dist2
                );
                break;
            case 'spawn_rescue_mission':
                if (VF.Missions.active.length < VF.Missions.maxActive) {
                    VF.Missions.available.push({
                        id: ++VF.Missions._missionIdCounter,
                        templateKey: 'kill_any',
                        name: 'Rescue Meridian Star',
                        desc: 'Destroy 5 pirate ships to save the cargo vessel.',
                        type: 'kill',
                        data: { target: 5, progress: 0, reward: { credits: 200, xp: 80 } },
                        reward: { credits: 200, xp: 80 }
                    });
                    VF.Missions.accept(VF.Missions._missionIdCounter);
                }
                break;
            case 'mechanic_heal':
                if (VF.Player.credits >= 150) {
                    VF.Player.credits -= 150;
                    VF.Player.maxHp += 30;
                    VF.Player.hp = VF.Player.maxHp;
                    VF.HUD.notify('Nano-repair drones installed! +30 Max HP', '#0f0');
                    VF.Diplomacy.modifyRelation('mechanic', 5);
                } else { VF.HUD.notify('Insufficient credits!', '#f44'); }
                break;
            case 'mechanic_damage':
                if (VF.Player.credits >= 150) {
                    VF.Player.credits -= 150;
                    VF.Weapons.TYPES.laser.damage *= 1.15;
                    VF.HUD.notify('Weapons overclocked! +15% damage', '#f80');
                    VF.Diplomacy.modifyRelation('mechanic', 5);
                } else { VF.HUD.notify('Insufficient credits!', '#f44'); }
                break;
            case 'mechanic_energy':
                if (VF.Player.credits >= 150) {
                    VF.Player.credits -= 150;
                    VF.Player.maxEnergy += 25;
                    VF.Player.energy = VF.Player.maxEnergy;
                    VF.HUD.notify('Energy capacitor installed! +25 Max Energy', '#ff0');
                    VF.Diplomacy.modifyRelation('mechanic', 5);
                } else { VF.HUD.notify('Insufficient credits!', '#f44'); }
                break;
        }
    },

    update(dt) {
        if (!this.active || !this.currentNode) return;

        // Typewriter effect
        if (this._typewriterIndex < this.currentNode.text.length) {
            this._typewriterTimer += dt;
            const charsToAdd = Math.floor(this._typewriterTimer * this._typewriterSpeed);
            if (charsToAdd > 0) {
                this._typewriterIndex = Math.min(
                    this._typewriterIndex + charsToAdd,
                    this.currentNode.text.length
                );
                this._typewriterText = this.currentNode.text.substring(0, this._typewriterIndex);
                this._typewriterTimer = 0;
            }
        }

        // Skip typewriter with space
        if (VF.Input.justPressed('Space')) {
            if (this._typewriterIndex < this.currentNode.text.length) {
                this._typewriterIndex = this.currentNode.text.length;
                this._typewriterText = this.currentNode.text;
            }
        }

        // Number keys for choices
        for (let i = 0; i < 4; i++) {
            if (VF.Input.justPressed(`Digit${i + 1}`)) {
                this.selectChoice(i);
            }
        }
    },

    render(ctx) {
        if (!this.active || !this.currentNode) return;

        const w = VF.Engine.width;
        const h = VF.Engine.height;
        const panelW = Math.min(600, w - 40);
        const panelH = 220;
        const px = (w - panelW) / 2;
        const py = h - panelH - 30;

        // Dim background slightly
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, w, h);

        // Dialog panel
        VF.Renderer.drawPanel(ctx, px, py, panelW, panelH, 'rgba(0,15,30,0.92)', this.currentDialog.portrait);

        // Speaker name
        ctx.font = 'bold 13px Courier New';
        ctx.fillStyle = this.currentDialog.portrait;
        ctx.textAlign = 'left';
        ctx.fillText(this.currentDialog.speaker, px + 20, py + 20);

        // Portrait indicator
        ctx.fillStyle = this.currentDialog.portrait;
        ctx.beginPath();
        ctx.arc(px + panelW - 30, py + 25, 8, 0, Math.PI * 2);
        ctx.fill();

        // Dialog text with word wrap
        ctx.font = '12px Courier New';
        ctx.fillStyle = '#ccc';
        const maxWidth = panelW - 40;
        const lines = this._wrapText(ctx, this._typewriterText, maxWidth);
        let ty = py + 45;
        for (const line of lines) {
            ctx.fillText(line, px + 20, ty);
            ty += 18;
        }

        // Choices (only show when text is fully displayed)
        if (this._typewriterIndex >= this.currentNode.text.length) {
            const choices = this.currentNode.choices;
            let cy = py + panelH - 15 - choices.length * 22;

            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                ctx.font = '11px Courier New';
                ctx.fillStyle = '#0ff';
                ctx.fillText(`[${i + 1}] ${choice.text}`, px + 30, cy);
                cy += 22;
            }
        } else {
            // Show skip hint
            ctx.font = '9px Courier New';
            ctx.fillStyle = '#446';
            ctx.textAlign = 'center';
            ctx.fillText('[SPACE] Skip', px + panelW / 2, py + panelH - 10);
        }
    },

    _wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth) {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }
};
