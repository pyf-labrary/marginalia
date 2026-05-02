// ============================================
// 分身检测员 — Game UI Renderer
// Reads from window.GameCore, window.GAME_DATA, window.GameAudio
// Builds all DOM inside #app, wires events, updates on callbacks
// ============================================

(function () {
  'use strict';

  const GC = () => window.GameCore;
  const GD = () => window.GAME_DATA;
  const GA = () => window.GameAudio;

  let audioInited = false;
  let app, screens = {};
  let decisionPending = false;

  // ── Helpers ──────────────────────────────────────────────────────────

  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === 'className') e.className = v;
        else if (k === 'textContent') e.textContent = v;
        else if (k === 'innerHTML') e.innerHTML = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
        else e.setAttribute(k, v);
      }
    }
    for (const c of children) {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    }
    return e;
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return (root || document).querySelectorAll(sel); }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ':' + String(sec).padStart(2, '0');
  }

  function initAudioOnce() {
    if (audioInited) return;
    audioInited = true;
    try { GA().init(); GA().resume(); } catch (_) {}
  }

  function showScreen(id) {
    for (const s of Object.values(screens)) s.classList.remove('active');
    if (screens[id]) screens[id].classList.add('active');
  }

  function showNotification(msg, type) {
    const container = $('#notification-container');
    if (!container) return;
    const t = type || 'success';
    const n = el('div', { className: 'notification notif-' + t, textContent: msg });
    container.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.3s'; }, 2500);
    setTimeout(() => { if (n.parentNode) n.parentNode.removeChild(n); }, 3000);
  }

  // ── Portrait Rendering ──────────────────────────────────────────────

  function renderPortrait(appearance, mini) {
    const size = mini ? 'mini' : 'full';
    const skin = appearance?.skinColor || '#d2a679';
    const hair = appearance?.hairColor || '#1a1a1a';
    const eyes = appearance?.eyeColor || '#1a1a1a';
    const clothing = appearance?.clothingColor || '#4a6741';
    const feature = appearance?.feature || '';

    const wrapper = el('div', { className: 'portrait-body' });
    wrapper.style.background = clothing;

    const head = el('div', { className: 'portrait-head' });
    head.style.background = skin;

    const hairDiv = el('div', { className: 'portrait-hair' });
    hairDiv.style.cssText = `position:absolute;top:0;left:50%;transform:translateX(-50%);width:50%;height:20%;border-radius:50% 50% 0 0;background:${hair};z-index:1;`;

    const eyeL = el('div');
    eyeL.style.cssText = `position:absolute;top:22%;left:35%;width:6px;height:6px;border-radius:50%;background:${eyes};`;
    const eyeR = el('div');
    eyeR.style.cssText = `position:absolute;top:22%;right:35%;width:6px;height:6px;border-radius:50%;background:${eyes};`;

    if (mini) {
      hairDiv.style.width = '55%';
      hairDiv.style.height = '18%';
      eyeL.style.width = eyeR.style.width = '4px';
      eyeL.style.height = eyeR.style.height = '4px';
    }

    head.appendChild(hairDiv);
    head.appendChild(eyeL);
    head.appendChild(eyeR);

    const torso = el('div', { className: 'portrait-torso' });
    torso.style.background = clothing;

    wrapper.appendChild(head);
    wrapper.appendChild(torso);

    if (feature && feature !== '无明显特征') {
      const feat = el('div', { className: 'portrait-feature' });
      feat.style.cssText = `position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:${mini ? '0.5rem' : '0.6rem'};color:#e8d5b7;white-space:nowrap;text-shadow:0 1px 2px rgba(0,0,0,0.8);`;
      feat.textContent = feature;
      wrapper.appendChild(feat);
    }

    return wrapper;
  }

  // ── Build Loading Screen ────────────────────────────────────────────

  function buildLoadingScreen() {
    return el('div', { id: 'loading-screen', className: 'screen active' },
      el('div', { className: 'loading-title', textContent: '分身检测员' }),
      el('div', { className: 'loading-bar-container' },
        el('div', { className: 'loading-bar' })
      ),
      el('div', { className: 'loading-status', textContent: '正在加载...' }),
      el('div', { className: 'loading-substatus', textContent: 'Initializing systems' })
    );
  }

  // ── Build Menu Screen ───────────────────────────────────────────────

  function buildMenuScreen() {
    const hasSave = GC().hasSave ? GC().hasSave() : false;

    const btnNew = el('button', {
      id: 'btn-new-game', className: 'btn btn-primary',
      textContent: '🎮 新游戏',
      onClick: () => { initAudioOnce(); GA().playClick(); GC().newGame(); }
    });

    const btnContinue = el('button', {
      id: 'btn-continue', className: 'btn',
      textContent: '▶ 继续游戏',
      onClick: () => { initAudioOnce(); GA().playClick(); GC().continueGame(); }
    });
    if (!hasSave) btnContinue.disabled = true;

    const btnSettings = el('button', {
      id: 'btn-settings', className: 'btn',
      textContent: '⚙ 设置',
      onClick: () => { initAudioOnce(); GA().playClick(); showSettingsModal(); }
    });

    const btnHelp = el('button', {
      id: 'btn-help', className: 'btn',
      textContent: '❓ 帮助',
      onClick: () => { initAudioOnce(); GA().playClick(); showHelpModal(); }
    });

    const content = el('div', { className: 'menu-content' },
      el('h1', { className: 'menu-title', textContent: '分身检测员' }),
      el('p', { className: 'menu-subtitle', textContent: 'Department of Doppelgänger Detection · 1955' }),
      el('div', { className: 'menu-buttons' }, btnNew, btnContinue, btnSettings, btnHelp)
    );

    const screen = el('div', { id: 'menu-screen', className: 'screen' }, content,
      el('div', { className: 'menu-version', textContent: 'v2.0' })
    );
    return screen;
  }

  // ── Settings Modal ──────────────────────────────────────────────────

  function showSettingsModal() {
    removeModal();
    const soundOn = GA().enabled !== false;
    const overlay = el('div', { className: 'modal-overlay active', id: 'modal-overlay' });

    const toggle = el('button', {
      className: 'btn', textContent: soundOn ? '🔊 音效: 开' : '🔇 音效: 关',
      onClick: function () {
        GA().enabled = !GA().enabled;
        this.textContent = GA().enabled ? '🔊 音效: 开' : '🔇 音效: 关';
      }
    });

    const closeBtn = el('button', { className: 'btn', textContent: '关闭', onClick: removeModal });

    overlay.appendChild(
      el('div', { className: 'modal-content' },
        el('h2', { textContent: '⚙ 设置' }),
        el('p', { textContent: '调整游戏设置' }),
        toggle,
        el('div', { className: 'modal-buttons' }, closeBtn)
      )
    );
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });
    app.appendChild(overlay);
  }

  // ── Help Modal ──────────────────────────────────────────────────────

  function showHelpModal() {
    removeModal();
    const overlay = el('div', { className: 'modal-overlay active', id: 'modal-overlay' });
    const closeBtn = el('button', { className: 'btn', textContent: '关闭', onClick: removeModal });

    overlay.appendChild(
      el('div', { className: 'modal-content' },
        el('h2', { textContent: '❓ 游戏帮助' }),
        el('p', { textContent: '欢迎来到分身检测部门！你的任务是检查每位来访者的身份，识别并拦截伪装成人类的分身。' }),
        el('p', { textContent: '🔍 检查证件：仔细核对姓名、照片、公寓号、有效期和公章。' }),
        el('p', { textContent: '❓ 提问：向来访者提问，注意回答中的矛盾和可疑之处。' }),
        el('p', { textContent: '📞 打电话：致电住户核实来访者身份。' }),
        el('p', { textContent: '✅ 通过：允许合法来访者进入。' }),
        el('p', { textContent: '❌ 拒绝：拦截可疑的分身。' }),
        el('p', { textContent: '⚠ 可疑：标记需要进一步调查的来访者。' }),
        el('p', { textContent: '❤ 每次错误判断会失去一条生命。生命耗尽则游戏结束。' }),
        el('p', { textContent: '⏱ 每关有时间限制，时间耗尽该关结束。' }),
        el('div', { className: 'modal-buttons' }, closeBtn)
      )
    );
    overlay.addEventListener('click', (e) => { if (e.target === overlay) removeModal(); });
    app.appendChild(overlay);
  }

  function removeModal() {
    const m = $('#modal-overlay');
    if (m) m.parentNode.removeChild(m);
  }

  // ── Build Game Screen ───────────────────────────────────────────────

  function buildGameScreen() {
    // HUD
    const hud = el('div', { id: 'game-hud' },
      el('div', { className: 'hud-level', textContent: 'Day 1' }),
      el('div', { className: 'hud-score' }, 'Score: ', el('span', { className: 'score-value', textContent: '0' })),
      el('div', { className: 'hud-lives', innerHTML: '❤❤❤' }),
      el('div', { className: 'hud-timer', textContent: '3:00' }),
      el('div', { className: 'hud-combo' })
    );

    // Visitor panel
    const portraitFrame = el('div', { className: 'portrait-frame' },
      el('div', { className: 'portrait-body' })
    );
    const visitorName = el('div', { className: 'visitor-name', textContent: '—' });
    const visitorAppearance = el('div', { className: 'visitor-detail' });
    const visitorQueue = el('div', { className: 'visitor-queue' },
      'Waiting: ', el('span', { className: 'queue-count', textContent: '0' })
    );

    const visitorPanel = el('div', { id: 'visitor-panel' },
      el('div', { className: 'panel-title', textContent: '来访者' }),
      portraitFrame,
      el('div', { className: 'visitor-info' }, visitorName, visitorAppearance),
      visitorQueue
    );

    // Work area
    const docArea = el('div', { id: 'document-area' });
    const dialogueArea = el('div', { id: 'dialogue-area' });
    const workArea = el('div', { id: 'work-area' }, docArea, dialogueArea);

    // Action panel
    const questionSection = el('div', { className: 'panel-section' },
      el('div', { className: 'panel-section-title', textContent: '提问' })
    );
    const questions = GD().QUESTIONS || [];
    questions.forEach((q) => {
      const btn = el('button', {
        className: 'question-btn',
        textContent: q.icon + ' ' + q.text,
        'data-qid': q.id,
        onClick: () => handleQuestion(q.id, btn)
      });
      questionSection.appendChild(btn);
    });

    const stampSection = el('div', { className: 'panel-section' },
      el('div', { className: 'panel-section-title', textContent: '判定' }),
      el('div', { className: 'stamp-buttons' },
        el('button', { className: 'stamp-approve', textContent: '✅ 通过', onClick: () => handleDecision('approve') }),
        el('button', { className: 'stamp-deny', textContent: '❌ 拒绝', onClick: () => handleDecision('deny') }),
        el('button', { className: 'stamp-suspect', textContent: '⚠ 可疑', onClick: () => handleDecision('suspect') })
      )
    );

    const phoneSection = el('div', { className: 'panel-section' },
      el('button', { className: 'phone-btn', textContent: '📞 打电话确认', onClick: handlePhoneCall })
    );

    const pauseBtn = el('button', {
      className: 'btn btn-small btn-pause', textContent: '⏸ 暂停',
      onClick: () => {
        GA().playClick();
        if (GC().state === 'paused') GC().resumeGame();
        else GC().pauseGame();
      }
    });

    const actionPanel = el('div', { id: 'action-panel' },
      questionSection, stampSection, phoneSection, pauseBtn
    );

    const layout = el('div', { className: 'game-layout' }, visitorPanel, workArea, actionPanel);
    return el('div', { id: 'game-screen', className: 'screen' }, hud, layout);
  }

  // ── Build Phone Overlay ─────────────────────────────────────────────

  function buildPhoneOverlay() {
    const status = el('div', { className: 'phone-header', textContent: '📞 拨号中...' });
    const result = el('div', { className: 'phone-messages' });
    const closeBtn = el('button', {
      className: 'btn btn-small', textContent: '挂断',
      onClick: () => {
        GA().playClick();
        screens.phone.classList.remove('active');
      }
    });
    return el('div', { id: 'phone-overlay' },
      el('div', { className: 'phone-content' }, status, result,
        el('div', { className: 'phone-actions' }, closeBtn)
      )
    );
  }

  // ── Build Results Screen ────────────────────────────────────────────

  function buildResultsScreen() {
    const title = el('div', { className: 'results-title', textContent: 'Day 1 Complete' });
    const grade = el('div', { className: 'results-grade', textContent: 'B' });
    const stats = el('div', { className: 'results-stats' });
    const btnNext = el('button', {
      className: 'btn btn-primary', textContent: '下一关',
      onClick: () => {
        GA().playClick();
        GC().startLevel(GC().levelNum + 1);
      }
    });
    const btnRetry = el('button', {
      className: 'btn', textContent: '重试',
      onClick: () => {
        GA().playClick();
        GC().startLevel(GC().levelNum);
      }
    });
    const btnMenu = el('button', {
      className: 'btn', textContent: '返回菜单',
      onClick: () => {
        GA().playClick();
        GC().saveProgress();
        showScreen('menu');
        refreshMenu();
      }
    });
    const buttons = el('div', { className: 'results-buttons' }, btnNext, btnRetry, btnMenu);
    return el('div', { id: 'results-screen', className: 'screen' },
      el('div', { className: 'results-content' }, title, grade, stats, buttons)
    );
  }

  // ── Build Game Over Screen ──────────────────────────────────────────

  function buildGameOverScreen() {
    const title = el('div', { className: 'gameover-title', textContent: 'GAME OVER' });
    const subtitle = el('div', { className: 'gameover-subtitle', textContent: '分身入侵成功...' });
    const score = el('div', { className: 'gameover-score', textContent: '最终得分: 0' });
    const btnRetry = el('button', {
      className: 'btn btn-primary', textContent: '重试',
      onClick: () => { GA().playClick(); GC().startLevel(GC().levelNum); }
    });
    const btnMenu = el('button', {
      className: 'btn', textContent: '返回菜单',
      onClick: () => { GA().playClick(); showScreen('menu'); refreshMenu(); }
    });
    return el('div', { id: 'gameover-screen', className: 'screen' },
      el('div', { className: 'gameover-content' }, title, subtitle, score,
        el('div', { className: 'gameover-buttons' }, btnRetry, btnMenu)
      )
    );
  }

  // ── Build Notification Container ────────────────────────────────────

  function buildNotificationContainer() {
    return el('div', { id: 'notification-container' });
  }

  // ── Interaction Handlers ────────────────────────────────────────────

  function handleQuestion(id, btn) {
    if (!GC().visitor || decisionPending) return;
    initAudioOnce();
    GA().playClick();
    btn.disabled = true;

    // Show player question in dialogue
    const qData = (GD().QUESTIONS || []).find(q => q.id === id);
    appendDialogue('player', qData ? qData.text : id);

    const result = GC().askQuestion(id);
    if (result) {
      const cls = result.suspicious ? 'msg-visitor suspicious-answer' : 'msg-visitor';
      appendDialogue('visitor', result.text, cls);
      if (result.suspicious) btn.style.borderColor = '#f39c12';
    }
  }

  function handlePhoneCall() {
    if (!GC().visitor || decisionPending) return;
    initAudioOnce();
    GA().playPhone();

    const overlay = screens.phone;
    overlay.classList.add('active');
    const header = $('.phone-header', overlay);
    const msgs = $('.phone-messages', overlay);
    header.textContent = '📞 拨号中...';
    msgs.innerHTML = '';

    GC().makePhoneCall().then((result) => {
      header.textContent = '📞 通话结果';
      if (result) {
        const msg = el('div', { className: 'dialogue-msg msg-phone', textContent: result.text });
        msgs.appendChild(msg);
        appendDialogue('phone', result.text);
      }
    }).catch(() => {
      header.textContent = '📞 通话失败';
      msgs.appendChild(el('div', { className: 'dialogue-msg msg-phone', textContent: '（线路故障...）' }));
    });
  }

  function handleDecision(decision) {
    if (!GC().visitor || decisionPending) return;
    decisionPending = true;
    initAudioOnce();
    GA().playStamp();

    const result = GC().decide(decision);
    if (!result) { decisionPending = false; return; }

    if (result.correct) {
      GA().playCorrect();
      showNotification('✅ 判断正确！' + (result.reason || ''), 'success');
      if (GC().combo > 1) GA().playCombo(GC().combo);
    } else {
      GA().playWrong();
      showNotification('❌ 判断错误！' + (result.reason || ''), 'error');
      shakeScreen();
    }

    // Show flaws if it was a doppelganger
    if (result.isDoppelganger && result.flaws && result.flaws.length) {
      const flawText = '破绽: ' + result.flaws.map(f => f.desc || f).join(', ');
      appendDialogue('system', flawText);
    }

    // Disable action buttons during transition
    setActionsEnabled(false);

    setTimeout(() => {
      decisionPending = false;
      if (GC().state === 'results') {
        showResultsScreen();
      } else if (GC().state === 'gameover') {
        showGameOverScreen();
      } else if (GC().state === 'playing') {
        GC().nextVisitor();
      }
    }, 1500);
  }

  function shakeScreen() {
    const gs = screens.game;
    if (!gs) return;
    gs.style.animation = 'shake 0.4s ease';
    setTimeout(() => { gs.style.animation = ''; }, 500);
  }

  function setActionsEnabled(enabled) {
    const panel = $('#action-panel');
    if (!panel) return;
    $$('.stamp-approve, .stamp-deny, .stamp-suspect, .phone-btn', panel).forEach(b => {
      b.disabled = !enabled;
    });
  }

  // ── Dialogue ────────────────────────────────────────────────────────

  function appendDialogue(type, text, extraClass) {
    const area = $('#dialogue-area');
    if (!area) return;
    let cls = 'dialogue-msg ';
    if (type === 'visitor') cls += extraClass || 'msg-visitor';
    else if (type === 'player') cls += 'msg-player';
    else if (type === 'phone') cls += 'msg-phone';
    else cls += 'msg-system';

    const msg = el('div', { className: cls, textContent: text });
    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
  }

  // ── Document Rendering ──────────────────────────────────────────────

  function renderDocuments() {
    const area = $('#document-area');
    if (!area) return;
    area.innerHTML = '';

    const docs = GC().getVisitorDocuments();
    if (!docs || !docs.length) return;

    GA().playPaper();

    docs.forEach((doc) => {
      const card = el('div', { className: 'document' });

      // Header
      const typeNames = {
        id_card: '身份证', visitor_pass: '访客通行证',
        work_permit: '工作证明', delivery_slip: '送货单', meeting_notice: '会议通知'
      };
      card.appendChild(el('div', { className: 'doc-header', textContent: typeNames[doc.type] || doc.type }));

      const fields = doc.fields || {};

      // Photo
      if (fields.photo !== undefined) {
        const photoFrame = el('div', { className: 'doc-photo' });
        const visitor = GC().visitor;
        if (visitor && visitor.appearance) {
          const miniPortrait = renderPortrait(visitor.appearance, true);
          miniPortrait.style.width = '100%';
          miniPortrait.style.height = '100%';
          miniPortrait.style.borderRadius = '0';
          photoFrame.appendChild(miniPortrait);
        }
        card.appendChild(photoFrame);
      }

      // Fields
      const fieldLabels = {
        name: '姓名', apt: '公寓', height: '身高', occupation: '职业',
        issueDate: '签发日期', expiryDate: '有效期至', serialNumber: '编号'
      };
      for (const [key, label] of Object.entries(fieldLabels)) {
        if (fields[key] !== undefined) {
          card.appendChild(
            el('div', { className: 'doc-field' },
              el('span', { className: 'field-label', textContent: label }),
              el('span', { className: 'field-value', textContent: String(fields[key]) })
            )
          );
        }
      }

      // Stamp
      if (fields.stamp !== undefined) {
        const stampDiv = el('div', { className: 'doc-stamp' });
        if (fields.stamp) {
          stampDiv.classList.add('stamp-approved');
          stampDiv.textContent = '✓ 已盖章';
        } else {
          stampDiv.classList.add('stamp-denied');
          stampDiv.textContent = '✗ 无章';
        }
        card.appendChild(stampDiv);
      }

      area.appendChild(card);
    });
  }

  // ── Visitor Arrival ─────────────────────────────────────────────────

  function onVisitorArrive(visitor) {
    if (!visitor) return;
    GA().playDoor();

    // Portrait
    const frame = $('.portrait-frame', screens.game);
    if (frame) {
      frame.innerHTML = '';
      const portrait = renderPortrait(visitor.appearance);
      frame.appendChild(portrait);
      frame.classList.add('visitor-enter');
      setTimeout(() => frame.classList.remove('visitor-enter'), 600);
    }

    // Info
    const nameEl = $('.visitor-name', screens.game);
    if (nameEl) nameEl.textContent = visitor.name || '—';

    const detailEl = $('.visitor-detail', screens.game);
    if (detailEl) {
      const app = visitor.appearance || {};
      const parts = [];
      if (app.height) parts.push(app.height);
      if (app.build) parts.push(app.build);
      if (app.feature && app.feature !== '无明显特征') parts.push(app.feature);
      detailEl.textContent = parts.join(' · ') || '';
    }

    // Queue
    updateQueue();

    // Clear dialogue and documents
    const dialogueArea = $('#dialogue-area');
    if (dialogueArea) dialogueArea.innerHTML = '';
    const docArea = $('#document-area');
    if (docArea) docArea.innerHTML = '';

    // Greeting
    const greeting = GC().getVisitorGreeting();
    if (greeting) appendDialogue('visitor', greeting);

    // Documents
    renderDocuments();

    // Re-enable actions and question buttons
    setActionsEnabled(true);
    resetQuestionButtons();
    decisionPending = false;
  }

  function resetQuestionButtons() {
    const asked = GC().askedQuestions || [];
    $$('.question-btn', screens.game).forEach(btn => {
      const qid = btn.getAttribute('data-qid');
      btn.disabled = asked.includes(qid);
      btn.style.borderColor = '';
    });
  }

  function updateQueue() {
    const queueEl = $('.queue-count', screens.game);
    if (!queueEl) return;
    const level = GC().level;
    const total = level ? level.visitors : 0;
    const processed = GC().processedCount || 0;
    queueEl.textContent = Math.max(0, total - processed);
  }

  // ── HUD Updates ─────────────────────────────────────────────────────

  function updateHUD() {
    const hud = $('#game-hud');
    if (!hud) return;

    const levelEl = $('.hud-level', hud);
    if (levelEl) levelEl.textContent = 'Day ' + (GC().levelNum || 1);

    updateScore(GC().score || 0);
    updateLives(GC().lives);
    updateTimer(GC().timeLeft);
    updateCombo(GC().combo || 0);
  }

  function updateScore(score, delta) {
    const sv = $('.score-value', screens.game);
    if (sv) sv.textContent = score;
    if (delta && delta > 0) {
      sv.style.color = '#2ecc71';
      setTimeout(() => { sv.style.color = ''; }, 400);
    }
  }

  function updateLives(lives) {
    const el = $('.hud-lives', screens.game);
    if (!el || lives === undefined) return;
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += i < lives ? '❤' : '<span class="heart-empty">❤</span>';
    }
    el.innerHTML = html;
  }

  function updateTimer(timeLeft) {
    const t = $('.hud-timer', screens.game);
    if (!t || timeLeft === undefined) return;
    t.textContent = formatTime(timeLeft);
    t.classList.remove('timer-warning', 'timer-danger');
    if (timeLeft <= 15) t.classList.add('timer-danger');
    else if (timeLeft <= 30) t.classList.add('timer-warning');
  }

  function updateCombo(combo) {
    const c = $('.hud-combo', screens.game);
    if (!c) return;
    if (combo > 1) {
      c.textContent = '🔥 x' + combo;
      c.classList.add('combo-active');
    } else {
      c.textContent = '';
      c.classList.remove('combo-active');
    }
  }

  // ── Results Screen ──────────────────────────────────────────────────

  function showResultsScreen() {
    GA().playLevelComplete();
    const results = GC().getLevelResults();
    if (!results) { showScreen('results'); return; }

    const titleEl = $('.results-title', screens.results);
    if (titleEl) titleEl.textContent = 'Day ' + (GC().levelNum || 1) + ' Complete';

    const gradeEl = $('.results-grade', screens.results);
    if (gradeEl) {
      gradeEl.textContent = results.grade || 'C';
      gradeEl.className = 'results-grade grade-' + (results.grade || 'c').toLowerCase();
    }

    // Stars
    if (results.stars) {
      const starsText = '★'.repeat(results.stars) + '☆'.repeat(Math.max(0, 3 - results.stars));
      if (gradeEl) gradeEl.textContent += '\n' + starsText;
    }

    // Stats
    const statsEl = $('.results-stats', screens.results);
    if (statsEl) {
      statsEl.innerHTML = '';
      const s = results.stats || {};
      const statItems = [
        ['处理来访者', s.processed || GC().processedCount || 0],
        ['正确判断', s.correct || GC().correctCount || 0],
        ['错误判断', s.wrong || GC().wrongCount || 0],
        ['发现分身', s.doppelgangersFound || GC().doppelgangersFound || 0],
        ['遗漏分身', s.doppelgangersMissed || GC().doppelgangersMissed || 0],
        ['总分', results.totalScore || GC().score || 0],
      ];
      const bonuses = results.bonuses || [];
      bonuses.forEach(b => statItems.push([b.name || '奖励', '+' + (b.value || 0)]));

      statItems.forEach(([label, value]) => {
        statsEl.appendChild(
          el('div', { className: 'stat-item' },
            el('span', { className: 'stat-label', textContent: label }),
            el('span', { className: 'stat-value', textContent: String(value) })
          )
        );
      });
    }

    // Check if there's a next level
    const levels = GD().LEVELS || [];
    const nextBtn = $('.btn-primary', screens.results);
    if (nextBtn) {
      nextBtn.disabled = GC().levelNum >= levels.length;
    }

    showScreen('results');
  }

  // ── Game Over Screen ────────────────────────────────────────────────

  function showGameOverScreen() {
    GA().playGameOver();
    const scoreEl = $('.gameover-score', screens.gameover);
    if (scoreEl) scoreEl.textContent = '最终得分: ' + (GC().score || 0);
    showScreen('gameover');
  }

  // ── Refresh Menu ────────────────────────────────────────────────────

  function refreshMenu() {
    const btn = $('#btn-continue');
    if (btn) btn.disabled = !(GC().hasSave && GC().hasSave());
  }

  // ── Wire GameCore Callbacks ─────────────────────────────────────────

  function wireCallbacks() {
    const gc = GC();

    gc.onStateChange = function (newState, oldState) {
      switch (newState) {
        case 'menu':
          showScreen('menu');
          refreshMenu();
          break;
        case 'playing':
          showScreen('game');
          updateHUD();
          if (oldState === 'menu' || oldState === 'results' || oldState === undefined) {
            // New level starting — show intro then first visitor
            showLevelIntro(() => {
              GC().nextVisitor();
            });
          } else if (oldState === 'paused') {
            // Resuming
            const pauseBtn = $('.btn-pause', screens.game);
            if (pauseBtn) pauseBtn.textContent = '⏸ 暂停';
          }
          break;
        case 'paused': {
          const pauseBtn = $('.btn-pause', screens.game);
          if (pauseBtn) pauseBtn.textContent = '▶ 继续';
          showPauseOverlay();
          break;
        }
        case 'phone':
          // Phone overlay handled by handlePhoneCall
          break;
        case 'results':
          showResultsScreen();
          break;
        case 'gameover':
          showGameOverScreen();
          break;
      }
    };

    gc.onVisitorArrive = onVisitorArrive;

    gc.onTimerTick = function (timeLeft) {
      updateTimer(timeLeft);
      if (timeLeft <= 10 && timeLeft > 0) GA().playTick();
    };

    gc.onScoreChange = function (score, delta) {
      updateScore(score, delta);
    };

    gc.onLifeChange = function (lives) {
      updateLives(lives);
    };

    gc.onComboChange = function (combo) {
      updateCombo(combo);
    };

    gc.onNotify = function (message, type) {
      showNotification(message, type);
    };
  }

  // ── Level Intro ─────────────────────────────────────────────────────

  function showLevelIntro(callback) {
    const level = GC().level;
    if (!level || !level.intro) { if (callback) callback(); return; }

    removeModal();
    const overlay = el('div', { className: 'modal-overlay active', id: 'modal-overlay' });

    const rulesHtml = (level.rules || []).map(r => el('p', { textContent: '• ' + r }));
    const startBtn = el('button', {
      className: 'btn btn-primary', textContent: '开始工作',
      onClick: () => { GA().playClick(); removeModal(); if (callback) callback(); }
    });

    const content = el('div', { className: 'modal-content' },
      el('h2', { textContent: level.title || ('Day ' + (GC().levelNum || 1)) }),
      el('p', { textContent: level.intro }),
      ...rulesHtml,
      el('div', { className: 'modal-buttons' }, startBtn)
    );

    overlay.appendChild(content);
    app.appendChild(overlay);
  }

  // ── Pause Overlay ───────────────────────────────────────────────────

  function showPauseOverlay() {
    removeModal();
    const overlay = el('div', { className: 'modal-overlay active', id: 'modal-overlay' });

    const resumeBtn = el('button', {
      className: 'btn btn-primary', textContent: '▶ 继续游戏',
      onClick: () => { GA().playClick(); removeModal(); GC().resumeGame(); }
    });
    const menuBtn = el('button', {
      className: 'btn', textContent: '返回菜单',
      onClick: () => {
        GA().playClick();
        removeModal();
        GC().saveProgress();
        showScreen('menu');
        refreshMenu();
      }
    });

    overlay.appendChild(
      el('div', { className: 'modal-content' },
        el('h2', { textContent: '⏸ 游戏暂停' }),
        el('div', { className: 'modal-buttons' }, resumeBtn, menuBtn)
      )
    );
    app.appendChild(overlay);
  }

  // ── Loading Simulation ──────────────────────────────────────────────

  function simulateLoading(callback) {
    const bar = $('.loading-bar', screens.loading);
    const status = $('.loading-status', screens.loading);
    const sub = $('.loading-substatus', screens.loading);

    const steps = [
      { pct: 20, text: '加载数据...', sub: 'Loading game data' },
      { pct: 50, text: '初始化系统...', sub: 'Initializing core systems' },
      { pct: 75, text: '准备界面...', sub: 'Building UI components' },
      { pct: 100, text: '准备就绪', sub: 'Ready' },
    ];

    let i = 0;
    function next() {
      if (i >= steps.length) {
        setTimeout(callback, 300);
        return;
      }
      const step = steps[i++];
      if (bar) bar.style.width = step.pct + '%';
      if (status) status.textContent = step.text;
      if (sub) sub.textContent = step.sub;
      setTimeout(next, 350);
    }
    setTimeout(next, 200);
  }

  // ── First Interaction Audio Init ────────────────────────────────────

  function setupFirstInteraction() {
    function handler() {
      initAudioOnce();
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    }
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
  }

  // ── Init ────────────────────────────────────────────────────────────

  function init() {
    app = $('#app');
    if (!app) return;
    app.style.position = 'relative';
    app.style.width = '100%';
    app.style.height = '100%';
    app.style.overflow = 'hidden';

    // Build all screens
    screens.loading = buildLoadingScreen();
    screens.menu = buildMenuScreen();
    screens.game = buildGameScreen();
    screens.phone = buildPhoneOverlay();
    screens.results = buildResultsScreen();
    screens.gameover = buildGameOverScreen();
    const notifContainer = buildNotificationContainer();

    // Append to app
    app.appendChild(screens.loading);
    app.appendChild(screens.menu);
    app.appendChild(screens.game);
    app.appendChild(screens.phone);
    app.appendChild(screens.results);
    app.appendChild(screens.gameover);
    app.appendChild(notifContainer);

    // Wire callbacks
    wireCallbacks();

    // First interaction audio
    setupFirstInteraction();

    // Simulate loading then show menu
    simulateLoading(() => {
      showScreen('menu');
    });
  }

  // ── DOMContentLoaded ────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
