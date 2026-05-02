/**
 * 分身检测员 (Doppelgänger Detector) — Game Core Engine
 * All game logic, NO DOM manipulation.
 * Reads from window.GAME_DATA, exposes window.GameCore.
 */
(function () {
  'use strict';

  var D = window.GAME_DATA;

  // ── Helpers ──────────────────────────────────────────────────────────

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickN(arr, n) {
    var copy = arr.slice();
    var out = [];
    n = Math.min(n, copy.length);
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function randomDate(yearStart, yearEnd) {
    var y = yearStart + Math.floor(Math.random() * (yearEnd - yearStart + 1));
    var m = 1 + Math.floor(Math.random() * 12);
    var d = 1 + Math.floor(Math.random() * 28);
    return y + '-' + pad2(m) + '-' + pad2(d);
  }

  function randomSerial() {
    var prefixes = ['BJ', 'SH', 'TJ', 'NJ', 'GZ'];
    var p = pick(prefixes);
    var y = 1950 + Math.floor(Math.random() * 6);
    var n = 10000 + Math.floor(Math.random() * 90000);
    return p + '-' + y + '-' + n;
  }

  function fillTemplate(tpl, vars) {
    var result = tpl;
    for (var k in vars) {
      if (vars.hasOwnProperty(k)) {
        result = result.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      }
    }
    return result;
  }

  function replaceOneChar(str) {
    if (str.length <= 1) return str + '某';
    var chars = str.split('');
    var idx = Math.floor(Math.random() * chars.length);
    var replacements = ['明', '华', '强', '英', '国', '芳', '伟', '兰', '军', '珍'];
    var orig = chars[idx];
    var rep = orig;
    var attempts = 0;
    while (rep === orig && attempts < 20) {
      rep = pick(replacements);
      attempts++;
    }
    chars[idx] = rep;
    return chars.join('');
  }

  function pickDifferent(arr, exclude) {
    var filtered = arr.filter(function (x) { return x !== exclude; });
    return filtered.length > 0 ? pick(filtered) : exclude;
  }

  function pickDifferentApt(currentId) {
    var others = D.APARTMENTS.filter(function (a) { return a.id !== currentId; });
    return pick(others).id;
  }

  // ── Game Core ────────────────────────────────────────────────────────

  var GC = {
    // === STATE ===
    state: 'menu',
    level: null,
    levelNum: 0,
    score: 0,
    lives: 3,
    combo: 0,
    timeLeft: 0,
    visitor: null,
    visitorQueue: [],
    processedCount: 0,
    correctCount: 0,
    wrongCount: 0,
    doppelgangersFound: 0,
    doppelgangersMissed: 0,
    askedQuestions: [],
    phoneResult: null,

    // === CALLBACKS ===
    onStateChange: null,
    onVisitorArrive: null,
    onTimerTick: null,
    onScoreChange: null,
    onLifeChange: null,
    onComboChange: null,
    onNotify: null,

    // === INTERNAL ===
    _timerInterval: null,
    _levelScore: 0,

    // ── State transition ───────────────────────────────────────────────

    _setState: function (newState) {
      var old = this.state;
      if (old === newState) return;
      this.state = newState;
      if (this.onStateChange) this.onStateChange(newState, old);
    },

    // ── New Game ───────────────────────────────────────────────────────

    newGame: function () {
      this.score = 0;
      this.lives = 3;
      this.combo = 0;
      this.levelNum = 0;
      this.visitor = null;
      this.visitorQueue = [];
      this.processedCount = 0;
      this.correctCount = 0;
      this.wrongCount = 0;
      this.doppelgangersFound = 0;
      this.doppelgangersMissed = 0;
      this.askedQuestions = [];
      this.phoneResult = null;
      this._levelScore = 0;
      this.startLevel(1);
    },

    // ── Continue Game ──────────────────────────────────────────────────

    continueGame: function () {
      var save = this.loadProgress();
      if (!save) {
        this.newGame();
        return;
      }
      this.score = save.score || 0;
      this.lives = save.lives || 3;
      this.combo = 0;
      this.visitor = null;
      this.visitorQueue = [];
      this.processedCount = 0;
      this.correctCount = 0;
      this.wrongCount = 0;
      this.doppelgangersFound = 0;
      this.doppelgangersMissed = 0;
      this.askedQuestions = [];
      this.phoneResult = null;
      this._levelScore = 0;
      this.startLevel(save.levelNum || 1);
    },

    // ── Start Level ────────────────────────────────────────────────────

    startLevel: function (levelNum) {
      levelNum = clamp(levelNum, 1, D.LEVELS.length);
      this.levelNum = levelNum;
      this.level = D.LEVELS[levelNum - 1];
      this.timeLeft = this.level.timeLimit;
      this.visitor = null;
      this.visitorQueue = [];
      this.processedCount = 0;
      this.correctCount = 0;
      this.wrongCount = 0;
      this.doppelgangersFound = 0;
      this.doppelgangersMissed = 0;
      this.askedQuestions = [];
      this.phoneResult = null;
      this._levelScore = 0;

      // Build visitor queue
      var total = this.level.visitors;
      var dopCount = 0;
      for (var i = 0; i < total; i++) {
        var isDop = Math.random() < this.level.doppelgangerChance;
        if (isDop) dopCount++;
      }
      // Ensure at least 1 doppelganger and at least 1 real visitor
      if (dopCount === 0) dopCount = 1;
      if (dopCount >= total) dopCount = total - 1;

      var queue = [];
      for (var j = 0; j < total; j++) {
        var makeDop = j < dopCount;
        queue.push(this._generateVisitor(makeDop));
      }
      this.visitorQueue = shuffle(queue);

      this._setState('playing');
      this._startTimer();
    },

    // ── Pause / Resume ─────────────────────────────────────────────────

    pauseGame: function () {
      if (this.state !== 'playing' && this.state !== 'phone') return;
      this._stopTimer();
      this._setState('paused');
    },

    resumeGame: function () {
      if (this.state !== 'paused') return;
      this._setState('playing');
      this._startTimer();
    },

    // ── Timer ──────────────────────────────────────────────────────────

    _startTimer: function () {
      this._stopTimer();
      var self = this;
      this._timerInterval = setInterval(function () {
        if (self.state !== 'playing' && self.state !== 'phone') return;
        self.timeLeft--;
        if (self.onTimerTick) self.onTimerTick(self.timeLeft);
        if (self.timeLeft <= 0) {
          self.timeLeft = 0;
          self._stopTimer();
          self._endLevel();
        }
      }, 1000);
    },

    _stopTimer: function () {
      if (this._timerInterval) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
    },

    // ── End Level ──────────────────────────────────────────────────────

    _endLevel: function () {
      this._stopTimer();

      // Count missed doppelgangers still in queue
      for (var i = 0; i < this.visitorQueue.length; i++) {
        if (this.visitorQueue[i].isDoppelganger) {
          this.doppelgangersMissed++;
        }
      }
      // If current visitor is a doppelganger and not yet decided, count as missed
      if (this.visitor && this.visitor.isDoppelganger) {
        this.doppelgangersMissed++;
      }

      this.visitor = null;
      this.visitorQueue = [];
      this._setState('results');
    },

    // ── Next Visitor ───────────────────────────────────────────────────

    nextVisitor: function () {
      if (this.visitorQueue.length === 0) {
        this._endLevel();
        return null;
      }
      this.visitor = this.visitorQueue.shift();
      this.askedQuestions = [];
      this.phoneResult = null;
      if (this.onVisitorArrive) this.onVisitorArrive(this.visitor);
      return this.visitor;
    },

    // ── Ask Question ───────────────────────────────────────────────────

    askQuestion: function (questionId) {
      if (!this.visitor) return { text: '', suspicious: false };

      // Track asked questions
      if (this.askedQuestions.indexOf(questionId) === -1) {
        this.askedQuestions.push(questionId);
      }

      // show_docs is special — just returns a generic response
      if (questionId === 'show_docs') {
        var docText = this.visitor.isDoppelganger && this.visitor.behavior === 'nervous'
          ? '啊...证件...在这里...给你看。'
          : '好的，这是我的证件。';
        return { text: docText, suspicious: this.visitor.isDoppelganger && this.visitor.behavior === 'nervous' };
      }

      var templates = D.RESPONSES[questionId];
      if (!templates) return { text: '...', suspicious: false };

      var v = this.visitor;
      var isDop = v.isDoppelganger;
      var hasStoryFlaw = false;
      for (var i = 0; i < v.flaws.length; i++) {
        if (v.flaws[i].id === 'story_inconsistent') { hasStoryFlaw = true; break; }
      }

      // Use doppelganger template if doppelganger AND (has story flaw OR random 40% chance)
      var useDopTemplate = isDop && (hasStoryFlaw || Math.random() < 0.4);
      var pool = useDopTemplate ? templates.doppelganger : templates.normal;
      var tpl = pick(pool);

      // Build template variables
      var apt = D.APARTMENTS.filter(function (a) { return a.id === v.targetApt; })[0];
      var vars = {
        residentName: v.targetResident,
        apt: v.targetApt,
        floor: apt ? '' + apt.floor : '?',
        room: apt ? '' + apt.room : '?',
        occupation: v.occupation,
        workplace: v.workplace,
        reason: v.reason,
        residentOccupation: apt ? apt.residentOccupation : '工人',
        residentDesc: apt ? (apt.residentGender === 'male' ? '男同志' : '女同志') + '，' + apt.residentOccupation : '住户',
        wrongName: replaceOneChar(v.targetResident),
        wrongApt: pickDifferentApt(v.targetApt),
        wrongOccupation: pickDifferent(
          D.OCCUPATIONS.map(function (o) { return o.name; }),
          v.occupation
        ),
      };

      var text = fillTemplate(tpl, vars);
      return { text: text, suspicious: useDopTemplate };
    },

    // ── Phone Call ─────────────────────────────────────────────────────

    makePhoneCall: function () {
      var self = this;
      this.phoneResult = null;
      var prevState = this.state;
      this._setState('phone');

      return new Promise(function (resolve) {
        setTimeout(function () {
          var v = self.visitor;
          if (!v) {
            self.phoneResult = { type: 'no_answer', text: pick(D.PHONE_RESULTS.no_answer) };
            self._setState('playing');
            resolve(self.phoneResult);
            return;
          }

          var type;
          if (!v.isDoppelganger) {
            type = 'confirm';
          } else {
            var roll = Math.random();
            if (roll < 0.7) type = 'deny';
            else if (roll < 0.9) type = 'no_answer';
            else type = 'confirm';
          }

          var tpl = pick(D.PHONE_RESULTS[type]);
          var text = fillTemplate(tpl, { visitorName: v.name });

          self.phoneResult = { type: type, text: text };
          self._setState('playing');
          resolve(self.phoneResult);
        }, 2000);
      });
    },

    // ── Decide ─────────────────────────────────────────────────────────

    decide: function (decision) {
      if (!this.visitor) return { correct: false, reason: '没有来访者', isDoppelganger: false, flaws: [] };

      var v = this.visitor;
      var isDop = v.isDoppelganger;
      var correct = false;

      if (decision === 'approve') {
        correct = !isDop;
      } else {
        // 'deny' or 'suspect'
        correct = isDop;
      }

      this.processedCount++;

      var delta = 0;
      if (correct) {
        this.correctCount++;
        this.combo++;
        if (this.onComboChange) this.onComboChange(this.combo);

        // Base score
        delta = 100;
        // Combo bonus
        if (this.combo >= 3) delta += (this.combo - 2) * 25;
        // Suspect bonus (correctly identifying as doppelganger with 'suspect')
        if (isDop && decision === 'suspect') delta += 50;

        this.score += delta;
        this._levelScore += delta;
        if (this.onScoreChange) this.onScoreChange(this.score, delta);

        if (isDop) {
          this.doppelgangersFound++;
          if (this.onNotify) this.onNotify('正确！发现了一个分身！', 'success');
        } else {
          if (this.onNotify) this.onNotify('正确！这是一位合法来访者。', 'success');
        }
      } else {
        this.wrongCount++;
        this.combo = 0;
        if (this.onComboChange) this.onComboChange(this.combo);

        this.lives--;
        if (this.onLifeChange) this.onLifeChange(this.lives);

        delta = -50;
        this.score = Math.max(0, this.score + delta);
        this._levelScore += delta;
        if (this.onScoreChange) this.onScoreChange(this.score, delta);

        if (isDop) {
          this.doppelgangersMissed++;
          if (this.onNotify) this.onNotify('错误！放走了一个分身！', 'error');
        } else {
          if (this.onNotify) this.onNotify('错误！冤枉了一位合法来访者！', 'error');
        }

        if (this.lives <= 0) {
          this._stopTimer();
          this.visitor = null;
          this._setState('gameover');
          return {
            correct: false,
            reason: isDop ? '这是分身，但你放行了' : '这是合法来访者，但你拒绝了',
            isDoppelganger: isDop,
            flaws: v.flaws.slice()
          };
        }
      }

      var reason = '';
      if (isDop) {
        reason = '这是一个分身。';
        if (v.flaws.length > 0) {
          reason += '破绽：' + v.flaws.map(function (f) { return f.desc; }).join('、') + '。';
        }
      } else {
        reason = '这是一位合法来访者。';
      }

      var result = {
        correct: correct,
        reason: reason,
        isDoppelganger: isDop,
        flaws: v.flaws.slice()
      };

      this.visitor = null;

      // Check if level is done
      if (this.visitorQueue.length === 0) {
        this._endLevel();
      }

      return result;
    },

    // ── Get Visitor Documents ──────────────────────────────────────────

    getVisitorDocuments: function () {
      if (!this.visitor) return [];
      return this.visitor.documents.map(function (doc) {
        return {
          type: doc.type,
          fields: JSON.parse(JSON.stringify(doc.fields)),
          flaws: doc.flaws.slice()
        };
      });
    },

    // ── Get Visitor Greeting ───────────────────────────────────────────

    getVisitorGreeting: function () {
      if (!this.visitor) return '';
      return pick(D.GREETINGS[this.visitor.greetingType] || D.GREETINGS.normal);
    },

    // ── Get Level Results ──────────────────────────────────────────────

    getLevelResults: function () {
      var total = this.processedCount;
      var accuracy = total > 0 ? this.correctCount / total : 0;

      var grade, stars;
      if (accuracy >= 1.0) { grade = 'S'; stars = 3; }
      else if (accuracy >= 0.9) { grade = 'A'; stars = 3; }
      else if (accuracy >= 0.75) { grade = 'B'; stars = 2; }
      else if (accuracy >= 0.6) { grade = 'C'; stars = 1; }
      else { grade = 'F'; stars = 0; }

      // Bonuses
      var bonuses = [];
      var bonusScore = 0;

      // Time bonus
      if (this.timeLeft > 0) {
        var timeBonus = this.timeLeft * 2;
        bonuses.push({ name: '剩余时间奖励', value: timeBonus });
        bonusScore += timeBonus;
      }

      // Perfect accuracy bonus
      if (accuracy >= 1.0 && total > 0) {
        bonuses.push({ name: '完美判断奖励', value: 200 });
        bonusScore += 200;
      }

      // No lives lost bonus
      if (this.lives >= 3) {
        bonuses.push({ name: '零失误奖励', value: 150 });
        bonusScore += 150;
      }

      // All doppelgangers found bonus
      if (this.doppelgangersMissed === 0 && this.doppelgangersFound > 0) {
        bonuses.push({ name: '全部分身识破奖励', value: 100 });
        bonusScore += 100;
      }

      var totalScore = this._levelScore + bonusScore;
      this.score += bonusScore;
      if (bonusScore > 0 && this.onScoreChange) {
        this.onScoreChange(this.score, bonusScore);
      }

      return {
        grade: grade,
        stars: stars,
        stats: {
          processed: this.processedCount,
          correct: this.correctCount,
          wrong: this.wrongCount,
          accuracy: Math.round(accuracy * 100),
          doppelgangersFound: this.doppelgangersFound,
          doppelgangersMissed: this.doppelgangersMissed,
          timeLeft: this.timeLeft,
          livesLeft: this.lives
        },
        bonuses: bonuses,
        totalScore: totalScore
      };
    },

    // ── Save / Load ────────────────────────────────────────────────────

    hasSave: function () {
      try {
        return !!localStorage.getItem('dd_save');
      } catch (e) {
        return false;
      }
    },

    saveProgress: function () {
      try {
        var data = {
          levelNum: this.levelNum,
          score: this.score,
          lives: this.lives
        };
        localStorage.setItem('dd_save', JSON.stringify(data));
      } catch (e) {
        // localStorage unavailable
      }
    },

    loadProgress: function () {
      try {
        var raw = localStorage.getItem('dd_save');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    // ── Generate Visitor ───────────────────────────────────────────────

    _generateVisitor: function (isDoppelganger) {
      var apt = pick(D.APARTMENTS);
      var gender = Math.random() < 0.5 ? 'male' : 'female';
      var namePool = gender === 'male' ? D.NAMES_MALE : D.NAMES_FEMALE;
      var lastName = pick(D.LAST_NAMES);
      var firstName = pick(namePool);
      var fullName = lastName + firstName;

      var occ = pick(D.OCCUPATIONS);
      var visitReason = pick(D.VISIT_REASONS);

      var appearance = {
        hair: pick(D.HAIR_COLORS),
        eyes: pick(D.EYE_COLORS),
        height: pick(D.HEIGHTS),
        build: pick(D.BUILDS),
        feature: pick(D.FEATURES)
      };

      var visitor = {
        name: fullName,
        gender: gender,
        appearance: appearance,
        isDoppelganger: isDoppelganger,
        targetApt: apt.id,
        targetResident: apt.residentName,
        reason: visitReason.reason,
        occupation: occ.name,
        workplace: occ.workplace,
        behavior: 'normal',
        documents: [],
        flaws: [],
        greetingType: 'normal'
      };

      // Generate documents
      this._generateDocuments(visitor);

      // Generate flaws for doppelgangers
      if (isDoppelganger) {
        this._generateFlaws(visitor);
      }

      return visitor;
    },

    // ── Generate Documents ─────────────────────────────────────────────

    _generateDocuments: function (visitor) {
      // Always generate an ID card
      var idCard = {
        type: 'id_card',
        fields: {
          name: visitor.name,
          photo: {
            hair: visitor.appearance.hair,
            eyes: visitor.appearance.eyes,
            feature: visitor.appearance.feature
          },
          apartment: visitor.targetApt,
          height: visitor.appearance.height,
          occupation: visitor.occupation,
          issueDate: randomDate(1950, 1954),
          expiryDate: randomDate(1956, 1960),
          stamp: true,
          serialNumber: randomSerial()
        },
        flaws: []
      };
      visitor.documents.push(idCard);

      // Generate additional docs based on level requirements and visit reason
      if (!this.level) return;

      var requiredDocs = this.level.requiredDocs;
      var visitReason = D.VISIT_REASONS.filter(function (r) { return r.reason === visitor.reason; })[0];
      var neededDocType = visitReason ? visitReason.needsDoc : 'visitor_pass';

      // Add the doc type needed for this visit reason if the level requires it
      if (requiredDocs.indexOf(neededDocType) !== -1 && neededDocType !== 'id_card') {
        var extraDoc = {
          type: neededDocType,
          fields: {
            name: visitor.name,
            photo: {
              hair: visitor.appearance.hair,
              eyes: visitor.appearance.eyes,
              feature: visitor.appearance.feature
            },
            apartment: visitor.targetApt,
            height: visitor.appearance.height,
            occupation: visitor.occupation,
            issueDate: randomDate(1954, 1955),
            expiryDate: randomDate(1956, 1958),
            stamp: true,
            serialNumber: randomSerial()
          },
          flaws: []
        };
        visitor.documents.push(extraDoc);
      }
    },

    // ── Generate Flaws ─────────────────────────────────────────────────

    _generateFlaws: function (visitor) {
      if (!this.level) return;

      var flawCount = this.level.flawCount;
      var allFlawKeys = Object.keys(D.FLAW_TYPES);
      var selectedKeys = pickN(allFlawKeys, flawCount);

      for (var i = 0; i < selectedKeys.length; i++) {
        var flawType = D.FLAW_TYPES[selectedKeys[i]];
        visitor.flaws.push(flawType);

        this._applyFlaw(visitor, selectedKeys[i]);
      }
    },

    _applyFlaw: function (visitor, flawKey) {
      var doc = visitor.documents[0]; // primary ID card

      switch (flawKey) {
        case 'NAME_WRONG':
          if (doc) {
            doc.fields.name = replaceOneChar(visitor.name);
            doc.flaws.push(D.FLAW_TYPES.NAME_WRONG);
          }
          break;

        case 'PHOTO_WRONG':
          if (doc) {
            // Change hair or eye color in document photo
            if (Math.random() < 0.5) {
              doc.fields.photo.hair = pickDifferent(D.HAIR_COLORS, visitor.appearance.hair);
            } else {
              doc.fields.photo.eyes = pickDifferent(D.EYE_COLORS, visitor.appearance.eyes);
            }
            doc.flaws.push(D.FLAW_TYPES.PHOTO_WRONG);
          }
          break;

        case 'APT_WRONG':
          if (doc) {
            doc.fields.apartment = pickDifferentApt(visitor.targetApt);
            doc.flaws.push(D.FLAW_TYPES.APT_WRONG);
          }
          break;

        case 'DOC_EXPIRED':
          if (doc) {
            doc.fields.expiryDate = randomDate(1950, 1954);
            doc.flaws.push(D.FLAW_TYPES.DOC_EXPIRED);
          }
          // Also expire secondary docs
          for (var i = 1; i < visitor.documents.length; i++) {
            visitor.documents[i].fields.expiryDate = randomDate(1950, 1954);
            visitor.documents[i].flaws.push(D.FLAW_TYPES.DOC_EXPIRED);
          }
          break;

        case 'STAMP_MISSING':
          if (doc) {
            doc.fields.stamp = false;
            doc.flaws.push(D.FLAW_TYPES.STAMP_MISSING);
          }
          break;

        case 'HEIGHT_WRONG':
          if (doc) {
            doc.fields.height = pickDifferent(D.HEIGHTS, visitor.appearance.height);
            doc.flaws.push(D.FLAW_TYPES.HEIGHT_WRONG);
          }
          break;

        case 'BEHAVIOR_NERVOUS':
          visitor.behavior = 'nervous';
          visitor.greetingType = 'nervous';
          break;

        case 'STORY_INCONSISTENT':
          // Handled in askQuestion — doppelganger templates used
          break;
      }
    }
  };

  window.GameCore = GC;
})();
