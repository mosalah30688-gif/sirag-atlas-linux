/**
 * Sirag Atlas — Stage 10 Controller:
 * 1) Practical Prophetic Guidance View (with interactive Sunnah habit tracker)
 * 2) Global Omni-Search & Personal Bookmarks Modal (Ctrl+K / Header Button)
 */
(function () {
  const BOOKMARKS_KEY = 'sirag_atlas_bookmarks_v1';
  const SUNNAH_KEY = 'sirag_atlas_sunnah_done_v1';

  class GuidanceAndOmniSearch {
    constructor() {
      this.guidance = window.SEERAH_GUIDANCE || [];
      this.activeCat = 'all';
      this.bookmarks = this.loadArray(BOOKMARKS_KEY);
      this.sunnahDone = this.loadArray(SUNNAH_KEY);
    }

    loadArray(key) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return [];
    }

    saveArray(key, arr) {
      try {
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (_) {}
    }

    init() {
      this.bindGuidanceFilters();
      this.renderGuidance();
      this.bindOmniSearch();
    }

    /* ============ BOOKMARKS API ============ */
    isBookmarked(stationId) {
      return this.bookmarks.includes(stationId);
    }

    toggleBookmark(stationId) {
      if (this.bookmarks.includes(stationId)) {
        this.bookmarks = this.bookmarks.filter((id) => id !== stationId);
      } else {
        this.bookmarks.push(stationId);
      }
      this.saveArray(BOOKMARKS_KEY, this.bookmarks);
      return this.isBookmarked(stationId);
    }

    /* ============ GUIDANCE VIEW ============ */
    bindGuidanceFilters() {
      document.querySelectorAll('#guidance-filters .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#guidance-filters .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeCat = btn.getAttribute('data-gcat');
          if (window.SiragAudio) window.SiragAudio.playClick(530);
          this.renderGuidance();
        });
      });
    }

    renderGuidance() {
      const holder = document.getElementById('guidance-grid-holder');
      const counterEl = document.getElementById('sunnah-applied-counter');
      if (counterEl) {
        counterEl.textContent = `🌟 سنن عملية طبّقتها اليوم: ${this.sunnahDone.length} من ${this.guidance.length}`;
      }
      if (!holder) return;

      const list = this.guidance.filter((g) => this.activeCat === 'all' || g.category === this.activeCat);

      holder.innerHTML = `
        <div class="museum-grid">
          ${list
            .map((g) => {
              const done = this.sunnahDone.includes(g.id);
              return `
                <article class="glass-panel" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; gap:12px; border-color:${
                  done ? '#10b981' : 'var(--border-gold)'
                };">
                  <div>
                    <span class="era-badge" style="font-size:0.74rem; margin-bottom:10px;">${g.categoryLabel}</span>
                    <h3 class="inspector-title" style="font-size:1.28rem; margin-bottom:8px;">${g.title}</h3>
                    <div class="relic-manuscript" style="font-size:1rem; margin:8px 0;">${g.hadith}</div>
                    <p style="font-size:0.88rem; line-height:1.75; color:var(--text-ivory); margin-bottom:10px;">${g.insight}</p>
                    <div style="background:rgba(45,212,191,0.09); border-right:3px solid var(--teal-wahi); padding:10px 12px; border-radius:9px; font-size:0.84rem;">
                      <strong style="color:var(--teal-wahi); display:block; margin-bottom:3px;">🎯 خطوة عملية ليومك:</strong>
                      <span>${g.actionToday}</span>
                    </div>
                  </div>
                  <button class="${done ? 'btn-gold' : 'btn-outline'} toggle-sunnah-btn" data-gid="${g.id}" style="width:100%;">
                    ${done ? '✅ طبّقتُ هذه السنّة المباركة اليوم' : '☐ علّم كسُنّة مطبّقة اليوم'}
                  </button>
                </article>
              `;
            })
            .join('')}
        </div>
      `;

      holder.querySelectorAll('.toggle-sunnah-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const gid = btn.getAttribute('data-gid');
          if (this.sunnahDone.includes(gid)) {
            this.sunnahDone = this.sunnahDone.filter((x) => x !== gid);
          } else {
            this.sunnahDone.push(gid);
          }
          if (window.SiragAudio) window.SiragAudio.playClick(640);
          this.saveArray(SUNNAH_KEY, this.sunnahDone);
          this.renderGuidance();
        });
      });
    }

    /* ============ GLOBAL OMNI-SEARCH & BOOKMARKS MODAL ============ */
    bindOmniSearch() {
      document.getElementById('omni-search-btn')?.addEventListener('click', () => {
        this.openOmniModal();
      });

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.openOmniModal();
        }
      });
    }

    openOmniModal() {
      if (window.SiragAudio) window.SiragAudio.playClick(560);
      const modal = document.getElementById('relic-modal');
      const content = document.getElementById('relic-modal-content');
      if (!modal || !content) return;

      const bookmarkedEvents = (window.SEERAH_EVENTS || []).filter((e) => this.bookmarks.includes(e.id));

      content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:14px;">
          <div>
            <span class="inspector-date">🔍 الكشّاف الفوري الشامل والمحفوظات (Ctrl+K)</span>
            <h3 class="inspector-title" style="font-size:1.35rem;">ابحث في كل أرجاء السيرة</h3>
          </div>
          <button class="btn-outline" id="close-omni-modal">✕ إغلاق</button>
        </div>

        <input type="search" id="omni-query-input"
               placeholder="اكتب اسم حدث، آية، غزوة، صحابي، وثيقة، أو خلق نبوي..."
               style="width:100%; background:#09111e; border:1.5px solid var(--gold-primary); border-radius:12px; padding:12px 16px; color:var(--text-ivory); font-family:var(--font-ui); font-size:0.95rem; outline:none; margin-bottom:14px;" />

        <div id="omni-bookmarks-strip" style="margin-bottom:14px; ${bookmarkedEvents.length ? '' : 'display:none;'}">
          <strong style="display:block; font-size:0.82rem; color:var(--gold-bright); margin-bottom:7px;">🔖 المحطات المحفوظة في مفضلتك (${bookmarkedEvents.length}):</strong>
          <div style="display:flex; flex-wrap:wrap; gap:7px;">
            ${bookmarkedEvents
              .map(
                (ev) => `
              <button class="btn-outline omni-jump" data-type="event" data-id="${ev.id}" style="font-size:0.78rem; padding:5px 11px;">
                🔖 ${ev.title.split(':')[0]}
              </button>`
              )
              .join('')}
          </div>
        </div>

        <div id="omni-results-box" style="display:flex; flex-direction:column; gap:8px; max-height:360px; overflow-y:auto;">
          <p style="font-size:0.84rem; color:var(--text-secondary);">ابدأ بالكتابة للبحث الفوري في 18 محطة، 6 غزوات، 16 صحابياً، 6 وثائق، و10 بطاقات هدي نبوي...</p>
        </div>
      `;

      modal.classList.add('open');

      document.getElementById('close-omni-modal')?.addEventListener('click', () => {
        modal.classList.remove('open');
      });

      const input = document.getElementById('omni-query-input');
      setTimeout(() => input?.focus(), 60);

      input?.addEventListener('input', (e) => {
        this.renderOmniResults(e.target.value, modal);
      });

      content.querySelectorAll('.omni-jump').forEach((btn) => {
        btn.addEventListener('click', () => {
          modal.classList.remove('open');
          this.executeJump(btn.getAttribute('data-type'), btn.getAttribute('data-id'));
        });
      });
    }

    renderOmniResults(rawQuery, modal) {
      const box = document.getElementById('omni-results-box');
      if (!box) return;
      const q = (rawQuery || '').trim();
      if (!q) {
        box.innerHTML = `<p style="font-size:0.84rem; color:var(--text-secondary);">ابدأ بالكتابة للبحث الفوري في كل الأقسام...</p>`;
        return;
      }

      const hits = [];

      (window.SEERAH_EVENTS || []).forEach((ev) => {
        if (ev.title.includes(q) || ev.depths.story.includes(q) || ev.wahi.ayah.includes(q) || ev.locationName.includes(q)) {
          hits.push({ type: 'event', id: ev.id, badge: '🗺️ محطة أطلس', title: ev.title, sub: `${ev.yearLabel} • ${ev.wahi.surah}` });
        }
      });

      (window.SEERAH_BATTLES || []).forEach((b) => {
        if (b.title.includes(q) || b.terrainSummary.includes(q) || b.phases.some((p) => p.analysis.includes(q))) {
          hits.push({ type: 'battle', id: b.id, badge: '⚔️ محاكي غزوة', title: b.title, sub: b.date });
        }
      });

      (window.SEERAH_COMPANIONS || []).forEach((c) => {
        if (c.name.includes(q) || c.title.includes(q) || c.bio.includes(q)) {
          hits.push({ type: 'companion', id: c.id, badge: '✨ صحابي جليل', title: c.name, sub: c.title });
        }
      });

      (window.SEERAH_RELICS || []).forEach((r) => {
        if (r.title.includes(q) || r.fullText.includes(q)) {
          hits.push({ type: 'relic', id: r.id, badge: '📜 وثيقة بالمتحف', title: r.title, sub: r.year });
        }
      });

      this.guidance.forEach((g) => {
        if (g.title.includes(q) || g.hadith.includes(q) || g.insight.includes(q)) {
          hits.push({ type: 'guidance', id: g.id, badge: '💎 هدي تطبيقي', title: g.title, sub: g.categoryLabel });
        }
      });

      (window.SEERAH_DIWAN_LEXICON?.poems || []).forEach((p) => {
        if (p.title.includes(q) || p.poet.includes(q) || p.verses.some((v) => v.sadr.includes(q) || v.ajuz.includes(q))) {
          hits.push({ type: 'poem', id: p.id, badge: '🎙️ ديوان مسموع', title: p.title, sub: p.poet });
        }
      });

      (window.SEERAH_DIWAN_LEXICON?.lexicon || []).forEach((lx) => {
        if (lx.term.includes(q) || lx.vocalized.includes(q) || lx.meaning.includes(q)) {
          hits.push({ type: 'lexicon', id: lx.term, badge: '📖 معجم السيرة', title: lx.vocalized, sub: lx.meaning.slice(0, 75) + '...' });
        }
      });

      if (!hits.length) {
        box.innerHTML = `<p style="font-size:0.86rem; color:var(--amber-warn);">لا توجد نتائج مطابقة لـ «${q}» — جرّب كلمة مثل: بدر، الهجرة، خديجة، الرفق، هرقل، العلق.</p>`;
        return;
      }

      box.innerHTML = hits
        .slice(0, 14)
        .map(
          (h) => `
          <button class="scenario-nav-item omni-hit-btn" data-type="${h.type}" data-id="${h.id}" style="padding:11px 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <strong style="color:var(--gold-bright); font-size:0.92rem;">${h.title}</strong>
              <span class="era-badge" style="font-size:0.7rem; padding:2px 9px;">${h.badge}</span>
            </div>
            <span style="font-size:0.78rem; color:var(--text-secondary);">${h.sub}</span>
          </button>
        `
        )
        .join('');

      box.querySelectorAll('.omni-hit-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          modal.classList.remove('open');
          this.executeJump(btn.getAttribute('data-type'), btn.getAttribute('data-id'));
        });
      });
    }

    executeJump(type, id) {
      if (type === 'event') {
        window.SiragApp?.switchView('atlas');
        window.SiragAtlas?.jumpToEventById(id);
      } else if (type === 'battle') {
        window.SiragApp?.switchView('battles');
        window.SiragBattles?.selectBattle(id);
      } else if (type === 'companion') {
        window.SiragApp?.switchView('constellation');
        window.SiragConstellation?.selectCompanion(id, true);
      } else if (type === 'relic') {
        window.SiragApp?.switchView('museum');
        setTimeout(() => window.SiragMuseum?.openRelicModal(id), 120);
      } else if (type === 'guidance') {
        window.SiragApp?.switchView('guidance');
      } else if (type === 'poem') {
        window.SiragApp?.switchView('diwan');
        if (window.SiragDiwanLexicon) {
          window.SiragDiwanLexicon.subMode = 'diwan';
          const found = window.SiragDiwanLexicon.data.poems.find((x) => x.id === id);
          if (found) window.SiragDiwanLexicon.currentPoem = found;
          window.SiragDiwanLexicon.render();
        }
      } else if (type === 'lexicon') {
        window.SiragApp?.switchView('diwan');
        if (window.SiragDiwanLexicon) {
          window.SiragDiwanLexicon.subMode = 'lexicon';
          window.SiragDiwanLexicon.lexQuery = id;
          document.querySelectorAll('#diwan-lex-subtabs .pill-btn').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-dlmode') === 'lexicon');
          });
          window.SiragDiwanLexicon.render();
        }
      }
    }
  }

  window.SiragOmni = new GuidanceAndOmniSearch();
})();
