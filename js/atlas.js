/**
 * Sirag Atlas — Interactive Chrono-Spatial SVG Map, Time Scrubber, Multi-Depth Reader & Synced Wahi
 */
(function () {
  const ROUTE_PATHS = {
    'makkah-hira': { d: 'M430,318 Q438,310 444,306', color: '#2dd4bf', label: 'طريق التحنث إلى حراء' },
    'makkah-habasha': { d: 'M430,318 L404,335 Q335,382 255,412', color: '#38bdf8', label: 'مسار الهجرة البحرية للحبشة' },
    'makkah-taif': { d: 'M430,318 Q452,330 468,336', color: '#f59e0b', label: 'طريق الطائف وحنين عبر السروات' },
    'makkah-aqsa': { d: 'M430,318 Q365,205 292,88', color: '#2dd4bf', label: 'مسار الإسراء المبارك إلى بيت المقدس' },
    'makkah-madinah-direct': { d: 'M440,315 Q418,268 392,218', color: '#d4af37', label: 'وفود الأنصار بين يثرب ومنى' },
    'hijrah-secret-route': {
      d: 'M430,318 L426,334 Q388,330 364,292 Q352,258 372,232 L392,218',
      color: '#10b981',
      label: 'مسار الهجرة النبوية السري (مكة ← غار ثور ← الساحل ← قباء)'
    },
    'madinah-badr': { d: 'M392,218 Q372,232 358,248', color: '#f59e0b', label: 'مسير يوم الفرقان إلى بدر' },
    'madinah-hudaybiyah': { d: 'M392,218 Q396,272 412,318', color: '#2dd4bf', label: 'مسير العمرة وصلح الحديبية' },
    'madinah-envoys': {
      d: 'M392,218 L325,120 M392,218 L535,142 M392,218 L242,145 M392,218 L255,412',
      color: '#f5d77f',
      label: 'شبكة سفراء النبي ﷺ إلى ملوك العالم'
    },
    'madinah-mutah': { d: 'M392,218 Q355,165 315,112', color: '#ef4444', label: 'بعث مؤتة شمالاً إلى تخوم الشام' },
    'madinah-makkah-fath': { d: 'M392,218 Q410,270 430,318', color: '#f5d77f', label: 'مسير الفتح الأعظم وحجة الوداع' }
  };

  class ChronoAtlas {
    constructor() {
      this.allEvents = window.SEERAH_EVENTS || [];
      this.filteredEvents = [...this.allEvents];
      this.currentIndex = 0;
      this.currentDepth = 'story'; // 'flash' | 'story' | 'scholarly'
      this.currentEra = 'all';
      this.playTimer = null;
      this.quranAudio = null;
    }

    init() {
      this.renderBaseMap();
      this.bindControls();
      this.selectIndex(0, false);
    }

    renderBaseMap() {
      const container = document.getElementById('atlas-map-container');
      if (!container) return;

      const routesSvg = Object.entries(ROUTE_PATHS)
        .map(
          ([id, r]) => `
          <path id="route-${id}" d="${r.d}" fill="none" stroke="${r.color}" stroke-width="2.8"
            class="route-path-animated" opacity="0.12" stroke-linecap="round" />`
        )
        .join('');

      const nodesSvg = this.allEvents
        .map(
          (ev, idx) => `
          <g class="map-node" data-idx="${idx}" transform="translate(${ev.coords.x}, ${ev.coords.y})">
            <circle class="pulse-ring" id="pulse-${ev.id}" r="11" fill="none" stroke="#f5d77f" stroke-width="2" style="display:none" />
            <circle class="node-dot" id="dot-${ev.id}" r="5.5" fill="#172840" stroke="#d4af37" stroke-width="2" />
          </g>`
        )
        .join('');

      container.innerHTML = `
        <svg id="arabia-map-svg" viewBox="180 55 460 400" aria-label="خريطة الجزيرة العربية ومحيط السيرة النبوية">
          <defs>
            <radialGradient id="landGrad" cx="52%" cy="48%" r="60%">
              <stop offset="0%" stop-color="#192a42" />
              <stop offset="100%" stop-color="#0d1726" />
            </radialGradient>
            <linearGradient id="seaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#071525" />
              <stop offset="100%" stop-color="#040b14" />
            </linearGradient>
            <pattern id="astrolabeGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,175,55,0.06)" stroke-width="0.8"/>
            </pattern>
          </defs>

          <!-- Sea & Astrolabe Grid Background -->
          <rect x="180" y="55" width="460" height="400" fill="url(#seaGrad)" rx="14" />
          <rect x="180" y="55" width="460" height="400" fill="url(#astrolabeGrid)" rx="14" />

          <!-- Astrolabe Celestial Compass Rings -->
          <circle cx="410" cy="255" r="165" fill="none" stroke="rgba(212,175,55,0.11)" stroke-dasharray="4 6" />
          <circle cx="410" cy="255" r="110" fill="none" stroke="rgba(212,175,55,0.08)" />

          <!-- Egypt & Abyssinia West Coast -->
          <path d="M180,115 L258,120 L276,175 L312,265 L350,352 L362,408 L322,455 L180,455 Z"
                fill="#111d2f" stroke="rgba(212,175,55,0.22)" stroke-width="1.2" />

          <!-- Arabian Peninsula & Levant Stylized Landmass -->
          <path d="M275,65 L485,65 L548,125 L575,195 L625,255 L615,355 L505,425 L418,418 L385,358 L342,272 L302,182 L288,150 L272,115 Z"
                fill="url(#landGrad)" stroke="rgba(212,175,55,0.38)" stroke-width="1.5" />

          <!-- Hijaz Sarat Mountain Ridge Subtle Relief -->
          <path d="M335,175 Q375,235 415,295 Q448,342 468,382"
                fill="none" stroke="rgba(212,175,55,0.16)" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 9" />

          <!-- Geographic Water & Region Labels -->
          <text x="328" y="325" fill="rgba(56,189,248,0.45)" font-size="9.5" transform="rotate(62 328,325)" font-family="Readex Pro, sans-serif">البحر الأحمر (بحر القلزم)</text>
          <text x="562" y="218" fill="rgba(56,189,248,0.4)" font-size="9" font-family="Readex Pro, sans-serif">الخليج</text>
          <text x="225" y="428" fill="rgba(248,244,234,0.62)" font-size="10.5" font-family="Amiri, serif">الحبشة (أكسوم)</text>
          <text x="212" y="152" fill="rgba(248,244,234,0.55)" font-size="10" font-family="Amiri, serif">مصر</text>
          <text x="520" y="135" fill="rgba(248,244,234,0.55)" font-size="10" font-family="Amiri, serif">فارس والمدائن</text>
          <text x="292" y="78" fill="#2dd4bf" font-size="10.5" text-anchor="middle" font-family="Amiri, serif">بيت المقدس</text>
          <text x="345" y="114" fill="rgba(248,244,234,0.65)" font-size="9.5" font-family="Amiri, serif">مؤتة والشام</text>
          <text x="492" y="255" fill="rgba(248,244,234,0.32)" font-size="12" font-family="Amiri, serif">نجد واليمامة</text>

          <!-- Major Prophetic Anchor Labels -->
          <text x="418" y="214" fill="#f5d77f" font-size="11.5" font-weight="bold" font-family="Amiri, serif">المدينة المنورة</text>
          <text x="458" y="318" fill="#f5d77f" font-size="11.5" font-weight="bold" font-family="Amiri, serif">مكة المكرمة</text>
          <text x="342" y="256" fill="rgba(245,215,127,0.75)" font-size="9.5" font-family="Amiri, serif">بدر</text>
          <text x="488" y="344" fill="rgba(245,215,127,0.75)" font-size="9.5" font-family="Amiri, serif">الطائف</text>

          <!-- Dynamic Routes -->
          <g id="map-routes-layer">${routesSvg}</g>

          <!-- Dynamic Station Nodes -->
          <g id="map-nodes-layer">${nodesSvg}</g>

          <!-- Active Location Callout Pin -->
          <g id="active-map-callout" transform="translate(430, 318)">
            <circle r="15" fill="rgba(212,175,55,0.18)" stroke="#f5d77f" stroke-width="1.5" />
            <circle r="5.5" fill="#f5d77f" />
          </g>
        </svg>
      `;

      container.querySelectorAll('.map-node').forEach((node) => {
        node.addEventListener('click', () => {
          const allIdx = parseInt(node.getAttribute('data-idx'), 10);
          const ev = this.allEvents[allIdx];
          // Reset filter if hidden
          if (!this.filteredEvents.includes(ev)) {
            this.applyFilter('all', '');
          }
          const targetIdx = this.filteredEvents.indexOf(ev);
          if (targetIdx !== -1) this.selectIndex(targetIdx, true);
        });
      });
    }

    bindControls() {
      const scrubber = document.getElementById('time-scrubber');
      if (scrubber) {
        scrubber.addEventListener('input', (e) => {
          this.stopAutoPlay();
          this.selectIndex(parseInt(e.target.value, 10), true);
        });
      }

      document.getElementById('prev-station-btn')?.addEventListener('click', () => {
        this.stopAutoPlay();
        if (this.currentIndex > 0) this.selectIndex(this.currentIndex - 1, true);
      });

      document.getElementById('next-station-btn')?.addEventListener('click', () => {
        this.stopAutoPlay();
        if (this.currentIndex < this.filteredEvents.length - 1) {
          this.selectIndex(this.currentIndex + 1, true);
        }
      });

      document.getElementById('play-journey-btn')?.addEventListener('click', () => {
        this.toggleAutoPlay();
      });

      document.querySelectorAll('#era-filters .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#era-filters .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const era = btn.getAttribute('data-era');
          const query = document.getElementById('atlas-search')?.value || '';
          this.applyFilter(era, query);
        });
      });

      document.getElementById('atlas-search')?.addEventListener('input', (e) => {
        this.applyFilter(this.currentEra, e.target.value);
      });
    }

    applyFilter(era, query) {
      this.stopAutoPlay();
      this.currentEra = era;
      const q = (query || '').trim();
      this.filteredEvents = this.allEvents.filter((ev) => {
        const eraMatch = era === 'all' || ev.era === era;
        const textMatch =
          !q ||
          ev.title.includes(q) ||
          ev.locationName.includes(q) ||
          ev.depths.story.includes(q) ||
          ev.wahi.surah.includes(q) ||
          ev.wahi.ayah.includes(q);
        return eraMatch && textMatch;
      });

      if (this.filteredEvents.length === 0) {
        this.filteredEvents = [...this.allEvents];
      }

      const scrubber = document.getElementById('time-scrubber');
      if (scrubber) {
        scrubber.max = String(Math.max(0, this.filteredEvents.length - 1));
        scrubber.value = '0';
      }
      this.selectIndex(0, false);
    }

    toggleAutoPlay() {
      const btn = document.getElementById('play-journey-btn');
      if (this.playTimer) {
        this.stopAutoPlay();
        return;
      }
      if (btn) {
        btn.textContent = '⏸ إيقاف الرحلة التلقائية';
        btn.classList.add('active');
      }
      this.playTimer = setInterval(() => {
        const next = (this.currentIndex + 1) % this.filteredEvents.length;
        this.selectIndex(next, true);
      }, 4200);
    }

    stopAutoPlay() {
      if (this.playTimer) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
      const btn = document.getElementById('play-journey-btn');
      if (btn) {
        btn.textContent = '▶ تشغيل الرحلة تلقائياً';
        btn.classList.remove('active');
      }
    }

    jumpToEventById(eventId) {
      this.applyFilter('all', '');
      document.querySelectorAll('#era-filters .pill-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-era') === 'all');
      });
      const idx = this.filteredEvents.findIndex((e) => e.id === eventId);
      if (idx !== -1) {
        this.selectIndex(idx, true);
      }
    }

    selectIndex(idx, userTriggered = false) {
      if (!this.filteredEvents.length) return;
      this.currentIndex = Math.max(0, Math.min(idx, this.filteredEvents.length - 1));
      const ev = this.filteredEvents[this.currentIndex];

      if (userTriggered && window.SiragAudio) {
        window.SiragAudio.playClick(480);
        window.SiragAudio.setAmbiance(ev.ambiance || 'calm');
      }

      if (window.SiragTracker) {
        window.SiragTracker.markStationVisited(ev.id);
      }

      // Update Scrubber UI
      const scrubber = document.getElementById('time-scrubber');
      if (scrubber) scrubber.value = String(this.currentIndex);

      const yearLabel = document.getElementById('scrubber-year-label');
      if (yearLabel) yearLabel.textContent = ev.yearLabel;

      const counter = document.getElementById('station-counter');
      if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.filteredEvents.length}`;

      const eraBadge = document.getElementById('map-era-badge');
      if (eraBadge) eraBadge.textContent = `${ev.eraLabel} • ${ev.locationName}`;

      this.renderStationChips();
      this.highlightMapForEvent(ev);
      this.renderInspector(ev);
    }

    renderStationChips() {
      const strip = document.getElementById('station-chips-strip');
      if (!strip) return;
      strip.innerHTML = this.filteredEvents
        .map(
          (ev, i) => `
          <button class="station-chip ${i === this.currentIndex ? 'active' : ''}" data-chip-idx="${i}">
            ${ev.order}. ${ev.title.split(':')[0].slice(0, 24)}
          </button>`
        )
        .join('');

      strip.querySelectorAll('.station-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          this.stopAutoPlay();
          this.selectIndex(parseInt(chip.getAttribute('data-chip-idx'), 10), true);
        });
      });

      const activeChip = strip.querySelector('.station-chip.active');
      if (activeChip) {
        activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    highlightMapForEvent(ev) {
      // Reset routes
      Object.keys(ROUTE_PATHS).forEach((rId) => {
        const pathEl = document.getElementById(`route-${rId}`);
        if (pathEl) {
          const isCurrent = ev.routeId === rId;
          pathEl.setAttribute('opacity', isCurrent ? '0.95' : '0.11');
          pathEl.setAttribute('stroke-width', isCurrent ? '3.6' : '2');
        }
      });

      // Reset dots & highlight visited up to current order
      this.allEvents.forEach((item) => {
        const dot = document.getElementById(`dot-${item.id}`);
        const pulse = document.getElementById(`pulse-${item.id}`);
        if (dot) {
          if (item.id === ev.id) {
            dot.setAttribute('fill', '#f5d77f');
            dot.setAttribute('r', '7.5');
          } else if (item.order < ev.order) {
            dot.setAttribute('fill', '#2dd4bf');
            dot.setAttribute('r', '5.5');
          } else {
            dot.setAttribute('fill', '#172840');
            dot.setAttribute('r', '5');
          }
        }
        if (pulse) {
          pulse.style.display = item.id === ev.id ? 'block' : 'none';
        }
      });

      const callout = document.getElementById('active-map-callout');
      if (callout) {
        callout.setAttribute('transform', `translate(${ev.coords.x}, ${ev.coords.y})`);
      }
    }

    renderInspector(ev) {
      const box = document.getElementById('station-inspector');
      if (!box) return;

      if (this.quranAudio) {
        this.quranAudio.pause();
        this.quranAudio = null;
      }

      const depthText = ev.depths[this.currentDepth] || ev.depths.story;

      let actionButtonsHtml = '';
      if (ev.linkedBattle || ev.linkedScenario) {
        actionButtonsHtml = `<div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${
            ev.linkedBattle
              ? `<button class="btn-gold" id="jump-linked-battle">⚔️ افتح المحاكاة التكتيكية لهذه الغزوة</button>`
              : ''
          }
          ${
            ev.linkedScenario
              ? `<button class="btn-outline" id="jump-linked-scenario">🧭 عِش مجلس الشورى في هذا الموقف</button>`
              : ''
          }
        </div>`;
      }

      box.innerHTML = `
        <div class="inspector-top">
          <div>
            <span class="inspector-date">${ev.yearLabel} • المحطة ${ev.order} من 18</span>
            <h3 class="inspector-title">${ev.title}</h3>
            <p style="font-size:0.83rem; color:var(--text-secondary); margin-top:4px;">📍 ${ev.locationName}</p>
          </div>
          <div class="inspector-actions-row">
            <button class="btn-outline ${window.SiragOmni?.isBookmarked(ev.id) ? 'active' : ''}" id="toggle-bookmark-btn" title="حفظ المحطة في مفضلتي" style="font-size:0.78rem; padding:7px 10px;">
              ${window.SiragOmni?.isBookmarked(ev.id) ? '🔖 محفوظة' : '🔖 حفظ'}
            </button>
            <button class="btn-outline" id="open-golden-poster-btn" title="توليد وتحميل بطاقة ذهبية عالية الدقة لهذا الموقف" style="white-space:nowrap; font-size:0.78rem; padding:7px 11px;">
              🖼️ بطاقة ذهبية
            </button>
          </div>
        </div>

        <!-- 3 Reading Depth Switcher -->
        <div class="depth-switcher" role="tablist" aria-label="مستوى عمق القراءة">
          <button class="depth-btn ${this.currentDepth === 'flash' ? 'active' : ''}" data-depth="flash">⚡ ومضة (30 ث)</button>
          <button class="depth-btn ${this.currentDepth === 'story' ? 'active' : ''}" data-depth="story">📖 القصة الكاملة</button>
          <button class="depth-btn ${this.currentDepth === 'scholarly' ? 'active' : ''}" data-depth="scholarly">🔍 تحقيق ومصادر</button>
        </div>

        <div class="narrative-box">${depthText}</div>

        ${actionButtonsHtml}

        <!-- Synced Quranic Wahi Box -->
        <div class="wahi-card">
          <div class="wahi-header">
            <span class="wahi-badge">✨ نبض الوحي المتزامن • ${ev.wahi.surah}</span>
            <button class="btn-outline" id="play-ayah-btn" style="padding:4px 11px; font-size:0.76rem;">
              🔊 استمع للآية
            </button>
          </div>
          <p class="wahi-ayah">${ev.wahi.ayah}</p>
          <p class="wahi-context">${ev.wahi.context}</p>
          <p id="ayah-audio-status" style="font-size:0.74rem; color:var(--teal-wahi); margin-top:6px; display:none;"></p>
        </div>

        <!-- Past vs Today Geographic Comparison -->
        <div class="then-now-card">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <strong style="color:var(--gold-bright);">🧭 مقارنة المكان: الماضي × اليوم</strong>
          </div>
          <div class="then-now-grid">
            <div class="then-now-col">
              <strong>في العهد النبوي الشريف</strong>
              <span>${ev.thenNow.then}</span>
            </div>
            <div class="then-now-col">
              <strong>المعلم الجغرافي اليوم</strong>
              <span>${ev.thenNow.now}</span>
            </div>
          </div>
        </div>
      `;

      box.querySelectorAll('.depth-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.currentDepth = btn.getAttribute('data-depth');
          if (window.SiragAudio) window.SiragAudio.playClick(580);
          this.renderInspector(ev);
        });
      });

      document.getElementById('play-ayah-btn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const statusEl = document.getElementById('ayah-audio-status');
        if (this.quranAudio && !this.quranAudio.paused) {
          this.quranAudio.pause();
          btn.textContent = '🔊 استمع للآية';
          if (statusEl) statusEl.style.display = 'none';
          return;
        }
        const url = `https://everyayah.com/data/Alafasy_128kbps/${ev.wahi.audioCode}.mp3`;
        this.quranAudio = new Audio(url);
        btn.textContent = '⏳ جاري التحميل...';
        this.quranAudio
          .play()
          .then(() => {
            btn.textContent = '⏹ إيقاف التلاوة';
            if (statusEl) {
              statusEl.textContent = 'تلاوة الشيخ مشاري راشد العفاسي';
              statusEl.style.display = 'block';
            }
          })
          .catch(() => {
            btn.textContent = '🔊 استمع للآية';
            if (statusEl) {
              statusEl.textContent = 'التلاوة الصوتية تتطلب اتصالاً مباشراً بالإنترنت (النص القرآني متاح أوفلاين بالكامل).';
              statusEl.style.display = 'block';
            }
          });
        this.quranAudio.onended = () => {
          btn.textContent = '🔊 استمع للآية';
        };
      });

      document.getElementById('toggle-bookmark-btn')?.addEventListener('click', () => {
        if (window.SiragAudio) window.SiragAudio.playClick(600);
        window.SiragOmni?.toggleBookmark(ev.id);
        this.renderInspector(ev);
      });

      document.getElementById('open-golden-poster-btn')?.addEventListener('click', () => {
        window.SiragPoster?.openForStation(ev);
      });

      document.getElementById('jump-linked-battle')?.addEventListener('click', () => {
        if (window.SiragApp && ev.linkedBattle) {
          window.SiragApp.switchView('battles');
          window.SiragBattles?.selectBattle(ev.linkedBattle);
        }
      });

      document.getElementById('jump-linked-scenario')?.addEventListener('click', () => {
        if (window.SiragApp && ev.linkedScenario) {
          window.SiragApp.switchView('scenarios');
          window.SiragScenarios?.selectScenario(ev.linkedScenario);
        }
      });
    }
  }

  window.SiragAtlas = new ChronoAtlas();
})();
