/**
 * Sirag Atlas — Main Application Router, Hijri Memory Sync & Explorer Mastery Tracker (v1.1.0)
 */
(function () {
  const STORAGE_KEY = 'sirag_atlas_progress_v1';

  class ExplorerTracker {
    constructor() {
      this.state = this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return {
        stations: [],
        battles: [],
        scenarios: [],
        companions: [],
        relics: []
      };
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (_) {}
      this.renderScore();
    }

    addUnique(bucket, id) {
      if (!this.state[bucket].includes(id)) {
        this.state[bucket].push(id);
        this.save();
      } else {
        this.renderScore();
      }
    }

    markStationVisited(id) { this.addUnique('stations', id); }
    markBattleExplored(id) { this.addUnique('battles', id); }
    markScenarioSolved(id) { this.addUnique('scenarios', id); }
    markCompanionVisited(id) { this.addUnique('companions', id); }
    markRelicOpened(id) { this.addUnique('relics', id); }

    renderScore() {
      const totalPossible =
        (window.SEERAH_EVENTS?.length || 18) +
        (window.SEERAH_BATTLES?.length || 3) +
        (window.SEERAH_SCENARIOS?.length || 5) +
        (window.SEERAH_COMPANIONS?.length || 16) +
        (window.SEERAH_RELICS?.length || 6);

      const achieved =
        this.state.stations.length +
        this.state.battles.length +
        this.state.scenarios.length +
        this.state.companions.length +
        this.state.relics.length;

      const pct = Math.min(100, Math.round((achieved / totalPossible) * 100));
      const el = document.getElementById('explorer-score');
      if (el) {
        el.textContent = `${pct}% مستكشف (${achieved}/${totalPossible})`;
      }
    }
  }

  class SiragApplication {
    constructor() {
      this.currentView = 'atlas';
      this.memoryStationId = 'mutah-expedition';
    }

    init() {
      window.SiragTracker = new ExplorerTracker();

      this.initHijriSync();
      this.bindNavigation();

      window.SiragAtlas?.init();
      window.SiragHijrahQuiz?.init();
      window.SiragBattles?.init();
      window.SiragSanctuaries?.init();
      window.SiragScenarios?.init();
      window.SiragConstellation?.init();
      window.SiragLineage?.init();
      window.SiragDiwanLexicon?.init();
      window.SiragOmni?.init();
      window.SiragMuseum?.init();
      window.SiragKhatmah?.init();
      window.SiragSettings?.init();

      window.SiragTracker.renderScore();
      this.registerPWA();
    }

    bindNavigation() {
      document.querySelectorAll('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-view');
          if (target) this.switchView(target);
        });
      });
    }

    switchView(viewName) {
      this.currentView = viewName;
      if (window.SiragAudio) window.SiragAudio.playClick(490);

      // Stop background autoplays when switching tabs
      if (viewName !== 'atlas') window.SiragAtlas?.stopAutoPlay();
      if (viewName !== 'battles') window.SiragBattles?.stopPlay();
      if (viewName !== 'hijrah') window.SiragHijrahQuiz?.stopHijrahAuto();
      if (viewName !== 'diwan') window.SiragDiwanLexicon?.stopAudio();

      document.querySelectorAll('.view-section').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `view-${viewName}`);
      });

      document.querySelectorAll('.nav-tab, .dock-btn[data-view]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });

      const activeTab = document.querySelector(`.nav-tab[data-view="${viewName}"]`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    initHijriSync() {
      const pillText = document.getElementById('hijri-date-text');
      const memoryBadge = document.getElementById('memory-badge');
      const memoryText = document.getElementById('memory-text');
      const jumpBtn = document.getElementById('memory-jump-btn');

      let hijriMonthNum = 5;
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(now);
        if (pillText) pillText.textContent = formatted;

        const mNumStr = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
          month: 'numeric'
        }).format(now);
        const parsed = parseInt(mNumStr, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) hijriMonthNum = parsed;
      } catch (_) {
        if (pillText) pillText.textContent = 'التقويم الهجري النبوي';
      }

      const events = window.SEERAH_EVENTS || [];
      const matched =
        events.find((e) => e.hijriMonth === hijriMonthNum) ||
        events.find((e) => e.id === 'hijrah-thawr') ||
        events[0];

      if (matched) {
        this.memoryStationId = matched.id;
        if (memoryBadge) memoryBadge.textContent = 'في مثل هذا الشهر الهجري';
        if (memoryText) {
          memoryText.textContent = `تزامن شهري: «${matched.title}» (${matched.yearLabel}) — في ${matched.locationName}`;
        }
      }

      jumpBtn?.addEventListener('click', () => {
        this.switchView('atlas');
        window.SiragAtlas?.jumpToEventById(this.memoryStationId);
      });
    }

    registerPWA() {
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    }
  }

  window.SiragApp = new SiragApplication();
  document.addEventListener('DOMContentLoaded', () => {
    window.SiragApp.init();
  });
})();
