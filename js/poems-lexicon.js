/**
 * Sirag Atlas — Stage 13 Controller:
 * 1) Synchronized Audio Player for Authenticated Sahaba Poems (Bundled Studio Spoken MP3s — No Music)
 * 2) Interactive Searchable Lexicon of Seerah Places & Classical Terms
 */
(function () {
  class DiwanAndLexicon {
    constructor() {
      this.data = window.SEERAH_DIWAN_LEXICON || { poems: [], lexicon: [] };
      this.subMode = 'diwan'; // 'diwan' | 'lexicon'
      this.currentPoem = this.data.poems[0] || null;
      this.audio = null;
      this.isPlaying = false;
      this.autoAdvance = true;
      this.speed = 1.0;

      // Lexicon filters
      this.lexCat = 'all';
      this.lexQuery = '';
    }

    init() {
      this.bindSubTabs();
      this.render();
    }

    bindSubTabs() {
      document.querySelectorAll('#diwan-lex-subtabs .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#diwan-lex-subtabs .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.subMode = btn.getAttribute('data-dlmode');
          if (this.subMode !== 'diwan') this.stopAudio();
          if (window.SiragAudio) window.SiragAudio.playClick(530);
          this.render();
        });
      });
    }

    stopAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      this.isPlaying = false;
    }

    render() {
      const holder = document.getElementById('diwan-lexicon-stage');
      if (!holder) return;
      if (this.subMode === 'diwan') {
        this.renderDiwan(holder);
      } else {
        this.renderLexicon(holder);
      }
    }

    renderDiwan(holder) {
      const p = this.currentPoem || this.data.poems[0];
      if (!p) return;

      holder.innerHTML = `
        <div class="scenario-layout">
          <!-- Poem Playlist Sidebar -->
          <div class="scenario-list">
            ${this.data.poems
              .map(
                (item, idx) => `
                <button class="scenario-nav-item ${item.id === p.id ? 'active' : ''}" data-poem-id="${item.id}">
                  <div style="display:flex; justify-content:space-between; font-size:0.74rem; color:var(--gold-primary); margin-bottom:4px;">
                    <span>قصيدة ${idx + 1} من ${this.data.poems.length}</span>
                    <span>🎙️ إلقاء فصيح</span>
                  </div>
                  <strong style="font-size:0.93rem; display:block; margin-bottom:2px;">${item.title}</strong>
                  <span style="font-size:0.76rem; color:var(--text-secondary);">${item.poet.split('رضي')[0]}</span>
                </button>
              `
              )
              .join('')}
          </div>

          <!-- Synchronized Audio & Poetic Verses Stage -->
          <div class="glass-panel scenario-stage-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
              <div>
                <span class="inspector-date">🎙️ إلقاء شعري عربي فصيح (بدون موسيقى) • ${p.poet}</span>
                <h3 class="inspector-title" style="margin-top:4px;">«${p.title}»</h3>
              </div>
              <button class="btn-outline ${this.autoAdvance ? 'active' : ''}" id="toggle-auto-next" style="font-size:0.76rem; padding:6px 12px;">
                🔁 تشغيل الديوان متتالياً: ${this.autoAdvance ? 'مفعّل' : 'متوقف'}
              </button>
            </div>

            <!-- Custom Golden Audio Player Box -->
            <div style="background:rgba(7,12,20,0.78); border:1px solid var(--border-gold); border-radius:16px; padding:16px 18px; margin-bottom:18px;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <button class="btn-gold" id="poem-play-btn" style="min-width:148px;">
                    ${this.isPlaying ? '⏸ إيقاف مؤقت' : '▶ استمع للإلقاء'}
                  </button>
                  <button class="btn-outline" id="poem-replay-btn" style="padding:8px 12px;" title="إعادة من البداية">↺</button>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                  <span id="poem-time-label" style="font-size:0.82rem; color:var(--gold-bright); font-variant-numeric:tabular-nums;">00:00 / 00:00</span>
                  <button class="btn-outline" id="poem-speed-btn" style="padding:5px 10px; font-size:0.76rem;">السرعة: ${this.speed}x</button>
                </div>
              </div>

              <input type="range" min="0" max="100" value="0" step="0.5" class="seerah-slider" id="poem-seek-bar" aria-label="شريط تقدم القصيدة" />
            </div>

            <!-- Synchronized Two-Column Classical Arabic Couplets -->
            <div id="poem-verses-box" style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
              ${p.verses
                .map(
                  (v, vIdx) => `
                  <div class="poem-couplet" data-vidx="${vIdx}">
                    <span class="sadr-cell">${v.sadr}</span>
                    <span style="color:var(--gold-primary); font-size:0.95rem;">✦</span>
                    <span class="ajuz-cell">${v.ajuz}</span>
                  </div>
                `
                )
                .join('')}
            </div>

            <div class="wahi-card" style="margin-bottom:12px;">
              <span class="wahi-badge">📚 مناسبة القصيدة وتوثيقها الحديثي والتاريخي</span>
              <p style="margin-top:6px; font-size:0.88rem; line-height:1.75;">
                <strong>المناسبة:</strong> ${p.occasion}<br/>
                <strong>المصدر:</strong> ${p.source}
              </p>
            </div>

            <div class="then-now-card">
              <strong style="color:var(--gold-bright);">💡 إضاءة لغوية وبلاغية:</strong>
              <p style="margin-top:4px; color:var(--text-secondary);">${p.vocabNote}</p>
            </div>
          </div>
        </div>
      `;

      holder.querySelectorAll('[data-poem-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-poem-id');
          const wasPlaying = this.isPlaying;
          this.stopAudio();
          this.currentPoem = this.data.poems.find((x) => x.id === id) || p;
          this.renderDiwan(holder);
          if (wasPlaying) this.startPoemPlayback();
        });
      });

      document.getElementById('poem-play-btn')?.addEventListener('click', () => {
        if (this.audio && !this.audio.paused) {
          this.audio.pause();
          this.isPlaying = false;
          const btn = document.getElementById('poem-play-btn');
          if (btn) btn.textContent = '▶ متابعة الإلقاء';
        } else {
          this.startPoemPlayback();
        }
      });

      document.getElementById('poem-replay-btn')?.addEventListener('click', () => {
        this.stopAudio();
        this.startPoemPlayback();
      });

      document.getElementById('poem-speed-btn')?.addEventListener('click', (e) => {
        const speeds = [0.9, 1.0, 1.15];
        const nextIdx = (speeds.indexOf(this.speed) + 1) % speeds.length;
        this.speed = speeds[nextIdx];
        if (this.audio) this.audio.playbackRate = this.speed;
        e.currentTarget.textContent = `السرعة: ${this.speed}x`;
      });

      document.getElementById('toggle-auto-next')?.addEventListener('click', () => {
        this.autoAdvance = !this.autoAdvance;
        this.renderDiwan(holder);
      });

      document.getElementById('poem-seek-bar')?.addEventListener('input', (e) => {
        if (this.audio && this.audio.duration) {
          const pct = parseFloat(e.target.value);
          this.audio.currentTime = (pct / 100) * this.audio.duration;
        }
      });
    }

    startPoemPlayback() {
      const p = this.currentPoem;
      if (!p) return;

      // Pause background ambient sound if user wants crisp voice, or keep subtle — audio plays clearly over low ambiance
      if (!this.audio) {
        this.audio = new Audio(p.audioSrc);
        this.audio.playbackRate = this.speed;

        this.audio.addEventListener('timeupdate', () => {
          if (!this.audio || !this.audio.duration) return;
          const cur = this.audio.currentTime;
          const dur = this.audio.duration;
          const pct = (cur / dur) * 100;

          const seek = document.getElementById('poem-seek-bar');
          if (seek) seek.value = String(pct);

          const label = document.getElementById('poem-time-label');
          if (label) label.textContent = `${this.fmtTime(cur)} / ${this.fmtTime(dur)}`;

          // Highlight active couplet proportionally!
          const activeVerseIdx = Math.min(
            p.verses.length - 1,
            Math.floor((cur / dur) * p.verses.length)
          );
          document.querySelectorAll('.poem-couplet').forEach((el) => {
            const idx = parseInt(el.getAttribute('data-vidx'), 10);
            const active = idx === activeVerseIdx;
            el.style.borderColor = active ? '#f5d77f' : 'var(--border-subtle)';
            el.style.background = active ? 'rgba(212,175,55,0.2)' : 'rgba(15,26,44,0.62)';
            el.style.transform = active ? 'scale(1.015)' : 'scale(1)';
          });
        });

        this.audio.addEventListener('ended', () => {
          this.isPlaying = false;
          const btn = document.getElementById('poem-play-btn');
          if (btn) btn.textContent = '▶ استمع للإلقاء';
          if (this.autoAdvance) {
            const curIdx = this.data.poems.findIndex((x) => x.id === p.id);
            const nextIdx = (curIdx + 1) % this.data.poems.length;
            if (nextIdx !== 0) {
              this.stopAudio();
              this.currentPoem = this.data.poems[nextIdx];
              const holder = document.getElementById('diwan-lexicon-stage');
              if (holder) this.renderDiwan(holder);
              this.startPoemPlayback();
            }
          }
        });
      }

      this.audio.play().then(() => {
        this.isPlaying = true;
        const btn = document.getElementById('poem-play-btn');
        if (btn) btn.textContent = '⏸ إيقاف مؤقت';
      }).catch(() => {});
    }

    fmtTime(sec) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    /* ============ INTERACTIVE LEXICON ============ */
    renderLexicon(holder) {
      const q = this.lexQuery.trim();
      const filtered = this.data.lexicon.filter((item) => {
        const catOk = this.lexCat === 'all' || item.cat === this.lexCat;
        const qOk = !q || item.term.includes(q) || item.meaning.includes(q) || item.vocalized.includes(q);
        return catOk && qOk;
      });

      holder.innerHTML = `
        <div class="glass-panel" style="padding:18px; margin-bottom:18px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div class="filter-pills" id="lex-cat-pills">
            <button class="pill-btn ${this.lexCat === 'all' ? 'active' : ''}" data-lcat="all">الكل (${this.data.lexicon.length})</button>
            <button class="pill-btn ${this.lexCat === 'places' ? 'active' : ''}" data-lcat="places">⛰️ معالم وأماكن</button>
            <button class="pill-btn ${this.lexCat === 'terms' ? 'active' : ''}" data-lcat="terms">📜 غريب الألفاظ</button>
            <button class="pill-btn ${this.lexCat === 'systems' ? 'active' : ''}" data-lcat="systems">🛡️ نظم وأدوات نبوية</button>
          </div>
          <div class="search-box" style="min-width:280px;">
            <input type="search" id="lexicon-search-input" value="${this.lexQuery.replace(/"/g, '&quot;')}"
                   placeholder="ابحث عن لفظ أو موضع (مثل: التحنث، الأخشبان، إيلياء)..." />
          </div>
        </div>

        <div class="museum-grid">
          ${filtered
            .map(
              (item) => `
              <article class="glass-panel" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
                <div>
                  <span class="era-badge" style="font-size:0.72rem; margin-bottom:8px;">
                    ${item.cat === 'places' ? '⛰️ موضع جغرافي' : item.cat === 'terms' ? '📜 غريب السيرة' : '🛡️ نظام أو أداة'}
                  </span>
                  <h3 class="inspector-title" style="font-size:1.38rem; margin-bottom:3px;">${item.vocalized}</h3>
                  <p style="font-size:0.9rem; line-height:1.8; color:var(--text-ivory); margin-top:8px;">${item.meaning}</p>
                </div>
                ${
                  item.linkedEvent
                    ? `<button class="btn-outline lex-jump-btn" data-ev="${item.linkedEvent}" style="font-size:0.78rem; width:100%;">
                        🗺️ انتقل للمحطة المرتبطة على الأطلس ←
                      </button>`
                    : ''
                }
              </article>
            `
            )
            .join('')}
        </div>
      `;

      holder.querySelectorAll('[data-lcat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.lexCat = btn.getAttribute('data-lcat');
          if (window.SiragAudio) window.SiragAudio.playClick(520);
          this.renderLexicon(holder);
        });
      });

      const input = document.getElementById('lexicon-search-input');
      input?.addEventListener('input', (e) => {
        this.lexQuery = e.target.value;
        const pos = e.target.selectionStart;
        this.renderLexicon(holder);
        const newInput = document.getElementById('lexicon-search-input');
        if (newInput) {
          newInput.focus();
          try { newInput.setSelectionRange(pos, pos); } catch (_) {}
        }
      });

      holder.querySelectorAll('.lex-jump-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const evId = btn.getAttribute('data-ev');
          window.SiragApp?.switchView('atlas');
          window.SiragAtlas?.jumpToEventById(evId);
        });
      });
    }
  }

  window.SiragDiwanLexicon = new DiwanAndLexicon();
})();
