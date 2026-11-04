/**
 * ============================================================================
 * MINDVAULT — YOUR SECOND BRAIN
 * Master JavaScript Application Logic
 * ============================================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
   * 1. CONSTANTS, STORAGE KEYS & DEFAULT SCHEMAS
   * -------------------------------------------------------------------------- */
  const STORAGE_KEYS = {
    SETTINGS: 'mindvault_settings_v1',
    NOTES: 'mindvault_notes_v1',
    TASKS: 'mindvault_tasks_v1',
    JOURNAL: 'mindvault_journal_v1',
    FOCUS_SESSIONS: 'mindvault_focus_sessions_v1',
    CATEGORIES: 'mindvault_categories_v1',
    ONBOARDED: 'mindvault_has_onboarded_v1'
  };

  const DEFAULT_SETTINGS = {
    theme: 'dark',
    accent: 'violet',
    density: 'comfortable',
    userName: 'Explorer',
    startSection: 'dashboard',
    dailyTarget: 5,
    focusDur: 25,
    shortBreakDur: 5,
    longBreakDur: 15
  };

  const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Study', 'Ideas', 'Projects', 'Important'];

  const JOURNAL_PROMPTS = [
    "What was a small victory you experienced today?",
    "What problem did you solve, or what did you learn today?",
    "What is one thing you can let go of to feel lighter?",
    "Who is someone you are deeply grateful for, and why?",
    "What is an idea that excited you recently?",
    "If you could redo one moment from today, what would it be?",
    "What did your energy levels feel like, and why?",
    "What is the single most important task for tomorrow?",
    "What book, quote, or insight inspired you this week?",
    "Describe a moment today when you felt genuinely present."
  ];

  const MOTIVATIONAL_QUOTES = [
    { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
    { text: "Focus is a muscle. The more you practice, the easier it gets.", author: "Cal Newport" },
    { text: "Knowledge is of no value unless you put it into practice.", author: "Anton Chekhov" },
    { text: "Simplicity is the prerequisite for reliability.", author: "Edsger W. Dijkstra" },
    { text: "Action produces information. Don't wait for total clarity.", author: "James Clear" },
    { text: "A system is only as good as your trust in it.", author: "Tiago Forte" }
  ];

  /* --------------------------------------------------------------------------
   * 2. CENTRAL STORE & LOCAL STORAGE MANAGER
   * -------------------------------------------------------------------------- */
  const Store = {
    subscribers: [],

    subscribe(fn) {
      if (typeof fn === 'function') this.subscribers.push(fn);
    },

    notify(event, data) {
      this.subscribers.forEach(fn => {
        try { fn(event, data); } catch (e) { console.error('Store subscriber error:', e); }
      });
      UI.updateStorageIndicator();
    },

    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        console.warn(`Failed reading key ${key} from localStorage:`, e);
        return fallback;
      }
    },

    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (e) {
        console.error(`Failed writing key ${key} to localStorage:`, e);
        Toast.show('Storage full or unavailable!', 'error');
        return false;
      }
    },

    getSettings() {
      const saved = this.get(STORAGE_KEYS.SETTINGS, {});
      return Object.assign({}, DEFAULT_SETTINGS, saved);
    },

    saveSettings(settings) {
      this.set(STORAGE_KEYS.SETTINGS, settings);
      this.notify('settings_updated', settings);
    },

    getCategories() {
      const cats = this.get(STORAGE_KEYS.CATEGORIES, null);
      if (!cats || !Array.isArray(cats) || cats.length === 0) {
        this.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES.slice();
      }
      return cats;
    },

    saveCategories(categories) {
      this.set(STORAGE_KEYS.CATEGORIES, categories);
      this.notify('categories_updated', categories);
    },

    getNotes() {
      return this.get(STORAGE_KEYS.NOTES, []) || [];
    },

    saveNotes(notes) {
      this.set(STORAGE_KEYS.NOTES, notes);
      this.notify('notes_updated', notes);
    },

    getTasks() {
      return this.get(STORAGE_KEYS.TASKS, []) || [];
    },

    saveTasks(tasks) {
      this.set(STORAGE_KEYS.TASKS, tasks);
      this.notify('tasks_updated', tasks);
    },

    getJournal() {
      return this.get(STORAGE_KEYS.JOURNAL, {}) || {};
    },

    saveJournal(journal) {
      this.set(STORAGE_KEYS.JOURNAL, journal);
      this.notify('journal_updated', journal);
    },

    getFocusSessions() {
      return this.get(STORAGE_KEYS.FOCUS_SESSIONS, []) || [];
    },

    saveFocusSessions(sessions) {
      this.set(STORAGE_KEYS.FOCUS_SESSIONS, sessions);
      this.notify('focus_updated', sessions);
    },

    calculateStorageBytes() {
      let total = 0;
      for (const k in STORAGE_KEYS) {
        const val = localStorage.getItem(STORAGE_KEYS[k]);
        if (val) total += (val.length + STORAGE_KEYS[k].length) * 2; // rough UTF-16 byte estimation
      }
      return total;
    },

    seedSampleData() {
      const now = Date.now();
      const oneHour = 3600 * 1000;
      const oneDay = 24 * 3600 * 1000;
      const todayStr = getTodayISO();
      const yesterdayStr = getDateOffsetISO(-1);

      const sampleNotes = [
        {
          id: 'note_' + (now - 5000),
          title: 'Second Brain & Knowledge Architecture',
          content: '<h2>Building a Personal Second Brain</h2><p>The goal is not to hoard information, but to build a reliable thinking system.</p><blockquote>"Knowledge becomes valuable only when it is transformed into action and synthesis."</blockquote><p>Core habits to cultivate:</p><ul><li><strong>Capture:</strong> Keep a low-friction inbox for raw thoughts.</li><li><strong>Organize:</strong> Structure by Actionability (Projects, Areas, Resources, Archives).</li><li><strong>Distill:</strong> Extract the progressive essence of notes.</li><li><strong>Express:</strong> Share, write, code, or produce real outcomes.</li></ul>',
          category: 'Ideas',
          tags: ['pkm', 'productivity', 'systems'],
          color: 'violet',
          isPinned: true,
          isFavorite: true,
          isArchived: false,
          isTrashed: false,
          createdAt: now - oneDay * 2,
          updatedAt: now - oneHour * 2
        },
        {
          id: 'note_' + (now - 4000),
          title: 'MindVault System Architecture & Roadmap',
          content: '<h2>Core Capabilities</h2><p>MindVault combines notes, task prioritization, deep work timer sprints, and mindful journaling into a unified command center.</p><h3>Key Milestones:</h3><ol><li>Local storage synchronization with zero server overhead.</li><li>Synthesized ambient audio synthesis (Web Audio API).</li><li>Comprehensive search and instant command palette.</li><li>Complete data backup export and schema restore.</li></ol>',
          category: 'Projects',
          tags: ['architecture', 'javascript', 'frontend'],
          color: 'blue',
          isPinned: false,
          isFavorite: true,
          isArchived: false,
          isTrashed: false,
          createdAt: now - oneDay * 3,
          updatedAt: now - oneHour * 4
        },
        {
          id: 'note_' + (now - 3000),
          title: 'Deep Work: Rules for Focused Success',
          content: '<h2>Principles of Deep Work</h2><p>Notes from Cal Newport’s philosophy on high-value cognitive performance:</p><ul><li>Work deeply: carve out 90-minute blocks devoid of internet distractions.</li><li>Embrace boredom: resist reaching for quick dopamine whenever waiting.</li><li>Quit shallow multitasking: batch email and administrative tasks.</li><li>Drain the shallows: measure output by quality of deep focus hours.</li></ul>',
          category: 'Study',
          tags: ['focus', 'books', 'habits'],
          color: 'mint',
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          isTrashed: false,
          createdAt: now - oneDay * 4,
          updatedAt: now - oneDay
        },
        {
          id: 'note_' + (now - 2000),
          title: 'Weekly Synthesis & Planning Routine',
          content: '<h2>Friday Review Checklist</h2><p>Every week, review open loops to enter the weekend clear-headed:</p><ul><li>Clear desktop and downloads folder.</li><li>Review completed tasks and celebrate small wins.</li><li>Look ahead 7 days on the calendar.</li><li>Identify the Top 3 Non-Negotiable Priorities for next week.</li></ul>',
          category: 'Personal',
          tags: ['routine', 'planning'],
          color: 'amber',
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          isTrashed: false,
          createdAt: now - oneDay * 5,
          updatedAt: now - oneDay * 2
        }
      ];

      const sampleTasks = [
        {
          id: 'task_' + (now - 1000),
          title: 'Finalize quarterly project milestones',
          description: 'Review architecture docs and team capacity.',
          dueDate: todayStr,
          priority: 'high',
          category: 'Work',
          isCompleted: false,
          completedAt: null,
          createdAt: now - oneDay,
          isTrashed: false
        },
        {
          id: 'task_' + (now - 900),
          title: 'Complete 25-minute Pomodoro deep focus session',
          description: 'Draft the core proposal without checking email.',
          dueDate: todayStr,
          priority: 'medium',
          category: 'Projects',
          isCompleted: true,
          completedAt: now - oneHour,
          createdAt: now - oneDay,
          isTrashed: false
        },
        {
          id: 'task_' + (now - 800),
          title: 'Review weekly budget and subscriptions',
          description: 'Check bank feed and allocate savings.',
          dueDate: getDateOffsetISO(2),
          priority: 'low',
          category: 'Personal',
          isCompleted: false,
          completedAt: null,
          createdAt: now - oneDay * 2,
          isTrashed: false
        },
        {
          id: 'task_' + (now - 700),
          title: 'Read chapter 4 of Designing Data-Intensive Apps',
          description: 'Take notes in MindVault under Study.',
          dueDate: getDateOffsetISO(1),
          priority: 'medium',
          category: 'Study',
          isCompleted: false,
          completedAt: null,
          createdAt: now - oneDay * 2,
          isTrashed: false
        },
        {
          id: 'task_' + (now - 600),
          title: 'Draft MindVault user walkthrough documentation',
          description: 'Document keyboard shortcuts and backup instructions.',
          dueDate: todayStr,
          priority: 'high',
          category: 'Work',
          isCompleted: true,
          completedAt: now - oneHour * 3,
          createdAt: now - oneDay * 3,
          isTrashed: false
        }
      ];

      const sampleJournal = {};
      sampleJournal[todayStr] = {
        date: todayStr,
        mood: 'great',
        gratitude: [
          'Clarity on long-term personal goals',
          'A quiet morning cup of black coffee',
          'MindVault workspace running smoothly and locally'
        ],
        content: "Woke up with high energy today. Managed to knock out the hardest priority first thing in the morning. Deep work without notifications feels like a superpower.",
        highlights: "Completed the core proposal and logged 50 minutes of deep focus.",
        improvements: "Take a 10-minute walk outside after lunch instead of scrolling.",
        updatedAt: now
      };
      sampleJournal[yesterdayStr] = {
        date: yesterdayStr,
        mood: 'good',
        gratitude: [
          'Constructive feedback from colleagues',
          'Good sleep and evening workout',
          'Interesting research paper on cognitive load'
        ],
        content: "Productive day overall. Spent good time outlining the technical specifications.",
        highlights: "Closed out all overdue tasks.",
        improvements: "Go to bed 30 minutes earlier.",
        updatedAt: now - oneDay
      };

      const sampleFocusSessions = [
        { id: 'foc_' + (now - 50000), type: 'focus', durationMinutes: 25, completedAt: now - oneHour * 3 },
        { id: 'foc_' + (now - 40000), type: 'focus', durationMinutes: 25, completedAt: now - oneHour * 1 },
        { id: 'foc_' + (now - 30000), type: 'focus', durationMinutes: 25, completedAt: now - oneDay * 1 },
        { id: 'foc_' + (now - 20000), type: 'focus', durationMinutes: 15, completedAt: now - oneDay * 2 }
      ];

      this.saveNotes(sampleNotes);
      this.saveTasks(sampleTasks);
      this.saveJournal(sampleJournal);
      this.saveFocusSessions(sampleFocusSessions);
      this.set(STORAGE_KEYS.ONBOARDED, true);
    },

    purgeAll() {
      localStorage.clear();
      this.set(STORAGE_KEYS.ONBOARDED, true);
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      this.set(STORAGE_KEYS.NOTES, []);
      this.set(STORAGE_KEYS.TASKS, []);
      this.set(STORAGE_KEYS.JOURNAL, {});
      this.set(STORAGE_KEYS.FOCUS_SESSIONS, []);
      this.notify('all_purged');
    }
  };

  /* --------------------------------------------------------------------------
   * 3. WEB AUDIO API SYNTHESIZER (ZERO-ASSET SOUND GENERATOR)
   * -------------------------------------------------------------------------- */
  const AudioEngine = {
    ctx: null,
    ambientGain: null,
    ambientNode: null,
    currentAmbientType: 'off',

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.ambientGain = this.ctx.createGain();
          this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          this.ambientGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playChime() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major chord harmonics
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 2.0);
        });
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    },

    setAmbientVolume(vol) {
      if (this.ambientGain && this.ctx) {
        const v = Math.max(0, Math.min(1, parseFloat(vol) || 0.3));
        this.ambientGain.gain.setValueAtTime(v, this.ctx.currentTime);
      }
    },

    stopAmbient() {
      if (this.ambientNode) {
        try {
          if (this.ambientNode.stop) this.ambientNode.stop();
          if (this.ambientNode.disconnect) this.ambientNode.disconnect();
        } catch (e) {}
        this.ambientNode = null;
      }
      this.currentAmbientType = 'off';
    },

    playAmbient(type) {
      this.initContext();
      if (!this.ctx) return;
      this.stopAmbient();
      if (type === 'off') return;

      this.currentAmbientType = type;

      if (type === 'whitenoise' || type === 'rain') {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Pink noise approximation for gentle rainfall
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          } else {
            output[i] = white * 0.12;
          }
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);
        whiteNoise.start();
        this.ambientNode = whiteNoise;

      } else if (type === 'drone') {
        // Warm meditative dual oscillator drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
        osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(this.ambientGain);
        osc1.start();
        osc2.start();
        this.ambientNode = {
          stop: () => {
            try { osc1.stop(); osc2.stop(); } catch (e) {}
          },
          disconnect: () => {
            try { filter.disconnect(); } catch (e) {}
          }
        };

      } else if (type === 'binaural') {
        // Binaural focus wave (200Hz base with 10Hz alpha difference)
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.setValueAtTime(200, this.ctx.currentTime);
        oscR.frequency.setValueAtTime(210, this.ctx.currentTime);

        const merger = this.ctx.createChannelMerger(2);
        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(this.ambientGain);
        oscL.start();
        oscR.start();

        this.ambientNode = {
          stop: () => {
            try { oscL.stop(); oscR.stop(); } catch (e) {}
          },
          disconnect: () => {
            try { merger.disconnect(); } catch (e) {}
          }
        };
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 4. POMODORO TIMER ENGINE (TIMESTAMP-DIFFERENTIAL ACCURACY)
   * -------------------------------------------------------------------------- */
  const TimerEngine = {
    mode: 'focus', // 'focus', 'shortBreak', 'longBreak', 'custom'
    durationMinutes: 25,
    remainingSeconds: 25 * 60,
    targetTimestamp: null,
    isRunning: false,
    timerInterval: null,
    linkedTaskId: null,

    init() {
      const settings = Store.getSettings();
      this.durationMinutes = settings.focusDur || 25;
      this.remainingSeconds = this.durationMinutes * 60;
      this.updateDisplay();
    },

    setMode(mode, customMinutes = null) {
      this.pause();
      this.mode = mode;
      const settings = Store.getSettings();

      if (mode === 'focus') {
        this.durationMinutes = settings.focusDur || 25;
      } else if (mode === 'shortBreak') {
        this.durationMinutes = settings.shortBreakDur || 5;
      } else if (mode === 'longBreak') {
        this.durationMinutes = settings.longBreakDur || 15;
      } else if (mode === 'custom') {
        this.durationMinutes = Math.max(1, Math.min(120, customMinutes || 45));
      }

      this.remainingSeconds = this.durationMinutes * 60;
      this.updateDisplay();
    },

    toggle() {
      if (this.isRunning) {
        this.pause();
      } else {
        this.start();
      }
    },

    start() {
      if (this.isRunning) return;
      AudioEngine.initContext();
      this.isRunning = true;
      this.targetTimestamp = Date.now() + this.remainingSeconds * 1000;

      this.timerInterval = setInterval(() => {
        this.tick();
      }, 250);

      this.updatePlayStateUI();
    },

    pause() {
      if (!this.isRunning) return;
      this.isRunning = false;
      if (this.targetTimestamp) {
        this.remainingSeconds = Math.max(0, Math.round((this.targetTimestamp - Date.now()) / 1000));
      }
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.updatePlayStateUI();
    },

    reset() {
      this.pause();
      this.remainingSeconds = this.durationMinutes * 60;
      this.updateDisplay();
    },

    skip() {
      this.pause();
      if (this.mode === 'focus') {
        this.setMode('shortBreak');
        Toast.show('Focus finished! Time for a short break.', 'info');
      } else {
        this.setMode('focus');
        Toast.show('Break over! Ready for deep work.', 'info');
      }
    },

    tick() {
      if (!this.isRunning) return;
      const now = Date.now();
      const diff = Math.max(0, Math.round((this.targetTimestamp - now) / 1000));
      this.remainingSeconds = diff;
      this.updateDisplay();

      if (diff <= 0) {
        this.onComplete();
      }
    },

    onComplete() {
      this.pause();
      AudioEngine.playChime();

      // Log completed session if it was focus
      if (this.mode === 'focus' || (this.mode === 'custom' && this.durationMinutes >= 10)) {
        const session = {
          id: 'foc_' + Date.now(),
          type: this.mode,
          durationMinutes: this.durationMinutes,
          completedAt: Date.now(),
          taskId: this.linkedTaskId || null
        };
        const sessions = Store.getFocusSessions();
        sessions.unshift(session);
        Store.saveFocusSessions(sessions);
        Toast.show(`Focus session completed! (+${this.durationMinutes}m focus logged)`, 'success');
      } else {
        Toast.show('Break session finished!', 'info');
      }

      // Browser Notification if supported and granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("MindVault — Session Completed", {
          body: `${this.mode === 'focus' ? 'Great focus work!' : 'Break complete.'} Ready for the next sprint?`,
          icon: ""
        });
      }

      this.reset();
    },

    updateDisplay() {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      const str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Studio centerpiece digits
      const digitsEl = document.getElementById('focus-digits');
      if (digitsEl) digitsEl.textContent = str;

      // Dashboard focus timer
      const dashTimerEl = document.getElementById('dash-focus-timer');
      if (dashTimerEl) dashTimerEl.textContent = str;

      // Topbar focus text & chip visibility
      const topbarChip = document.getElementById('topbar-focus-chip');
      const topbarText = document.getElementById('topbar-focus-text');
      const sidebarPulse = document.getElementById('sidebar-focus-pulse');
      if (topbarChip && topbarText) {
        topbarText.textContent = str;
        topbarChip.style.display = this.isRunning ? 'inline-flex' : 'none';
      }
      if (sidebarPulse) {
        sidebarPulse.style.display = this.isRunning ? 'inline-block' : 'none';
      }

      // Context panel mini timer
      const ctxTimer = document.getElementById('context-focus-timer');
      const ctxDot = document.getElementById('context-focus-dot');
      if (ctxTimer) ctxTimer.textContent = str;
      if (ctxDot) {
        ctxDot.style.background = this.isRunning ? 'var(--color-emerald)' : 'var(--text-muted)';
      }

      // SVG circle stroke-dashoffset
      const circleEl = document.getElementById('focus-circle-progress');
      if (circleEl) {
        const totalSec = this.durationMinutes * 60;
        const radius = parseFloat(circleEl.getAttribute('r')) || 145;
        const circumference = 2 * Math.PI * radius;
        const progress = (totalSec - this.remainingSeconds) / totalSec;
        const offset = circumference * (1 - progress);
        circleEl.style.strokeDasharray = circumference;
        circleEl.style.strokeDashoffset = offset;
      }

      // Document title update when running
      if (this.isRunning) {
        document.title = `(${str}) MindVault Focus`;
      } else {
        document.title = `MindVault — Your Second Brain`;
      }
    },

    updatePlayStateUI() {
      const playIcon = document.getElementById('focus-btn-icon-play');
      const pauseIcon = document.getElementById('focus-btn-icon-pause');
      const label = document.getElementById('focus-toggle-label');
      const caption = document.getElementById('focus-status-caption');
      const dashActionBtn = document.getElementById('dash-focus-action-btn');

      if (this.isRunning) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
        if (label) label.textContent = 'Pause';
        if (caption) caption.textContent = 'Sprint in progress — stay focused';
        if (dashActionBtn) dashActionBtn.querySelector('span').textContent = 'Pause Focus';
      } else {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (label) label.textContent = this.remainingSeconds < this.durationMinutes * 60 ? 'Resume Focus' : 'Start Focus';
        if (caption) caption.textContent = 'Ready to concentrate';
        if (dashActionBtn) dashActionBtn.querySelector('span').textContent = 'Start Deep Focus';
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 5. NOTES ENGINE & WYSIWYG EDITOR
   * -------------------------------------------------------------------------- */
  const NotesEngine = {
    currentNoteId: null,
    autosaveTimer: null,
    searchQuery: '',
    selectedCategory: 'all',
    selectedTag: null,
    sortMode: 'updated-desc',
    layoutMode: 'grid', // 'grid' | 'list'

    init() {
      this.bindEditorEvents();
      this.renderNotesView();
    },

    bindEditorEvents() {
      const titleInput = document.getElementById('editor-title-input');
      const contentBody = document.getElementById('editor-content-body');
      const catSelect = document.getElementById('editor-category-select');
      const addTagInput = document.getElementById('editor-add-tag-input');

      if (titleInput) {
        titleInput.addEventListener('input', () => this.queueAutosave());
      }
      if (contentBody) {
        contentBody.addEventListener('input', () => {
          this.updateWordAndCharCount();
          this.queueAutosave();
        });
      }
      if (catSelect) {
        catSelect.addEventListener('change', () => this.queueAutosave());
      }
      if (addTagInput) {
        addTagInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const tag = addTagInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (tag) {
              this.addTagToCurrentNote(tag);
              addTagInput.value = '';
            }
          }
        });
      }

      // Formatting Toolbar actions
      const toolbar = document.getElementById('editor-toolbar');
      if (toolbar) {
        toolbar.querySelectorAll('.toolbar-btn[data-command]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cmd = btn.dataset.command;
            const val = btn.dataset.val || null;
            document.execCommand(cmd, false, val);
            if (contentBody) contentBody.focus();
            this.queueAutosave();
          });
        });
      }

      // Link prompt button
      const linkBtn = document.getElementById('editor-link-btn');
      if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const url = prompt('Enter link URL (e.g. https://example.com):');
          if (url) {
            document.execCommand('createLink', false, url);
            this.queueAutosave();
          }
        });
      }

      // Color picker popover
      const colorBtn = document.getElementById('editor-color-btn');
      const colorPalette = document.getElementById('editor-color-palette');
      if (colorBtn && colorPalette) {
        colorBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          colorPalette.classList.toggle('active');
        });
        colorPalette.querySelectorAll('.color-swatch-btn').forEach(swatch => {
          swatch.addEventListener('click', () => {
            const color = swatch.dataset.color;
            this.setCurrentNoteColor(color);
            colorPalette.classList.remove('active');
          });
        });
      }

      // Pin toggle
      const pinBtn = document.getElementById('editor-pin-btn');
      if (pinBtn) {
        pinBtn.addEventListener('click', () => {
          this.toggleCurrentNotePin();
        });
      }

      // Favorite toggle
      const favBtn = document.getElementById('editor-favorite-btn');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          this.toggleCurrentNoteFavorite();
        });
      }

      // More menu toggle
      const moreBtn = document.getElementById('editor-more-btn');
      const moreMenu = document.getElementById('editor-more-menu');
      if (moreBtn && moreMenu) {
        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          moreMenu.classList.toggle('active');
        });
      }

      // Duplicate, Archive, Export MD, Delete
      document.getElementById('editor-duplicate-btn')?.addEventListener('click', () => {
        moreMenu?.classList.remove('active');
        this.duplicateCurrentNote();
      });
      document.getElementById('editor-archive-btn')?.addEventListener('click', () => {
        moreMenu?.classList.remove('active');
        this.toggleCurrentNoteArchive();
      });
      document.getElementById('editor-export-md-btn')?.addEventListener('click', () => {
        moreMenu?.classList.remove('active');
        this.exportCurrentNoteMarkdown();
      });
      document.getElementById('editor-trash-btn')?.addEventListener('click', () => {
        moreMenu?.classList.remove('active');
        this.trashCurrentNote();
      });

      // Back button
      document.getElementById('editor-back-btn')?.addEventListener('click', () => {
        this.saveNow();
        UI.switchSection('notes');
      });

      // Close popovers on body click
      document.addEventListener('click', () => {
        colorPalette?.classList.remove('active');
        moreMenu?.classList.remove('active');
      });
    },

    createNewNote(initialTitle = '', initialContent = '', initialCategory = null) {
      const now = Date.now();
      const settings = Store.getSettings();
      const cats = Store.getCategories();
      const category = initialCategory || settings.defaultCategory || cats[0] || 'Personal';

      const newNote = {
        id: 'note_' + now + '_' + Math.random().toString(36).substring(2, 7),
        title: initialTitle.trim() || 'Untitled Note',
        content: initialContent || '<p></p>',
        category: category,
        tags: [],
        color: 'none',
        isPinned: false,
        isFavorite: false,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now
      };

      const notes = Store.getNotes();
      notes.unshift(newNote);
      Store.saveNotes(notes);

      this.openNoteEditor(newNote.id);
      Toast.show('New note created', 'success');
      return newNote;
    },

    openNoteEditor(noteId) {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === noteId);
      if (!note) {
        Toast.show('Note not found!', 'error');
        return;
      }

      this.currentNoteId = note.id;

      // Populate form
      const titleInput = document.getElementById('editor-title-input');
      const contentBody = document.getElementById('editor-content-body');
      const catSelect = document.getElementById('editor-category-select');
      const colorDot = document.getElementById('editor-current-color-dot');
      const pinBtn = document.getElementById('editor-pin-btn');
      const favBtn = document.getElementById('editor-favorite-btn');

      if (titleInput) titleInput.value = note.title === 'Untitled Note' ? '' : note.title;
      if (contentBody) contentBody.innerHTML = note.content || '';

      // Populate categories in editor dropdown
      if (catSelect) {
        const cats = Store.getCategories();
        catSelect.innerHTML = cats.map(c => `<option value="${escapeHTML(c)}" ${c === note.category ? 'selected' : ''}>${escapeHTML(c)}</option>`).join('');
      }

      // Update color dot
      if (colorDot) {
        colorDot.className = 'color-dot ' + (note.color || 'default');
      }

      // Update pin & fav buttons
      pinBtn?.classList.toggle('active', !!note.isPinned);
      favBtn?.classList.toggle('active', !!note.isFavorite);

      this.renderEditorTags(note.tags || []);
      this.updateWordAndCharCount();
      this.updateSaveStatus('All changes saved');

      UI.switchSection('note-editor');
      if (titleInput && !note.title) {
        titleInput.focus();
      }
    },

    renderEditorTags(tags) {
      const container = document.getElementById('editor-tags-list');
      if (!container) return;
      container.innerHTML = tags.map(tag => `
        <span class="editor-tag-chip">
          #${escapeHTML(tag)}
          <span class="editor-tag-remove" data-tag="${escapeHTML(tag)}">&times;</span>
        </span>
      `).join('');

      container.querySelectorAll('.editor-tag-remove').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const t = el.dataset.tag;
          this.removeTagFromCurrentNote(t);
        });
      });
    },

    addTagToCurrentNote(tag) {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        if (!note.tags) note.tags = [];
        if (!note.tags.includes(tag)) {
          note.tags.push(tag);
          note.updatedAt = Date.now();
          Store.saveNotes(notes);
          this.renderEditorTags(note.tags);
          this.renderNotesView();
        }
      }
    },

    removeTagFromCurrentNote(tag) {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note && note.tags) {
        note.tags = note.tags.filter(t => t !== tag);
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        this.renderEditorTags(note.tags);
        this.renderNotesView();
      }
    },

    setCurrentNoteColor(color) {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        note.color = color;
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        const colorDot = document.getElementById('editor-current-color-dot');
        if (colorDot) colorDot.className = 'color-dot ' + color;
        this.renderNotesView();
      }
    },

    toggleCurrentNotePin() {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        note.isPinned = !note.isPinned;
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        document.getElementById('editor-pin-btn')?.classList.toggle('active', note.isPinned);
        Toast.show(note.isPinned ? 'Note pinned to top' : 'Note unpinned', 'info');
        this.renderNotesView();
      }
    },

    toggleCurrentNoteFavorite() {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        note.isFavorite = !note.isFavorite;
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        document.getElementById('editor-favorite-btn')?.classList.toggle('active', note.isFavorite);
        Toast.show(note.isFavorite ? 'Added to Favorites' : 'Removed from Favorites', 'info');
        this.renderNotesView();
      }
    },

    toggleCurrentNoteArchive() {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        note.isArchived = !note.isArchived;
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        Toast.show(note.isArchived ? 'Note moved to Archive' : 'Note restored from Archive', 'info');
        UI.switchSection('notes');
      }
    },

    trashCurrentNote() {
      if (!this.currentNoteId) return;
      ConfirmModal.show(
        'Move to Trash?',
        'This note will be moved to the Trash bin where you can restore it or permanently delete it.',
        () => {
          const notes = Store.getNotes();
          const note = notes.find(n => n.id === this.currentNoteId);
          if (note) {
            note.isTrashed = true;
            note.updatedAt = Date.now();
            Store.saveNotes(notes);
            Toast.show('Note moved to Trash', 'info');
            UI.switchSection('notes');
          }
        }
      );
    },

    duplicateCurrentNote() {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        const copy = Object.assign({}, note, {
          id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title: note.title + ' (Copy)',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        notes.unshift(copy);
        Store.saveNotes(notes);
        Toast.show('Note duplicated', 'success');
        this.openNoteEditor(copy.id);
      }
    },

    exportCurrentNoteMarkdown() {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (note) {
        const md = htmlToMarkdown(note.content);
        const header = `# ${note.title}\nCategory: ${note.category}\nTags: ${note.tags.join(', ')}\nDate: ${new Date(note.createdAt).toLocaleString()}\n\n---\n\n`;
        downloadFile(`${slugify(note.title || 'note')}.md`, header + md, 'text/markdown');
        Toast.show('Exported note as Markdown', 'success');
      }
    },

    queueAutosave() {
      this.updateSaveStatus('Saving...', true);
      clearTimeout(this.autosaveTimer);
      this.autosaveTimer = setTimeout(() => {
        this.saveNow();
      }, 600);
    },

    saveNow() {
      if (!this.currentNoteId) return;
      const titleInput = document.getElementById('editor-title-input');
      const contentBody = document.getElementById('editor-content-body');
      const catSelect = document.getElementById('editor-category-select');

      const notes = Store.getNotes();
      const note = notes.find(n => n.id === this.currentNoteId);
      if (!note) return;

      const newTitle = titleInput ? titleInput.value.trim() : '';
      note.title = newTitle || 'Untitled Note';
      note.content = contentBody ? contentBody.innerHTML : '';
      if (catSelect) note.category = catSelect.value;
      note.updatedAt = Date.now();

      Store.saveNotes(notes);
      this.updateSaveStatus('All changes saved', false);
      this.renderNotesView();
    },

    updateSaveStatus(text, isSaving = false) {
      const statusEl = document.getElementById('editor-save-status');
      if (!statusEl) return;
      const dot = statusEl.querySelector('.status-indicator-dot');
      const label = statusEl.querySelector('.status-indicator-text');
      if (dot) dot.className = 'status-indicator-dot ' + (isSaving ? 'saving' : '');
      if (label) label.textContent = text;

      const lastSaved = document.getElementById('editor-last-saved');
      if (lastSaved && !isSaving) {
        lastSaved.textContent = 'Saved just now';
      }
    },

    updateWordAndCharCount() {
      const contentBody = document.getElementById('editor-content-body');
      const text = contentBody ? contentBody.innerText || '' : '';
      const charCount = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;

      const wEl = document.getElementById('editor-word-count');
      const cEl = document.getElementById('editor-char-count');
      if (wEl) wEl.textContent = `${words} word${words === 1 ? '' : 's'}`;
      if (cEl) cEl.textContent = `${charCount} character${charCount === 1 ? '' : 's'}`;
    },

    renderNotesView() {
      const notes = Store.getNotes();
      const activeNotes = notes.filter(n => !n.isArchived && !n.isTrashed);

      // Category filter pills
      const catContainer = document.getElementById('notes-category-pills');
      if (catContainer) {
        const cats = Store.getCategories();
        let catHtml = `<button class="cat-pill ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">All (${activeNotes.length})</button>`;
        cats.forEach(c => {
          const count = activeNotes.filter(n => n.category === c).length;
          catHtml += `<button class="cat-pill ${this.selectedCategory === c ? 'active' : ''}" data-cat="${escapeHTML(c)}">${escapeHTML(c)} (${count})</button>`;
        });
        catContainer.innerHTML = catHtml;

        catContainer.querySelectorAll('.cat-pill').forEach(btn => {
          btn.addEventListener('click', () => {
            this.selectedCategory = btn.dataset.cat;
            this.renderNotesView();
          });
        });
      }

      // Filtered notes by category, tag, search
      let filtered = activeNotes.slice();
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(n => n.category === this.selectedCategory);
      }
      if (this.selectedTag) {
        filtered = filtered.filter(n => n.tags && n.tags.includes(this.selectedTag));
      }
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        filtered = filtered.filter(n =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
        );
      }

      // Sorting
      filtered.sort((a, b) => {
        if (this.sortMode === 'updated-desc') return b.updatedAt - a.updatedAt;
        if (this.sortMode === 'created-desc') return b.createdAt - a.createdAt;
        if (this.sortMode === 'created-asc') return a.createdAt - b.createdAt;
        if (this.sortMode === 'title-asc') return (a.title || '').localeCompare(b.title || '');
        return 0;
      });

      // Tags bar in notes view
      const tagsContainer = document.getElementById('notes-tags-filter-bar');
      if (tagsContainer) {
        const allTags = new Set();
        activeNotes.forEach(n => { (n.tags || []).forEach(t => allTags.add(t)); });
        if (allTags.size > 0) {
          tagsContainer.style.display = 'flex';
          let tagsHtml = `<span class="tag-chip ${!this.selectedTag ? 'active' : ''}" data-tag="">All Tags</span>`;
          allTags.forEach(t => {
            tagsHtml += `<span class="tag-chip ${this.selectedTag === t ? 'active' : ''}" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</span>`;
          });
          tagsContainer.innerHTML = tagsHtml;
          tagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              this.selectedTag = chip.dataset.tag || null;
              this.renderNotesView();
            });
          });
        } else {
          tagsContainer.style.display = 'none';
        }
      }

      // Pinned vs Regular separation
      const pinnedGroup = document.getElementById('pinned-notes-group');
      const pinnedGrid = document.getElementById('pinned-notes-grid');
      const regularTitle = document.getElementById('regular-notes-title');
      const regularGrid = document.getElementById('notes-grid');
      const emptyState = document.getElementById('notes-empty-state');

      const pinnedNotes = filtered.filter(n => n.isPinned);
      const regularNotes = filtered.filter(n => !n.isPinned);

      if (pinnedGroup && pinnedGrid) {
        if (pinnedNotes.length > 0 && !this.searchQuery) {
          pinnedGroup.style.display = 'block';
          pinnedGrid.className = `notes-grid layout-${this.layoutMode}`;
          pinnedGrid.innerHTML = pinnedNotes.map(n => this.renderNoteCardHTML(n)).join('');
          this.attachCardClickHandlers(pinnedGrid);
        } else {
          pinnedGroup.style.display = 'none';
        }
      }

      if (regularGrid) {
        const displayList = (!this.searchQuery && pinnedNotes.length > 0) ? regularNotes : filtered;
        regularGrid.className = `notes-grid layout-${this.layoutMode}`;
        regularGrid.innerHTML = displayList.map(n => this.renderNoteCardHTML(n)).join('');
        this.attachCardClickHandlers(regularGrid);

        if (regularTitle) {
          regularTitle.style.display = (pinnedNotes.length > 0 && !this.searchQuery && regularNotes.length > 0) ? 'block' : 'none';
        }
      }

      if (emptyState) {
        emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';
      }

      // Render Favorites, Archive, Trash sections
      this.renderSpecialViews();
    },

    renderNoteCardHTML(note) {
      const snippet = stripHTML(note.content || '').substring(0, 150) || 'Empty note...';
      const timeStr = formatRelativeTime(note.updatedAt || note.createdAt);
      const tags = (note.tags || []).slice(0, 3);

      return `
        <div class="note-card ${note.isPinned ? 'pinned' : ''}" data-id="${note.id}" data-color="${note.color || 'none'}">
          <div class="note-card-header">
            <h4 class="note-card-title">${escapeHTML(note.title || 'Untitled Note')}</h4>
            <div class="note-card-actions">
              <button class="icon-btn card-fav-btn ${note.isFavorite ? 'text-amber' : ''}" title="Favorite" data-id="${note.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${note.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            </div>
          </div>
          <p class="note-card-body-snippet">${escapeHTML(snippet)}</p>
          <div class="note-card-footer">
            <div class="note-card-tags">
              <span class="note-mini-tag">${escapeHTML(note.category || 'General')}</span>
              ${tags.map(t => `<span class="note-mini-tag">#${escapeHTML(t)}</span>`).join('')}
            </div>
            <span>${timeStr}</span>
          </div>
        </div>
      `;
    },

    attachCardClickHandlers(container) {
      if (!container) return;
      container.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.card-fav-btn')) {
            e.stopPropagation();
            const id = card.dataset.id;
            this.toggleFavorite(id);
            return;
          }
          this.openNoteEditor(card.dataset.id);
        });
      });
    },

    toggleFavorite(noteId) {
      const notes = Store.getNotes();
      const note = notes.find(n => n.id === noteId);
      if (note) {
        note.isFavorite = !note.isFavorite;
        note.updatedAt = Date.now();
        Store.saveNotes(notes);
        this.renderNotesView();
      }
    },

    renderSpecialViews() {
      const allNotes = Store.getNotes();

      // Favorites View
      const favGrid = document.getElementById('favorites-notes-grid');
      const favEmpty = document.getElementById('favorites-empty-state');
      if (favGrid) {
        const favs = allNotes.filter(n => n.isFavorite && !n.isTrashed);
        favGrid.innerHTML = favs.map(n => this.renderNoteCardHTML(n)).join('');
        this.attachCardClickHandlers(favGrid);
        if (favEmpty) favEmpty.style.display = favs.length === 0 ? 'flex' : 'none';
      }

      // Archive View
      const archGrid = document.getElementById('archive-notes-grid');
      const archEmpty = document.getElementById('archive-empty-state');
      if (archGrid) {
        const archived = allNotes.filter(n => n.isArchived && !n.isTrashed);
        archGrid.innerHTML = archived.map(n => `
          <div class="note-card" data-id="${n.id}">
            <div class="note-card-header">
              <h4 class="note-card-title">${escapeHTML(n.title)}</h4>
              <button class="btn btn-secondary btn-sm unarchive-btn" data-id="${n.id}">Unarchive</button>
            </div>
            <p class="note-card-body-snippet">${escapeHTML(stripHTML(n.content).substring(0, 120))}</p>
          </div>
        `).join('');

        archGrid.querySelectorAll('.unarchive-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const note = allNotes.find(item => item.id === btn.dataset.id);
            if (note) {
              note.isArchived = false;
              note.updatedAt = Date.now();
              Store.saveNotes(allNotes);
              Toast.show('Note unarchived', 'success');
              this.renderNotesView();
            }
          });
        });
        if (archEmpty) archEmpty.style.display = archived.length === 0 ? 'flex' : 'none';
      }

      // Trash View
      const trashGrid = document.getElementById('trash-notes-grid');
      const trashEmpty = document.getElementById('trash-empty-state');
      if (trashGrid) {
        const trashed = allNotes.filter(n => n.isTrashed);
        trashGrid.innerHTML = trashed.map(n => `
          <div class="note-card" data-id="${n.id}">
            <div class="note-card-header">
              <h4 class="note-card-title">${escapeHTML(n.title)}</h4>
              <div class="note-card-actions">
                <button class="btn btn-secondary btn-sm restore-note-btn" data-id="${n.id}">Restore</button>
                <button class="btn btn-danger btn-sm purge-note-btn" data-id="${n.id}">Delete</button>
              </div>
            </div>
            <p class="note-card-body-snippet">${escapeHTML(stripHTML(n.content).substring(0, 100))}</p>
          </div>
        `).join('');

        trashGrid.querySelectorAll('.restore-note-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const note = allNotes.find(item => item.id === btn.dataset.id);
            if (note) {
              note.isTrashed = false;
              note.updatedAt = Date.now();
              Store.saveNotes(allNotes);
              Toast.show('Note restored from Trash', 'success');
              this.renderNotesView();
            }
          });
        });

        trashGrid.querySelectorAll('.purge-note-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            ConfirmModal.show('Permanently delete note?', 'This cannot be undone.', () => {
              const remaining = allNotes.filter(item => item.id !== btn.dataset.id);
              Store.saveNotes(remaining);
              Toast.show('Note permanently deleted', 'info');
              this.renderNotesView();
            });
          });
        });

        if (trashEmpty) trashEmpty.style.display = trashed.length === 0 ? 'flex' : 'none';
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 6. TASK MANAGER ENGINE
   * -------------------------------------------------------------------------- */
  const TasksEngine = {
    currentFilter: 'all',
    searchQuery: '',
    sortMode: 'due-asc',

    init() {
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      // Filter tabs
      const tabs = document.getElementById('tasks-filter-tabs');
      if (tabs) {
        tabs.querySelectorAll('.filter-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            tabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.currentFilter = tab.dataset.filter;
            this.render();
          });
        });
      }

      // Quick task submit bar
      const submitBtn = document.getElementById('btn-quick-task-submit');
      const titleInput = document.getElementById('quick-task-title');
      const dueInput = document.getElementById('quick-task-due');
      const prioritySelect = document.getElementById('quick-task-priority');
      const catSelect = document.getElementById('quick-task-category');

      const handleAdd = () => {
        const title = titleInput?.value.trim();
        if (!title) {
          Toast.show('Please enter a task title', 'warning');
          return;
        }
        this.addTask({
          title: title,
          dueDate: dueInput?.value || null,
          priority: prioritySelect?.value || 'medium',
          category: catSelect?.value || 'Work'
        });
        if (titleInput) titleInput.value = '';
        if (dueInput) dueInput.value = '';
        Toast.show('Task created', 'success');
      };

      submitBtn?.addEventListener('click', handleAdd);
      titleInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdd();
        }
      });

      // Search & Sort in tasks
      document.getElementById('tasks-search-input')?.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
      document.getElementById('tasks-sort-select')?.addEventListener('change', (e) => {
        this.sortMode = e.target.value;
        this.render();
      });
    },

    addTask(data) {
      const tasks = Store.getTasks();
      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: data.title,
        description: data.description || '',
        dueDate: data.dueDate || null,
        priority: data.priority || 'medium',
        category: data.category || 'General',
        isCompleted: false,
        completedAt: null,
        createdAt: Date.now(),
        isTrashed: false
      };
      tasks.unshift(newTask);
      Store.saveTasks(tasks);
      this.render();
      return newTask;
    },

    toggleTask(taskId) {
      const tasks = Store.getTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.isCompleted = !task.isCompleted;
        task.completedAt = task.isCompleted ? Date.now() : null;
        Store.saveTasks(tasks);
        if (task.isCompleted) {
          AudioEngine.playChime();
          Toast.show('Task completed! Keep the momentum.', 'success');
        }
        this.render();
      }
    },

    deleteTask(taskId) {
      const tasks = Store.getTasks();
      const filtered = tasks.filter(t => t.id !== taskId);
      Store.saveTasks(filtered);
      Toast.show('Task deleted', 'info');
      this.render();
    },

    render() {
      const tasks = Store.getTasks();
      const activeTasks = tasks.filter(t => !t.isTrashed);
      const todayStr = getTodayISO();

      // Counts for tabs
      const allCount = activeTasks.length;
      const todayCount = activeTasks.filter(t => t.dueDate === todayStr && !t.isCompleted).length;
      const upcomingCount = activeTasks.filter(t => t.dueDate && t.dueDate > todayStr && !t.isCompleted).length;
      const completedCount = activeTasks.filter(t => t.isCompleted).length;
      const overdueCount = activeTasks.filter(t => t.dueDate && t.dueDate < todayStr && !t.isCompleted).length;

      document.getElementById('count-tasks-all') && (document.getElementById('count-tasks-all').textContent = allCount);
      document.getElementById('count-tasks-today') && (document.getElementById('count-tasks-today').textContent = todayCount);
      document.getElementById('count-tasks-upcoming') && (document.getElementById('count-tasks-upcoming').textContent = upcomingCount);
      document.getElementById('count-tasks-completed') && (document.getElementById('count-tasks-completed').textContent = completedCount);
      document.getElementById('count-tasks-overdue') && (document.getElementById('count-tasks-overdue').textContent = overdueCount);

      // Filter
      let list = activeTasks.slice();
      if (this.currentFilter === 'today') {
        list = list.filter(t => t.dueDate === todayStr);
      } else if (this.currentFilter === 'upcoming') {
        list = list.filter(t => t.dueDate && t.dueDate > todayStr);
      } else if (this.currentFilter === 'completed') {
        list = list.filter(t => t.isCompleted);
      } else if (this.currentFilter === 'overdue') {
        list = list.filter(t => t.dueDate && t.dueDate < todayStr && !t.isCompleted);
      }

      if (this.searchQuery) {
        list = list.filter(t => t.title.toLowerCase().includes(this.searchQuery));
      }

      // Sort
      list.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        if (this.sortMode === 'due-asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (this.sortMode === 'priority-desc') {
          const pOrder = { high: 3, medium: 2, low: 1 };
          return (pOrder[b.priority] || 2) - (pOrder[a.priority] || 2);
        }
        if (this.sortMode === 'created-desc') return b.createdAt - a.createdAt;
        if (this.sortMode === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
      });

      // Progress calculation
      const total = activeTasks.length;
      const done = completedCount;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);

      const pctEl = document.getElementById('task-progress-pct');
      const labelEl = document.getElementById('task-progress-label');
      const barFill = document.getElementById('task-progress-bar-fill');
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (labelEl) labelEl.textContent = `${done} of ${total} tasks completed`;
      if (barFill) barFill.style.width = `${pct}%`;

      // Priority pill counts
      const lowCount = activeTasks.filter(t => t.priority === 'low' && !t.isCompleted).length;
      const medCount = activeTasks.filter(t => t.priority === 'medium' && !t.isCompleted).length;
      const highCount = activeTasks.filter(t => t.priority === 'high' && !t.isCompleted).length;
      document.getElementById('task-badge-low') && (document.getElementById('task-badge-low').textContent = `${lowCount} Low`);
      document.getElementById('task-badge-med') && (document.getElementById('task-badge-med').textContent = `${medCount} Med`);
      document.getElementById('task-badge-high') && (document.getElementById('task-badge-high').textContent = `${highCount} High`);

      // Populate Quick task category dropdown
      const quickCat = document.getElementById('quick-task-category');
      if (quickCat && quickCat.options.length === 0) {
        const cats = Store.getCategories();
        quickCat.innerHTML = cats.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
      }

      // Render Task Items
      const container = document.getElementById('tasks-list');
      const emptyState = document.getElementById('tasks-empty-state');
      if (container) {
        if (list.length === 0) {
          container.innerHTML = '';
          if (emptyState) emptyState.style.display = 'flex';
        } else {
          if (emptyState) emptyState.style.display = 'none';
          container.innerHTML = list.map(t => {
            const isOverdue = t.dueDate && t.dueDate < todayStr && !t.isCompleted;
            return `
              <div class="task-item ${t.isCompleted ? 'completed' : ''}" data-id="${t.id}">
                <div class="task-main-col">
                  <div class="task-checkbox ${t.isCompleted ? 'checked' : ''}" data-id="${t.id}">
                    ${t.isCompleted ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                  </div>
                  <div class="task-info-block">
                    <span class="task-title">${escapeHTML(t.title)}</span>
                    <div class="task-sub-meta">
                      <span class="badge badge-${t.priority}">${t.priority.toUpperCase()}</span>
                      <span>${escapeHTML(t.category)}</span>
                      ${t.dueDate ? `<span class="${isOverdue ? 'task-overdue-flag' : ''}">Due: ${t.dueDate}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="task-actions-col">
                  <button class="icon-btn delete-task-btn" data-id="${t.id}" title="Delete Task">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('');

          container.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('click', () => {
              this.toggleTask(box.dataset.id);
            });
          });

          container.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              this.deleteTask(btn.dataset.id);
            });
          });
        }
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 7. DAILY JOURNAL ENGINE
   * -------------------------------------------------------------------------- */
  const JournalEngine = {
    selectedDate: getTodayISO(),
    saveDebounceTimer: null,

    init() {
      this.bindEvents();
      this.loadEntryForDate(this.selectedDate);
      this.renderHistoryList();
    },

    bindEvents() {
      // Prev and Next Day navigation
      document.getElementById('journal-prev-day-btn')?.addEventListener('click', () => {
        this.selectedDate = getDateOffsetISO(-1, this.selectedDate);
        this.loadEntryForDate(this.selectedDate);
      });
      document.getElementById('journal-next-day-btn')?.addEventListener('click', () => {
        this.selectedDate = getDateOffsetISO(1, this.selectedDate);
        this.loadEntryForDate(this.selectedDate);
      });

      // Native date input
      const dateInput = document.getElementById('journal-native-date');
      if (dateInput) {
        dateInput.value = this.selectedDate;
        dateInput.addEventListener('change', (e) => {
          if (e.target.value) {
            this.selectedDate = e.target.value;
            this.loadEntryForDate(this.selectedDate);
          }
        });
      }

      // Jump to Today button
      document.getElementById('journal-today-btn')?.addEventListener('click', () => {
        this.selectedDate = getTodayISO();
        this.loadEntryForDate(this.selectedDate);
      });

      // Mood Selector
      const moodContainer = document.getElementById('journal-mood-selector');
      if (moodContainer) {
        moodContainer.querySelectorAll('.mood-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            moodContainer.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.queueSave();
          });
        });
      }

      // Inputs auto-save bindings
      ['journal-gratitude-1', 'journal-gratitude-2', 'journal-gratitude-3',
       'journal-content-textarea', 'journal-highlights', 'journal-improvements'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => this.queueSave());
      });

      // Shuffle prompt
      document.getElementById('journal-shuffle-prompt-btn')?.addEventListener('click', () => {
        this.shufflePrompt();
      });

      // Use prompt in entry
      document.getElementById('journal-insert-prompt-btn')?.addEventListener('click', () => {
        const promptText = document.getElementById('journal-prompt-text')?.textContent;
        const textarea = document.getElementById('journal-content-textarea');
        if (promptText && textarea) {
          const val = textarea.value.trim();
          textarea.value = val ? `${val}\n\n[Prompt: ${promptText}]\n` : `[Prompt: ${promptText}]\n`;
          textarea.focus();
          this.queueSave();
        }
      });
    },

    shufflePrompt() {
      const idx = Math.floor(Math.random() * JOURNAL_PROMPTS.length);
      const promptEl = document.getElementById('journal-prompt-text');
      if (promptEl) promptEl.textContent = JOURNAL_PROMPTS[idx];
    },

    loadEntryForDate(dateStr) {
      this.selectedDate = dateStr;

      // Update date labels
      const dateLabel = document.getElementById('journal-date-label');
      const dateInput = document.getElementById('journal-native-date');
      const isToday = dateStr === getTodayISO();

      if (dateLabel) dateLabel.textContent = isToday ? 'Today' : formatDatePretty(dateStr);
      if (dateInput) dateInput.value = dateStr;

      const journal = Store.getJournal();
      const entry = journal[dateStr] || {
        date: dateStr,
        mood: null,
        gratitude: ['', '', ''],
        content: '',
        highlights: '',
        improvements: ''
      };

      // Populate mood
      const moodContainer = document.getElementById('journal-mood-selector');
      if (moodContainer) {
        moodContainer.querySelectorAll('.mood-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.mood === entry.mood);
        });
      }

      // Populate gratitude
      const g = entry.gratitude || ['', '', ''];
      document.getElementById('journal-gratitude-1') && (document.getElementById('journal-gratitude-1').value = g[0] || '');
      document.getElementById('journal-gratitude-2') && (document.getElementById('journal-gratitude-2').value = g[1] || '');
      document.getElementById('journal-gratitude-3') && (document.getElementById('journal-gratitude-3').value = g[2] || '');

      // Populate textareas
      document.getElementById('journal-content-textarea') && (document.getElementById('journal-content-textarea').value = entry.content || '');
      document.getElementById('journal-highlights') && (document.getElementById('journal-highlights').value = entry.highlights || '');
      document.getElementById('journal-improvements') && (document.getElementById('journal-improvements').value = entry.improvements || '');

      this.updateStreakCounter();
    },

    queueSave() {
      const hint = document.getElementById('journal-saved-hint');
      if (hint) hint.textContent = 'Saving...';
      clearTimeout(this.saveDebounceTimer);
      this.saveDebounceTimer = setTimeout(() => {
        this.saveCurrentEntry();
      }, 500);
    },

    saveCurrentEntry() {
      const activeMoodBtn = document.querySelector('#journal-mood-selector .mood-btn.active');
      const mood = activeMoodBtn ? activeMoodBtn.dataset.mood : null;

      const g1 = document.getElementById('journal-gratitude-1')?.value || '';
      const g2 = document.getElementById('journal-gratitude-2')?.value || '';
      const g3 = document.getElementById('journal-gratitude-3')?.value || '';
      const content = document.getElementById('journal-content-textarea')?.value || '';
      const highlights = document.getElementById('journal-highlights')?.value || '';
      const improvements = document.getElementById('journal-improvements')?.value || '';

      const entry = {
        date: this.selectedDate,
        mood: mood,
        gratitude: [g1, g2, g3],
        content: content,
        highlights: highlights,
        improvements: improvements,
        updatedAt: Date.now()
      };

      const journal = Store.getJournal();
      journal[this.selectedDate] = entry;
      Store.saveJournal(journal);

      const hint = document.getElementById('journal-saved-hint');
      if (hint) hint.textContent = 'Saved automatically';

      this.renderHistoryList();
      this.updateStreakCounter();
    },

    renderHistoryList() {
      const journal = Store.getJournal();
      const dates = Object.keys(journal).sort().reverse().slice(0, 7);
      const container = document.getElementById('journal-history-items');
      if (!container) return;

      const moodEmojis = { great: '✨', good: '😊', neutral: '🌿', low: '🌧️', stressed: '⚡' };

      container.innerHTML = dates.map(d => {
        const item = journal[d];
        const emoji = item.mood ? (moodEmojis[item.mood] || '📝') : '📝';
        return `
          <div class="j-history-item ${d === this.selectedDate ? 'active' : ''}" data-date="${d}">
            <span>${emoji} ${d === getTodayISO() ? 'Today' : d}</span>
            <span>${(item.content || '').length > 0 ? (item.content.length + 'c') : ''}</span>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.j-history-item').forEach(el => {
        el.addEventListener('click', () => {
          this.loadEntryForDate(el.dataset.date);
        });
      });

      const totalEntriesEl = document.getElementById('journal-total-entries');
      if (totalEntriesEl) totalEntriesEl.textContent = Object.keys(journal).length;
    },

    updateStreakCounter() {
      const journal = Store.getJournal();
      let streak = 0;
      let checkDate = getTodayISO();

      // If no entry today, check if yesterday had one to continue streak
      if (!journal[checkDate] || !journal[checkDate].content) {
        checkDate = getDateOffsetISO(-1, checkDate);
      }

      while (journal[checkDate] && ((journal[checkDate].content && journal[checkDate].content.trim()) || journal[checkDate].mood)) {
        streak++;
        checkDate = getDateOffsetISO(-1, checkDate);
      }

      const streakVal = document.getElementById('journal-streak-val');
      if (streakVal) streakVal.textContent = `${streak} Day${streak === 1 ? '' : 's'}`;
    }
  };

  /* --------------------------------------------------------------------------
   * 8. ANALYTICS & STREAKS ENGINE
   * -------------------------------------------------------------------------- */
  const AnalyticsEngine = {
    render() {
      const notes = Store.getNotes();
      const tasks = Store.getTasks();
      const journal = Store.getJournal();
      const sessions = Store.getFocusSessions();

      // Gather active days across all data types
      const activeDaysMap = {};

      tasks.forEach(t => {
        if (t.isCompleted && t.completedAt) {
          const d = new Date(t.completedAt).toISOString().split('T')[0];
          activeDaysMap[d] = (activeDaysMap[d] || 0) + 1;
        }
      });

      notes.forEach(n => {
        if (!n.isTrashed) {
          const d = new Date(n.createdAt).toISOString().split('T')[0];
          activeDaysMap[d] = (activeDaysMap[d] || 0) + 1;
        }
      });

      for (const d in journal) {
        if (journal[d].content || journal[d].mood) {
          activeDaysMap[d] = (activeDaysMap[d] || 0) + 1;
        }
      }

      sessions.forEach(s => {
        if (s.completedAt) {
          const d = new Date(s.completedAt).toISOString().split('T')[0];
          activeDaysMap[d] = (activeDaysMap[d] || 0) + 1;
        }
      });

      // Calculate current and longest streak
      const streakStats = this.computeStreaks(activeDaysMap);

      document.getElementById('stat-current-streak') && (document.getElementById('stat-current-streak').textContent = `${streakStats.current} Days`);
      document.getElementById('stat-longest-streak') && (document.getElementById('stat-longest-streak').textContent = `Best: ${streakStats.longest} Days`);
      document.getElementById('analytics-streak-days') && (document.getElementById('analytics-streak-days').textContent = streakStats.current);

      // Total Tasks Done
      const doneTasks = tasks.filter(t => t.isCompleted).length;
      const totalTasks = tasks.length;
      const compRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
      document.getElementById('stat-total-tasks-done') && (document.getElementById('stat-total-tasks-done').textContent = doneTasks);
      document.getElementById('stat-completion-rate') && (document.getElementById('stat-completion-rate').textContent = `${compRate}% overall rate`);

      // Total Focus Minutes
      const totalFocusMin = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      document.getElementById('stat-total-focus-min') && (document.getElementById('stat-total-focus-min').textContent = `${totalFocusMin}m`);
      document.getElementById('stat-total-sessions') && (document.getElementById('stat-total-sessions').textContent = `${sessions.length} sessions logged`);

      // Total Notes & Words
      const activeNotes = notes.filter(n => !n.isTrashed);
      let totalWords = 0;
      activeNotes.forEach(n => {
        const text = stripHTML(n.content || '');
        if (text.trim()) totalWords += text.trim().split(/\s+/).length;
      });
      document.getElementById('stat-total-notes-count') && (document.getElementById('stat-total-notes-count').textContent = activeNotes.length);
      document.getElementById('stat-vault-words') && (document.getElementById('stat-vault-words').textContent = `${totalWords.toLocaleString()} total words`);

      // Render 60-Day Activity Heatmap
      this.renderHeatmap(activeDaysMap);

      // Render Category distribution
      this.renderCategoryBreakdown(activeNotes);

      // Render Task Priority distribution
      this.renderPriorityBreakdown(tasks);
    },

    computeStreaks(activeDaysMap) {
      let current = 0;
      let checkDate = getTodayISO();

      if (!activeDaysMap[checkDate]) {
        checkDate = getDateOffsetISO(-1, checkDate);
      }

      while (activeDaysMap[checkDate]) {
        current++;
        checkDate = getDateOffsetISO(-1, checkDate);
      }

      // Longest streak
      const sortedDates = Object.keys(activeDaysMap).sort();
      let longest = 0;
      let temp = 0;
      let lastDate = null;

      sortedDates.forEach(d => {
        if (!lastDate) {
          temp = 1;
        } else {
          const expected = getDateOffsetISO(1, lastDate);
          if (d === expected) {
            temp++;
          } else {
            temp = 1;
          }
        }
        if (temp > longest) longest = temp;
        lastDate = d;
      });

      return { current, longest: Math.max(longest, current) };
    },

    renderHeatmap(activeDaysMap) {
      const container = document.getElementById('analytics-heatmap');
      if (!container) return;

      const cells = [];
      for (let i = 59; i >= 0; i--) {
        const d = getDateOffsetISO(-i);
        const count = activeDaysMap[d] || 0;
        let level = 0;
        if (count >= 1 && count <= 2) level = 1;
        else if (count >= 3 && count <= 4) level = 2;
        else if (count >= 5 && count <= 7) level = 3;
        else if (count >= 8) level = 4;

        cells.push(`
          <div class="heat-cell level-${level}" title="${d}: ${count} action${count === 1 ? '' : 's'}"></div>
        `);
      }
      container.innerHTML = cells.join('');
    },

    renderCategoryBreakdown(notes) {
      const container = document.getElementById('analytics-category-bars');
      if (!container) return;

      const cats = Store.getCategories();
      const counts = {};
      cats.forEach(c => counts[c] = 0);
      notes.forEach(n => {
        if (counts[n.category] !== undefined) counts[n.category]++;
        else counts[n.category] = 1;
      });

      const total = notes.length || 1;
      container.innerHTML = Object.keys(counts).map(cat => {
        const cnt = counts[cat];
        const pct = Math.round((cnt / total) * 100);
        return `
          <div class="cat-stat-row">
            <div class="cat-stat-header">
              <span>${escapeHTML(cat)}</span>
              <span>${cnt} notes (${pct}%)</span>
            </div>
            <div class="cat-stat-track">
              <div class="cat-stat-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    },

    renderPriorityBreakdown(tasks) {
      const container = document.getElementById('analytics-priority-bars');
      if (!container) return;

      const pCounts = { high: 0, medium: 0, low: 0 };
      tasks.forEach(t => {
        if (pCounts[t.priority] !== undefined) pCounts[t.priority]++;
      });

      const total = tasks.length || 1;
      const labels = { high: 'High Priority', medium: 'Medium Priority', low: 'Low Priority' };

      container.innerHTML = ['high', 'medium', 'low'].map(p => {
        const cnt = pCounts[p];
        const pct = Math.round((cnt / total) * 100);
        return `
          <div class="cat-stat-row">
            <div class="cat-stat-header">
              <span>${labels[p]}</span>
              <span>${cnt} tasks (${pct}%)</span>
            </div>
            <div class="cat-stat-track">
              <div class="cat-stat-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  /* --------------------------------------------------------------------------
   * 9. DASHBOARD CONTROLLER (COMMAND CENTER WIDGETS)
   * -------------------------------------------------------------------------- */
  const DashboardController = {
    init() {
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      // Hero quick input
      const input = document.getElementById('hero-quick-input');
      const typeSelect = document.getElementById('hero-quick-type');
      const saveBtn = document.getElementById('hero-quick-save-btn');

      const handleHeroSave = () => {
        const text = input?.value.trim();
        if (!text) return;
        const type = typeSelect?.value || 'note';

        if (type === 'task') {
          TasksEngine.addTask({
            title: text,
            dueDate: getTodayISO(),
            priority: 'medium',
            category: 'Personal'
          });
          Toast.show('Task captured on Dashboard', 'success');
        } else {
          NotesEngine.createNewNote(text, '<p></p>', 'Personal');
        }

        if (input) input.value = '';
      };

      saveBtn?.addEventListener('click', handleHeroSave);
      input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleHeroSave();
        }
      });

      // Focus action button in dashboard
      document.getElementById('dash-focus-action-btn')?.addEventListener('click', () => {
        TimerEngine.toggle();
      });
    },

    render() {
      const now = new Date();
      const settings = Store.getSettings();
      const hour = now.getHours();
      let greetingTime = 'evening';
      if (hour >= 5 && hour < 12) greetingTime = 'morning';
      else if (hour >= 12 && hour < 17) greetingTime = 'afternoon';

      const userName = settings.userName || 'Explorer';
      document.getElementById('hero-greeting') && (document.getElementById('hero-greeting').textContent = `Good ${greetingTime}, ${userName}.`);
      document.getElementById('hero-current-date') && (document.getElementById('hero-current-date').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));

      // Random inspirational quote
      const quoteObj = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      document.getElementById('hero-quote') && (document.getElementById('hero-quote').textContent = `"${quoteObj.text}" — ${quoteObj.author}`);

      // Metrics
      const tasks = Store.getTasks().filter(t => !t.isTrashed);
      const notes = Store.getNotes().filter(t => !t.isTrashed);
      const sessions = Store.getFocusSessions();
      const todayStr = getTodayISO();

      const doneTasks = tasks.filter(t => t.isCompleted);
      const pendingTasks = tasks.filter(t => !t.isCompleted);
      const doneToday = tasks.filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr).length;
      const notesToday = notes.filter(n => new Date(n.createdAt).toISOString().split('T')[0] === todayStr).length;

      const focusMinutesToday = sessions
        .filter(s => s.completedAt && new Date(s.completedAt).toISOString().split('T')[0] === todayStr)
        .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

      document.getElementById('metric-tasks-done') && (document.getElementById('metric-tasks-done').textContent = doneTasks.length);
      document.getElementById('metric-tasks-pending') && (document.getElementById('metric-tasks-pending').textContent = `${pendingTasks.length} pending`);

      const totalTasks = tasks.length;
      const progressPct = totalTasks === 0 ? 0 : Math.round((doneTasks.length / totalTasks) * 100);
      document.getElementById('metric-progress-pct') && (document.getElementById('metric-progress-pct').textContent = `${progressPct}%`);
      document.getElementById('metric-progress-bar-fill') && (document.getElementById('metric-progress-bar-fill').style.width = `${progressPct}%`);

      document.getElementById('metric-notes-count') && (document.getElementById('metric-notes-count').textContent = notes.length);
      document.getElementById('metric-notes-today') && (document.getElementById('metric-notes-today').textContent = `${notesToday} created today`);

      document.getElementById('metric-focus-minutes') && (document.getElementById('metric-focus-minutes').textContent = `${focusMinutesToday}m`);

      // Continue where you left off (recent notes)
      const recentNotesContainer = document.getElementById('dash-recent-notes');
      if (recentNotesContainer) {
        const sortedNotes = notes.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
        if (sortedNotes.length === 0) {
          recentNotesContainer.innerHTML = '<p class="text-secondary" style="font-size:13px; padding:8px 0;">No notes created yet. Click Quick Capture to start.</p>';
        } else {
          recentNotesContainer.innerHTML = sortedNotes.map(n => `
            <div class="dash-note-item" data-id="${n.id}">
              <div class="dash-note-info">
                <span class="color-dot ${n.color || 'default'}"></span>
                <span class="dash-note-title">${escapeHTML(n.title)}</span>
                <span class="dash-note-cat">${escapeHTML(n.category)}</span>
              </div>
              <span class="dash-note-time">${formatRelativeTime(n.updatedAt)}</span>
            </div>
          `).join('');

          recentNotesContainer.querySelectorAll('.dash-note-item').forEach(item => {
            item.addEventListener('click', () => {
              NotesEngine.openNoteEditor(item.dataset.id);
            });
          });
        }
      }

      // Today's Key Priorities
      const todayTasksContainer = document.getElementById('dash-today-tasks');
      if (todayTasksContainer) {
        const todayTasks = tasks.filter(t => (!t.dueDate || t.dueDate === todayStr) && !t.isCompleted).slice(0, 4);
        if (todayTasks.length === 0) {
          todayTasksContainer.innerHTML = '<p class="text-secondary" style="font-size:13px; padding:8px 0;">All priorities complete for today! Enjoy the calm.</p>';
        } else {
          todayTasksContainer.innerHTML = todayTasks.map(t => `
            <div class="dash-task-item" data-id="${t.id}">
              <div class="task-checkbox ${t.isCompleted ? 'checked' : ''}" data-id="${t.id}">
                ${t.isCompleted ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
              </div>
              <span class="dash-task-title">${escapeHTML(t.title)}</span>
              <span class="badge badge-${t.priority}">${t.priority}</span>
            </div>
          `).join('');

          todayTasksContainer.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('click', () => {
              TasksEngine.toggleTask(box.dataset.id);
            });
          });
        }
      }

      // Weekly Momentum Graph (7-Day Bars)
      this.renderWeeklyChart(tasks, notes, sessions);
    },

    renderWeeklyChart(tasks, notes, sessions) {
      const container = document.getElementById('dash-weekly-bars');
      if (!container) return;

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const bars = [];
      let totalActions = 0;

      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const dStr = getDateOffsetISO(-i);
        const dObj = new Date(dStr + 'T00:00:00');
        const dayLabel = dayNames[dObj.getDay()];
        const isToday = i === 0;

        let dayCount = 0;
        dayCount += tasks.filter(t => t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dStr).length;
        dayCount += notes.filter(n => new Date(n.createdAt).toISOString().split('T')[0] === dStr).length;
        dayCount += sessions.filter(s => s.completedAt && new Date(s.completedAt).toISOString().split('T')[0] === dStr).length;

        totalActions += dayCount;
        const heightPct = Math.min(100, Math.max(8, dayCount * 22));

        bars.push(`
          <div class="weekly-bar-col">
            <div class="bar-track" title="${dStr}: ${dayCount} actions">
              <div class="bar-fill ${isToday ? 'active-day' : ''}" style="height: ${heightPct}%;"></div>
            </div>
            <span class="bar-day-label ${isToday ? 'text-violet' : ''}">${dayLabel}</span>
          </div>
        `);
      }

      container.innerHTML = bars.join('');
      document.getElementById('dash-activity-total') && (document.getElementById('dash-activity-total').textContent = `${totalActions} actions`);
    }
  };

  /* --------------------------------------------------------------------------
   * 10. GLOBAL SEARCH & COMMAND PALETTE (CTRL+K)
   * -------------------------------------------------------------------------- */
  const CommandPalette = {
    isOpen: false,
    selectedIndex: 0,
    results: [],

    init() {
      const modal = document.getElementById('palette-modal');
      const input = document.getElementById('palette-search-input');
      const triggerBtn = document.getElementById('global-search-btn');

      triggerBtn?.addEventListener('click', () => this.open());
      input?.addEventListener('input', (e) => this.search(e.target.value));

      input?.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        } else if (e.key === 'Escape') {
          this.close();
        }
      });

      modal?.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    },

    open() {
      const modal = document.getElementById('palette-modal');
      const input = document.getElementById('palette-search-input');
      if (!modal || !input) return;
      modal.style.display = 'flex';
      input.value = '';
      input.focus();
      this.isOpen = true;
      this.search('');
    },

    close() {
      const modal = document.getElementById('palette-modal');
      if (modal) modal.style.display = 'none';
      this.isOpen = false;
    },

    search(query) {
      const q = query.trim().toLowerCase();
      this.results = [];

      // 1. Static action commands
      const actions = [
        { title: 'Create New Note', type: 'Action', run: () => NotesEngine.createNewNote() },
        { title: 'Create New Task', type: 'Action', run: () => QuickCapture.open('task') },
        { title: 'Start Focus Session (25m)', type: 'Action', run: () => { UI.switchSection('focus'); TimerEngine.setMode('focus'); TimerEngine.start(); } },
        { title: 'Open Daily Journal', type: 'Navigation', run: () => UI.switchSection('journal') },
        { title: 'Go to Dashboard', type: 'Navigation', run: () => UI.switchSection('dashboard') },
        { title: 'Go to All Notes', type: 'Navigation', run: () => UI.switchSection('notes') },
        { title: 'Go to Tasks', type: 'Navigation', run: () => UI.switchSection('tasks') },
        { title: 'Go to Analytics & Streaks', type: 'Navigation', run: () => UI.switchSection('analytics') },
        { title: 'Go to Collections', type: 'Navigation', run: () => UI.switchSection('collections') },
        { title: 'Go to Settings', type: 'Navigation', run: () => UI.switchSection('settings') },
        { title: 'Toggle Theme (Dark / Light)', type: 'Action', run: () => UI.toggleTheme() },
        { title: 'Export Backup JSON', type: 'Action', run: () => DataManager.exportJSON() }
      ];

      actions.forEach(a => {
        if (!q || a.title.toLowerCase().includes(q)) {
          this.results.push(a);
        }
      });

      // 2. Search Notes
      if (q) {
        const notes = Store.getNotes().filter(n => !n.isTrashed);
        notes.forEach(n => {
          if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q))) {
            this.results.push({
              title: n.title,
              type: 'Note',
              noteId: n.id,
              run: () => NotesEngine.openNoteEditor(n.id)
            });
          }
        });

        // 3. Search Tasks
        const tasks = Store.getTasks().filter(t => !t.isTrashed);
        tasks.forEach(t => {
          if (t.title.toLowerCase().includes(q)) {
            this.results.push({
              title: t.title,
              type: 'Task',
              run: () => { UI.switchSection('tasks'); }
            });
          }
        });
      }

      this.selectedIndex = 0;
      this.renderResults();
    },

    renderResults() {
      const container = document.getElementById('palette-results');
      if (!container) return;

      if (this.results.length === 0) {
        container.innerHTML = '<p class="text-secondary" style="padding:16px 12px; font-size:13px;">No results found.</p>';
        return;
      }

      container.innerHTML = this.results.map((res, idx) => `
        <div class="palette-item ${idx === this.selectedIndex ? 'selected' : ''}" data-idx="${idx}">
          <div class="palette-item-left">
            <span class="palette-item-type">${res.type}</span>
            <span class="palette-item-title">${escapeHTML(res.title)}</span>
          </div>
          <kbd>↵</kbd>
        </div>
      `).join('');

      container.querySelectorAll('.palette-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx, 10);
          this.selectedIndex = idx;
          this.executeSelected();
        });
      });
    },

    moveSelection(delta) {
      if (this.results.length === 0) return;
      this.selectedIndex = (this.selectedIndex + delta + this.results.length) % this.results.length;
      this.renderResults();

      const container = document.getElementById('palette-results');
      const selected = container?.querySelector('.palette-item.selected');
      if (selected && selected.scrollIntoView) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    },

    executeSelected() {
      const item = this.results[this.selectedIndex];
      if (item && item.run) {
        this.close();
        item.run();
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 11. UNIVERSAL QUICK CAPTURE MODAL (CTRL+SHIFT+N)
   * -------------------------------------------------------------------------- */
  const QuickCapture = {
    activeType: 'note',

    init() {
      const modal = document.getElementById('quick-capture-modal');
      const closeBtn = document.getElementById('qc-modal-close');
      const cancelBtn = document.getElementById('qc-cancel-btn');
      const saveBtn = document.getElementById('qc-save-btn');
      const tabs = document.getElementById('qc-type-tabs');

      // Global triggers
      document.getElementById('sidebar-quick-capture-btn')?.addEventListener('click', () => this.open());
      document.getElementById('topbar-quick-capture-btn')?.addEventListener('click', () => this.open());

      closeBtn?.addEventListener('click', () => this.close());
      cancelBtn?.addEventListener('click', () => this.close());
      modal?.addEventListener('click', (e) => { if (e.target === modal) this.close(); });

      // Tab switcher (Note vs Task)
      tabs?.querySelectorAll('.qc-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.querySelectorAll('.qc-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.setType(tab.dataset.type);
        });
      });

      saveBtn?.addEventListener('click', () => this.submit());

      // Keyboard shortcut in modal: Ctrl+Enter to save
      modal?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.submit();
        } else if (e.key === 'Escape') {
          this.close();
        }
      });
    },

    open(type = 'note') {
      const modal = document.getElementById('quick-capture-modal');
      const titleInput = document.getElementById('qc-title-input');
      const bodyInput = document.getElementById('qc-body-input');
      const tagsInput = document.getElementById('qc-tags-input');
      const catSelect = document.getElementById('qc-category-select');

      if (!modal) return;
      modal.style.display = 'flex';
      if (titleInput) titleInput.value = '';
      if (bodyInput) bodyInput.value = '';
      if (tagsInput) tagsInput.value = '';

      // Populate categories
      if (catSelect) {
        const cats = Store.getCategories();
        catSelect.innerHTML = cats.map(c => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('');
      }

      this.setType(type);
      if (titleInput) titleInput.focus();
    },

    close() {
      const modal = document.getElementById('quick-capture-modal');
      if (modal) modal.style.display = 'none';
    },

    setType(type) {
      this.activeType = type;
      const tabs = document.getElementById('qc-type-tabs');
      tabs?.querySelectorAll('.qc-tab').forEach(t => t.classList.toggle('active', t.dataset.type === type));

      const taskFields = document.getElementById('qc-task-fields');
      if (taskFields) taskFields.style.display = type === 'task' ? 'flex' : 'none';

      const titleInput = document.getElementById('qc-title-input');
      if (titleInput) {
        titleInput.placeholder = type === 'task' ? 'Task title or action...' : 'Note title or thought...';
      }
    },

    submit() {
      const title = document.getElementById('qc-title-input')?.value.trim();
      const body = document.getElementById('qc-body-input')?.value.trim() || '';
      const cat = document.getElementById('qc-category-select')?.value || 'Personal';
      const rawTags = document.getElementById('qc-tags-input')?.value.trim() || '';
      const tags = rawTags ? rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];

      if (!title) {
        Toast.show('Please enter a title or thought', 'warning');
        return;
      }

      if (this.activeType === 'task') {
        const due = document.getElementById('qc-task-due')?.value || null;
        const priority = document.getElementById('qc-task-priority')?.value || 'medium';
        TasksEngine.addTask({
          title: title,
          description: body,
          dueDate: due,
          priority: priority,
          category: cat
        });
        Toast.show('Task captured successfully!', 'success');
      } else {
        const note = NotesEngine.createNewNote(title, `<p>${escapeHTML(body)}</p>`, cat);
        if (tags.length > 0) {
          const notes = Store.getNotes();
          const target = notes.find(n => n.id === note.id);
          if (target) {
            target.tags = tags;
            Store.saveNotes(notes);
          }
        }
        Toast.show('Note captured successfully!', 'success');
      }

      this.close();
    }
  };

  /* --------------------------------------------------------------------------
   * 12. COLLECTIONS & TAXONOMY CONTROLLER
   * -------------------------------------------------------------------------- */
  const CollectionsController = {
    init() {
      document.getElementById('btn-add-category')?.addEventListener('click', () => {
        const input = document.getElementById('new-category-name');
        const name = input?.value.trim();
        if (name) {
          this.addCategory(name);
          if (input) input.value = '';
        }
      });
      this.render();
    },

    addCategory(name) {
      const cats = Store.getCategories();
      if (cats.some(c => c.toLowerCase() === name.toLowerCase())) {
        Toast.show('Category already exists!', 'warning');
        return;
      }
      cats.push(name);
      Store.saveCategories(cats);
      Toast.show(`Category "${name}" added`, 'success');
      this.render();
    },

    removeCategory(name) {
      ConfirmModal.show(
        `Delete Category "${name}"?`,
        'Notes under this category will safely be reassigned to "Personal".',
        () => {
          let cats = Store.getCategories();
          cats = cats.filter(c => c !== name);
          if (cats.length === 0) cats = ['Personal'];
          Store.saveCategories(cats);

          // Safely reassign affected notes
          const notes = Store.getNotes();
          let count = 0;
          notes.forEach(n => {
            if (n.category === name) {
              n.category = 'Personal';
              count++;
            }
          });
          if (count > 0) Store.saveNotes(notes);

          Toast.show(`Category deleted. ${count} notes reassigned to Personal.`, 'info');
          this.render();
        }
      );
    },

    render() {
      const cats = Store.getCategories();
      const notes = Store.getNotes().filter(n => !n.isTrashed);
      const catList = document.getElementById('collections-category-list');

      if (catList) {
        catList.innerHTML = cats.map(c => {
          const count = notes.filter(n => n.category === c).length;
          return `
            <div class="collection-item-row">
              <div class="collection-name-group">
                <span class="color-dot default"></span>
                <span>${escapeHTML(c)}</span>
                <span class="badge badge-accent">${count} notes</span>
              </div>
              <div>
                ${c !== 'Personal' ? `<button class="icon-btn delete-cat-btn" data-cat="${escapeHTML(c)}" title="Delete Category"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>` : ''}
              </div>
            </div>
          `;
        }).join('');

        catList.querySelectorAll('.delete-cat-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            this.removeCategory(btn.dataset.cat);
          });
        });
      }

      // Tags cloud
      const tagCloud = document.getElementById('collections-tags-cloud');
      if (tagCloud) {
        const tagMap = {};
        notes.forEach(n => {
          (n.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
        });
        const tags = Object.keys(tagMap).sort();
        if (tags.length === 0) {
          tagCloud.innerHTML = '<p class="text-muted" style="font-size:13px;">No tags in use yet.</p>';
        } else {
          tagCloud.innerHTML = tags.map(t => `
            <span class="tag-chip" data-tag="${escapeHTML(t)}">#${escapeHTML(t)} (${tagMap[t]})</span>
          `).join('');

          tagCloud.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              NotesEngine.selectedTag = chip.dataset.tag;
              UI.switchSection('notes');
            });
          });
        }
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 13. DATA MANAGER (EXPORT, IMPORT, BACKUP, RESTORE)
   * -------------------------------------------------------------------------- */
  const DataManager = {
    pendingImportData: null,

    init() {
      // Export JSON
      document.getElementById('btn-export-json')?.addEventListener('click', () => this.exportJSON());

      // Export Markdown
      document.getElementById('btn-export-markdown-all')?.addEventListener('click', () => this.exportMarkdownAll());

      // Trigger file upload
      document.getElementById('btn-trigger-import')?.addEventListener('click', () => {
        document.getElementById('import-json-input')?.click();
      });

      // Handle file selection
      document.getElementById('import-json-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileSelect(file);
        e.target.value = '';
      });

      // Import modal confirm/cancel
      document.getElementById('import-modal-close')?.addEventListener('click', () => this.closeImportModal());
      document.getElementById('import-cancel-btn')?.addEventListener('click', () => this.closeImportModal());
      document.getElementById('import-execute-btn')?.addEventListener('click', () => this.executeImport());

      // Load sample data button in settings
      document.getElementById('btn-load-sample-data')?.addEventListener('click', () => {
        ConfirmModal.show('Load Sample Workspace?', 'This will populate example notes, tasks, and reflections.', () => {
          Store.seedSampleData();
          Toast.show('Sample workspace loaded!', 'success');
          UI.refreshAll();
        });
      });

      // Empty Trash
      document.getElementById('btn-empty-trash')?.addEventListener('click', () => {
        ConfirmModal.show('Empty Trash?', 'Permanently deletes all trashed notes and tasks.', () => {
          const notes = Store.getNotes().filter(n => !n.isTrashed);
          const tasks = Store.getTasks().filter(t => !t.isTrashed);
          Store.saveNotes(notes);
          Store.saveTasks(tasks);
          Toast.show('Trash emptied', 'info');
          NotesEngine.renderNotesView();
        });
      });

      // Reset all data
      document.getElementById('btn-reset-vault')?.addEventListener('click', () => {
        ConfirmModal.show('Purge All Vault Data?', 'EVERYTHING will be permanently deleted. Export a backup first!', () => {
          Store.purgeAll();
          Toast.show('Vault reset completely.', 'info');
          UI.refreshAll();
        });
      });
    },

    exportJSON() {
      const payload = {
        app: 'MindVault',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: Store.getSettings(),
        categories: Store.getCategories(),
        notes: Store.getNotes(),
        tasks: Store.getTasks(),
        journal: Store.getJournal(),
        focusSessions: Store.getFocusSessions()
      };

      const dateStr = getTodayISO();
      downloadFile(`mindvault-backup-${dateStr}.json`, JSON.stringify(payload, null, 2), 'application/json');
      Toast.show('Vault backup downloaded!', 'success');
    },

    exportMarkdownAll() {
      const notes = Store.getNotes().filter(n => !n.isTrashed);
      if (notes.length === 0) {
        Toast.show('No active notes to export!', 'warning');
        return;
      }

      let bundle = `# MindVault Notes Archive\nExported: ${new Date().toLocaleString()}\nTotal Notes: ${notes.length}\n\n========================================\n\n`;

      notes.forEach((n, idx) => {
        bundle += `## ${idx + 1}. ${n.title}\n`;
        bundle += `Category: ${n.category} | Tags: ${(n.tags || []).join(', ')}\n`;
        bundle += `Created: ${new Date(n.createdAt).toLocaleString()}\n\n`;
        bundle += htmlToMarkdown(n.content);
        bundle += `\n\n----------------------------------------\n\n`;
      });

      downloadFile(`mindvault-notes-${getTodayISO()}.md`, bundle, 'text/markdown');
      Toast.show('Notes exported to Markdown file!', 'success');
    },

    handleFileSelect(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || (typeof parsed !== 'object')) {
            throw new Error('Not a valid JSON object');
          }
          this.pendingImportData = parsed;
          this.showImportModal(parsed);
        } catch (err) {
          Toast.show('Invalid backup file! Could not parse JSON.', 'error');
        }
      };
      reader.readAsText(file);
    },

    showImportModal(data) {
      const modal = document.getElementById('import-modal');
      const statsSummary = document.getElementById('import-stats-summary');
      if (!modal || !statsSummary) return;

      const notesCount = Array.isArray(data.notes) ? data.notes.length : 0;
      const tasksCount = Array.isArray(data.tasks) ? data.tasks.length : 0;
      const journalCount = data.journal && typeof data.journal === 'object' ? Object.keys(data.journal).length : 0;
      const sessionsCount = Array.isArray(data.focusSessions) ? data.focusSessions.length : 0;

      statsSummary.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:12px; background:var(--bg-surface); border-radius:var(--radius-sm);">
          <div><strong>Notes:</strong> ${notesCount}</div>
          <div><strong>Tasks:</strong> ${tasksCount}</div>
          <div><strong>Journal Entries:</strong> ${journalCount}</div>
          <div><strong>Focus Sessions:</strong> ${sessionsCount}</div>
        </div>
      `;

      modal.style.display = 'flex';
    },

    closeImportModal() {
      const modal = document.getElementById('import-modal');
      if (modal) modal.style.display = 'none';
      this.pendingImportData = null;
    },

    executeImport() {
      if (!this.pendingImportData) return;
      const data = this.pendingImportData;
      const mode = document.querySelector('input[name="import-mode"]:checked')?.value || 'merge';

      try {
        if (mode === 'replace') {
          if (Array.isArray(data.notes)) Store.saveNotes(data.notes);
          if (Array.isArray(data.tasks)) Store.saveTasks(data.tasks);
          if (data.journal && typeof data.journal === 'object') Store.saveJournal(data.journal);
          if (Array.isArray(data.focusSessions)) Store.saveFocusSessions(data.focusSessions);
          if (Array.isArray(data.categories)) Store.saveCategories(data.categories);
          if (data.settings && typeof data.settings === 'object') Store.saveSettings(data.settings);
        } else {
          // Merge mode (prevent duplicate IDs)
          const curNotes = Store.getNotes();
          const existingNoteIds = new Set(curNotes.map(n => n.id));
          if (Array.isArray(data.notes)) {
            data.notes.forEach(n => {
              if (existingNoteIds.has(n.id)) {
                n.id = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
              }
              curNotes.push(n);
            });
            Store.saveNotes(curNotes);
          }

          const curTasks = Store.getTasks();
          const existingTaskIds = new Set(curTasks.map(t => t.id));
          if (Array.isArray(data.tasks)) {
            data.tasks.forEach(t => {
              if (existingTaskIds.has(t.id)) {
                t.id = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
              }
              curTasks.push(t);
            });
            Store.saveTasks(curTasks);
          }

          if (data.journal && typeof data.journal === 'object') {
            const curJournal = Store.getJournal();
            Object.assign(curJournal, data.journal);
            Store.saveJournal(curJournal);
          }

          if (Array.isArray(data.focusSessions)) {
            const curSessions = Store.getFocusSessions();
            Store.saveFocusSessions(curSessions.concat(data.focusSessions));
          }

          if (Array.isArray(data.categories)) {
            const curCats = new Set(Store.getCategories());
            data.categories.forEach(c => curCats.add(c));
            Store.saveCategories(Array.from(curCats));
          }
        }

        this.closeImportModal();
        Toast.show('Backup imported successfully!', 'success');
        UI.refreshAll();
      } catch (e) {
        console.error('Import error:', e);
        Toast.show('Failed to complete import.', 'error');
      }
    }
  };

  /* --------------------------------------------------------------------------
   * 14. UI CONTROLLER, ROUTING, THEMES & SETTINGS
   * -------------------------------------------------------------------------- */
  const UI = {
    currentSection: 'dashboard',

    init() {
      this.bindNavigation();
      this.bindSettings();
      this.bindThemeAndAccent();
      this.bindContextPanel();
      this.bindKeyboardShortcuts();
      this.bindOnboardingModal();
      this.updateStorageIndicator();
      this.refreshAll();
    },

    bindNavigation() {
      // Sidebar item clicks
      document.querySelectorAll('.app-sidebar .nav-item[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchSection(btn.dataset.section);
          this.closeMobileDrawer();
        });
      });

      // Other buttons with data-section
      document.querySelectorAll('button[data-section]').forEach(btn => {
        if (!btn.closest('.sidebar-nav')) {
          btn.addEventListener('click', () => {
            this.switchSection(btn.dataset.section);
          });
        }
      });

      // Brand link
      document.getElementById('brand-home-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchSection('dashboard');
      });

      // Mobile burger toggle & backdrop
      document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
        document.getElementById('app-sidebar')?.classList.toggle('mobile-open');
        document.getElementById('sidebar-backdrop')?.classList.toggle('active');
      });
      document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
        this.closeMobileDrawer();
      });

      // Desktop sidebar collapse toggle
      document.getElementById('sidebar-collapse-toggle')?.addEventListener('click', () => {
        document.getElementById('app-sidebar')?.classList.toggle('collapsed');
      });

      // User profile trigger to settings
      document.getElementById('user-profile-trigger')?.addEventListener('click', () => {
        this.switchSection('settings');
      });
    },

    closeMobileDrawer() {
      document.getElementById('app-sidebar')?.classList.remove('mobile-open');
      document.getElementById('sidebar-backdrop')?.classList.remove('active');
    },

    switchSection(sectionId) {
      this.currentSection = sectionId;

      // Update active nav item
      document.querySelectorAll('.app-sidebar .nav-item[data-section]').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
      });

      // Update visible section
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
      });
      const targetSec = document.getElementById(`view-${sectionId}`);
      if (targetSec) targetSec.classList.add('active');

      // Update Topbar Title & Subtitle
      const titleMap = {
        'dashboard': ['Dashboard', 'Personal Command Center'],
        'notes': ['All Notes', 'Knowledge Assets & Insights'],
        'note-editor': ['Note Editor', 'Distraction-Free Thinking'],
        'tasks': ['Tasks', 'Execution & Commitments'],
        'journal': ['Daily Journal', 'Mindful Reflection & Gratitude'],
        'focus': ['Focus Studio', 'Pomodoro & Deep Work Sprints'],
        'analytics': ['Productivity Analytics', 'Streaks & Momentum'],
        'collections': ['Collections', 'Taxonomies & Categorization'],
        'favorites': ['Favorites', 'Starred Notes & Priorities'],
        'archive': ['Archive', 'Stored for Safe Keeping'],
        'trash': ['Trash Bin', 'Deleted Items Recovery'],
        'settings': ['Settings', 'Preferences & Data Vault']
      };

      const info = titleMap[sectionId] || ['MindVault', ''];
      document.getElementById('page-title') && (document.getElementById('page-title').textContent = info[0]);
      document.getElementById('page-subtitle') && (document.getElementById('page-subtitle').textContent = info[1]);

      // Refresh section-specific state
      if (sectionId === 'dashboard') DashboardController.render();
      if (sectionId === 'notes') NotesEngine.renderNotesView();
      if (sectionId === 'tasks') TasksEngine.render();
      if (sectionId === 'analytics') AnalyticsEngine.render();
      if (sectionId === 'collections') CollectionsController.render();
      if (sectionId === 'favorites' || sectionId === 'archive' || sectionId === 'trash') NotesEngine.renderSpecialViews();

      this.updateContextPanel();
    },

    bindSettings() {
      const settings = Store.getSettings();

      // Display name
      const nameInput = document.getElementById('settings-username');
      if (nameInput) {
        nameInput.value = settings.userName || 'Explorer';
        nameInput.addEventListener('input', (e) => {
          settings.userName = e.target.value.trim() || 'Explorer';
          Store.saveSettings(settings);
          document.getElementById('sidebar-user-name') && (document.getElementById('sidebar-user-name').textContent = settings.userName);
          DashboardController.render();
        });
      }

      // Default start section
      const startSelect = document.getElementById('settings-start-section');
      if (startSelect) {
        startSelect.value = settings.startSection || 'dashboard';
        startSelect.addEventListener('change', (e) => {
          settings.startSection = e.target.value;
          Store.saveSettings(settings);
        });
      }

      // Daily target
      const targetInput = document.getElementById('settings-daily-target');
      if (targetInput) {
        targetInput.value = settings.dailyTarget || 5;
        targetInput.addEventListener('change', (e) => {
          settings.dailyTarget = parseInt(e.target.value, 10) || 5;
          Store.saveSettings(settings);
        });
      }

      // Focus durations
      const focusDur = document.getElementById('settings-focus-dur');
      const shortDur = document.getElementById('settings-short-break-dur');
      const longDur = document.getElementById('settings-long-break-dur');

      if (focusDur) {
        focusDur.value = settings.focusDur || 25;
        focusDur.addEventListener('change', (e) => {
          settings.focusDur = parseInt(e.target.value, 10) || 25;
          Store.saveSettings(settings);
        });
      }
      if (shortDur) {
        shortDur.value = settings.shortBreakDur || 5;
        shortDur.addEventListener('change', (e) => {
          settings.shortBreakDur = parseInt(e.target.value, 10) || 5;
          Store.saveSettings(settings);
        });
      }
      if (longDur) {
        longDur.value = settings.longBreakDur || 15;
        longDur.addEventListener('change', (e) => {
          settings.longBreakDur = parseInt(e.target.value, 10) || 15;
          Store.saveSettings(settings);
        });
      }
    },

    bindThemeAndAccent() {
      const settings = Store.getSettings();

      // Apply initial theme & accent
      this.applyTheme(settings.theme || 'dark');
      this.applyAccent(settings.accent || 'violet');
      this.applyDensity(settings.density || 'comfortable');

      // Theme toggle buttons in sidebar
      document.getElementById('sidebar-theme-toggle')?.addEventListener('click', () => {
        this.toggleTheme();
      });

      // Settings theme select
      const themeSelect = document.getElementById('settings-theme-select');
      if (themeSelect) {
        themeSelect.value = settings.theme || 'dark';
        themeSelect.addEventListener('change', (e) => {
          this.applyTheme(e.target.value);
        });
      }

      // Settings accent picker
      const accentContainer = document.getElementById('settings-accent-picker');
      if (accentContainer) {
        accentContainer.querySelectorAll('.accent-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            accentContainer.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.applyAccent(btn.dataset.accent);
          });
        });
      }

      // Density select
      const densitySelect = document.getElementById('settings-density-select');
      if (densitySelect) {
        densitySelect.value = settings.density || 'comfortable';
        densitySelect.addEventListener('change', (e) => {
          this.applyDensity(e.target.value);
        });
      }
    },

    toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      Toast.show(`Theme changed to ${next}`, 'info');
    },

    applyTheme(theme) {
      let resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
      const settings = Store.getSettings();
      settings.theme = theme;
      Store.saveSettings(settings);

      const sel = document.getElementById('settings-theme-select');
      if (sel) sel.value = theme;
    },

    applyAccent(accent) {
      document.documentElement.setAttribute('data-accent', accent);
      const settings = Store.getSettings();
      settings.accent = accent;
      Store.saveSettings(settings);

      document.querySelectorAll('#settings-accent-picker .accent-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.accent === accent);
      });
    },

    applyDensity(density) {
      document.documentElement.setAttribute('data-density', density);
      const settings = Store.getSettings();
      settings.density = density;
      Store.saveSettings(settings);
    },

    bindContextPanel() {
      const panel = document.getElementById('app-context-panel');
      const toggleBtn = document.getElementById('context-panel-toggle');
      const closeBtn = document.getElementById('context-close-btn');

      toggleBtn?.addEventListener('click', () => {
        panel?.classList.toggle('collapsed');
      });
      closeBtn?.addEventListener('click', () => {
        panel?.classList.add('collapsed');
      });

      // Context panel quick buttons
      document.getElementById('ctx-action-new-note')?.addEventListener('click', () => NotesEngine.createNewNote());
      document.getElementById('ctx-action-new-task')?.addEventListener('click', () => QuickCapture.open('task'));
      document.getElementById('ctx-action-journal')?.addEventListener('click', () => this.switchSection('journal'));
      document.getElementById('context-focus-btn')?.addEventListener('click', () => {
        this.switchSection('focus');
        TimerEngine.toggle();
      });
    },

    updateContextPanel() {
      const tasks = Store.getTasks().filter(t => !t.isTrashed);
      const notes = Store.getNotes().filter(t => !t.isTrashed);
      const todayStr = getTodayISO();

      const todayTasks = tasks.filter(t => (!t.dueDate || t.dueDate === todayStr) && !t.isCompleted).slice(0, 4);
      const ctxTasksList = document.getElementById('context-tasks-list');
      const ctxTasksCount = document.getElementById('context-tasks-count');

      if (ctxTasksCount) ctxTasksCount.textContent = todayTasks.length;
      if (ctxTasksList) {
        if (todayTasks.length === 0) {
          ctxTasksList.innerHTML = '<span class="text-muted" style="font-size:12px;">No pending tasks for today.</span>';
        } else {
          ctxTasksList.innerHTML = todayTasks.map(t => `
            <div class="ctx-mini-item" data-id="${t.id}">
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(t.title)}</span>
              <span class="badge badge-${t.priority}">${t.priority[0].toUpperCase()}</span>
            </div>
          `).join('');

          ctxTasksList.querySelectorAll('.ctx-mini-item').forEach(item => {
            item.addEventListener('click', () => {
              TasksEngine.toggleTask(item.dataset.id);
            });
          });
        }
      }

      // Recent notes in context panel
      const recentNotes = notes.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
      const ctxNotesList = document.getElementById('context-notes-list');
      if (ctxNotesList) {
        if (recentNotes.length === 0) {
          ctxNotesList.innerHTML = '<span class="text-muted" style="font-size:12px;">No notes yet.</span>';
        } else {
          ctxNotesList.innerHTML = recentNotes.map(n => `
            <div class="ctx-mini-item" data-id="${n.id}">
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(n.title)}</span>
              <span style="font-size:10px; color:var(--text-muted);">${formatRelativeTime(n.updatedAt)}</span>
            </div>
          `).join('');

          ctxNotesList.querySelectorAll('.ctx-mini-item').forEach(item => {
            item.addEventListener('click', () => {
              NotesEngine.openNoteEditor(item.dataset.id);
            });
          });
        }
      }
    },

    bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+K / Cmd+K : Open Command Palette
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          CommandPalette.open();
        }
        // Ctrl+Shift+N / Ctrl+N : Quick Capture
        else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'n')) {
          // If not in a standard editable input
          const tag = e.target.tagName.toLowerCase();
          if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
            e.preventDefault();
            QuickCapture.open('note');
          }
        }
        // Ctrl+\ : Toggle Sidebar
        else if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
          e.preventDefault();
          document.getElementById('app-sidebar')?.classList.toggle('collapsed');
        }
        // Ctrl+S : Save current note if in editor
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          if (UI.currentSection === 'note-editor') {
            e.preventDefault();
            NotesEngine.saveNow();
            Toast.show('Note saved', 'success');
          }
        }
      });
    },

    bindOnboardingModal() {
      const hasOnboarded = Store.get(STORAGE_KEYS.ONBOARDED, false);
      const modal = document.getElementById('welcome-modal');
      if (!hasOnboarded && modal) {
        modal.style.display = 'flex';
        let choice = 'sample';

        const choiceSample = document.getElementById('choice-sample-data');
        const choiceBlank = document.getElementById('choice-blank-workspace');

        choiceSample?.addEventListener('click', () => {
          choice = 'sample';
          choiceSample.classList.add('active');
          choiceBlank?.classList.remove('active');
        });
        choiceBlank?.addEventListener('click', () => {
          choice = 'blank';
          choiceBlank.classList.add('active');
          choiceSample?.classList.remove('active');
        });

        document.getElementById('btn-welcome-confirm')?.addEventListener('click', () => {
          if (choice === 'sample') {
            Store.seedSampleData();
          } else {
            Store.set(STORAGE_KEYS.ONBOARDED, true);
          }
          modal.style.display = 'none';
          Toast.show('Welcome to MindVault!', 'success');
          this.refreshAll();
        });
      }
    },

    updateStorageIndicator() {
      const bytes = Store.calculateStorageBytes();
      const kb = Math.round(bytes / 1024);
      const approxMaxKB = 5120; // 5MB standard LocalStorage quota
      const pct = Math.max(2, Math.min(100, Math.round((kb / approxMaxKB) * 100)));

      const label = document.getElementById('sidebar-storage-val');
      const bar = document.getElementById('sidebar-storage-bar');
      if (label) label.textContent = `${kb} KB`;
      if (bar) bar.style.width = `${pct}%`;
    },

    refreshAll() {
      const notes = Store.getNotes().filter(n => !n.isTrashed);
      const tasks = Store.getTasks().filter(t => !t.isTrashed);
      const favs = notes.filter(n => n.isFavorite);
      const archived = notes.filter(n => n.isArchived);
      const trashedNotes = Store.getNotes().filter(n => n.isTrashed);

      // Sidebar badges
      document.getElementById('badge-notes-count') && (document.getElementById('badge-notes-count').textContent = notes.filter(n => !n.isArchived).length);
      document.getElementById('badge-tasks-count') && (document.getElementById('badge-tasks-count').textContent = tasks.filter(t => !t.isCompleted).length);
      document.getElementById('badge-favorites-count') && (document.getElementById('badge-favorites-count').textContent = favs.length);
      document.getElementById('badge-archive-count') && (document.getElementById('badge-archive-count').textContent = archived.length);
      document.getElementById('badge-trash-count') && (document.getElementById('badge-trash-count').textContent = trashedNotes.length);

      DashboardController.render();
      NotesEngine.renderNotesView();
      TasksEngine.render();
      this.updateContextPanel();
      this.updateStorageIndicator();
    }
  };

  /* --------------------------------------------------------------------------
   * 15. CONFIRMATION DIALOG MODAL & TOAST NOTIFICATION HELPERS
   * -------------------------------------------------------------------------- */
  const ConfirmModal = {
    callback: null,

    show(title, message, onConfirm) {
      const modal = document.getElementById('confirm-modal');
      const t = document.getElementById('confirm-modal-title');
      const m = document.getElementById('confirm-modal-message');
      const okBtn = document.getElementById('confirm-modal-ok');
      const cancelBtn = document.getElementById('confirm-modal-cancel');
      const closeBtn = document.getElementById('confirm-modal-close');

      if (!modal) return;
      if (t) t.textContent = title;
      if (m) m.textContent = message;
      this.callback = onConfirm;

      modal.style.display = 'flex';

      const cleanup = () => {
        modal.style.display = 'none';
        okBtn?.removeEventListener('click', handleOk);
        cancelBtn?.removeEventListener('click', cleanup);
        closeBtn?.removeEventListener('click', cleanup);
      };

      const handleOk = () => {
        cleanup();
        if (typeof this.callback === 'function') this.callback();
      };

      okBtn?.addEventListener('click', handleOk);
      cancelBtn?.addEventListener('click', cleanup);
      closeBtn?.addEventListener('click', cleanup);
    }
  };

  const Toast = {
    show(message, type = 'info', duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      toast.innerHTML = `<span>${iconMap[type] || '•'}</span><span>${escapeHTML(message)}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 260);
      }, duration);
    }
  };

  /* --------------------------------------------------------------------------
   * 16. UTILITY FUNCTIONS
   * -------------------------------------------------------------------------- */
  function getTodayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function getDateOffsetISO(offsetDays, baseISO = null) {
    const d = baseISO ? new Date(baseISO + 'T00:00:00') : new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }

  function formatDatePretty(iso) {
    try {
      const parts = iso.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  function formatRelativeTime(ts) {
    if (!ts) return 'just now';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  }

  function slugify(text) {
    return (text || 'file')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  function htmlToMarkdown(html) {
    if (!html) return '';
    let md = html;
    md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n');
    md = md.replace(/<pre><code>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<pre>(.*?)<\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<ul>/gi, '\n');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol>/gi, '\n');
    md = md.replace(/<\/ol>/gi, '\n');
    md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*[\/]?>/gi, '\n');
    md = stripHTML(md);
    return md.trim();
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /* --------------------------------------------------------------------------
   * 17. INITIALIZATION ON DOM READY
   * -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize UI shell & Settings
    UI.init();

    // 2. Initialize Core Engines
    TimerEngine.init();
    NotesEngine.init();
    TasksEngine.init();
    JournalEngine.init();
    CommandPalette.init();
    QuickCapture.init();
    CollectionsController.init();
    DataManager.init();

    // 3. Focus mode tabs & ambient audio buttons in Focus Studio
    document.getElementById('focus-toggle-btn')?.addEventListener('click', () => {
      TimerEngine.toggle();
    });
    document.getElementById('focus-reset-btn')?.addEventListener('click', () => {
      TimerEngine.reset();
    });
    document.getElementById('focus-skip-btn')?.addEventListener('click', () => {
      TimerEngine.skip();
    });

    const focusModePills = document.getElementById('focus-mode-pills');
    if (focusModePills) {
      focusModePills.querySelectorAll('.mode-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          focusModePills.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const mode = pill.dataset.mode;
          const customControls = document.getElementById('focus-custom-controls');
          if (customControls) customControls.style.display = mode === 'custom' ? 'flex' : 'none';
          TimerEngine.setMode(mode);
        });
      });
    }

    document.getElementById('btn-apply-custom-timer')?.addEventListener('click', () => {
      const minutes = parseInt(document.getElementById('custom-minutes-input')?.value, 10) || 45;
      TimerEngine.setMode('custom', minutes);
      Toast.show(`Custom timer set to ${minutes}m`, 'info');
    });

    // Ambient sound buttons
    const ambientBtns = document.getElementById('ambient-sound-buttons');
    if (ambientBtns) {
      ambientBtns.querySelectorAll('.ambient-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          ambientBtns.querySelectorAll('.ambient-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sound = btn.dataset.sound;
          AudioEngine.playAmbient(sound);
          Toast.show(`Ambient sound: ${sound === 'off' ? 'Muted' : sound}`, 'info');
        });
      });
    }

    document.getElementById('ambient-volume')?.addEventListener('input', (e) => {
      AudioEngine.setAmbientVolume(e.target.value);
    });

    // Notes toolbar layout & creation buttons
    document.getElementById('btn-create-note')?.addEventListener('click', () => {
      NotesEngine.createNewNote();
    });
    document.getElementById('btn-empty-create-note')?.addEventListener('click', () => {
      NotesEngine.createNewNote();
    });

    document.getElementById('notes-layout-grid')?.addEventListener('click', function () {
      this.classList.add('active');
      document.getElementById('notes-layout-list')?.classList.remove('active');
      NotesEngine.layoutMode = 'grid';
      NotesEngine.renderNotesView();
    });
    document.getElementById('notes-layout-list')?.addEventListener('click', function () {
      this.classList.add('active');
      document.getElementById('notes-layout-grid')?.classList.remove('active');
      NotesEngine.layoutMode = 'list';
      NotesEngine.renderNotesView();
    });

    document.getElementById('notes-sort-select')?.addEventListener('change', (e) => {
      NotesEngine.sortMode = e.target.value;
      NotesEngine.renderNotesView();
    });

    document.getElementById('notes-filter-search')?.addEventListener('input', (e) => {
      NotesEngine.searchQuery = e.target.value;
      NotesEngine.renderNotesView();
    });

    // Task add modal button trigger
    document.getElementById('btn-add-task-modal')?.addEventListener('click', () => {
      QuickCapture.open('task');
    });

    // Store sync listener to re-render views on state changes
    Store.subscribe((event) => {
      if (event === 'notes_updated' || event === 'tasks_updated' || event === 'categories_updated') {
        UI.refreshAll();
      }
    });

    // Start with preferred startSection
    const settings = Store.getSettings();
    if (settings.startSection && settings.startSection !== 'dashboard') {
      UI.switchSection(settings.startSection);
    }
  });

})();
