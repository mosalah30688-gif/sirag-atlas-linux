/**
 * Sirag Atlas — Stage 8 Controller:
 * Day-by-Day Secret Hijrah Expedition Tracker + Gamified Seerah Knights Quiz Arena
 */
(function () {
  const QUIZ_STORAGE_KEY = 'sirag_atlas_quiz_v1';

  class HijrahAndKnightsController {
    constructor() {
      this.data = window.SEERAH_HIJRAH_DATA || { team: [], stops: [], quiz: [], badges: [] };
      this.mode = 'hijrah'; // 'hijrah' | 'quiz'
      this.stopIdx = 0;
      this.hijrahTimer = null;

      // Quiz state
      this.quizState = this.loadQuizState();
      this.currentQIdx = 0;
      this.selectedOption = null;
    }

    loadQuizState() {
      try {
        const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return {
        correctIds: [],
        streak: 0,
        bestStreak: 0
      };
    }

    saveQuizState() {
      try {
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(this.quizState));
      } catch (_) {}
      if (window.SiragTracker) window.SiragTracker.renderScore();
    }

    init() {
      this.bindModeSwitch();
      this.render();
    }

    bindModeSwitch() {
      document.querySelectorAll('#hijrah-quiz-subtabs .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.stopHijrahAuto();
          document.querySelectorAll('#hijrah-quiz-subtabs .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.mode = btn.getAttribute('data-hqmode');
          if (window.SiragAudio) window.SiragAudio.playClick(520);
          this.render();
        });
      });
    }

    stopHijrahAuto() {
      if (this.hijrahTimer) {
        clearInterval(this.hijrahTimer);
        this.hijrahTimer = null;
      }
    }

    render() {
      const stage = document.getElementById('hijrah-quiz-stage');
      if (!stage) return;
      if (this.mode === 'hijrah') {
        this.renderHijrahTracker(stage);
      } else {
        this.renderQuizArena(stage);
      }
    }

    renderHijrahTracker(stage) {
      const stops = this.data.stops;
      const cur = stops[this.stopIdx] || stops[0];

      const fullRoutePoints = stops.map((s) => `${s.coords.x},${s.coords.y}`).join(' ');
      const traveledPoints = stops
        .slice(0, this.stopIdx + 1)
        .map((s) => `${s.coords.x},${s.coords.y}`)
        .join(' ');

      const nodesSvg = stops
        .map((s, idx) => {
          const reached = idx <= this.stopIdx;
          const active = idx === this.stopIdx;
          return `
            <g class="hijrah-stop-node" data-sidx="${idx}" transform="translate(${s.coords.x}, ${s.coords.y})" style="cursor:pointer;">
              ${active ? `<circle r="16" fill="rgba(16,185,129,0.25)" stroke="#f5d77f" stroke-width="1.8" class="pulse-ring" />` : ''}
              <circle r="${active ? '8' : '5.5'}" fill="${active ? '#f5d77f' : reached ? '#10b981' : '#1e293b'}" stroke="#f8f4ea" stroke-width="1.5" />
              <text x="${idx % 2 === 0 ? 13 : -13}" y="4" text-anchor="${idx % 2 === 0 ? 'start' : 'end'}"
                    fill="${active ? '#f5d77f' : 'rgba(248,244,234,0.75)'}" font-size="9.5" font-family="Readex Pro, sans-serif">
                ${idx + 1}. ${s.title.split(':')[0].slice(0, 20)}
              </text>
            </g>
          `;
        })
        .join('');

      stage.innerHTML = `
        <div class="atlas-grid">
          <!-- Coastal Hijaz Map + Day Slider -->
          <div class="glass-panel map-stage">
            <div class="map-Hud-top">
              <span class="era-badge">🐪 المسافة المقطوعة: ${cur.km} من 480 كم</span>
              <button class="btn-gold" id="hijrah-autoplay-btn" style="padding:6px 14px; font-size:0.8rem;">
                ${this.hijrahTimer ? '⏸ إيقاف المسير' : '▶ تشغيل مسير الهجرة'}
              </button>
            </div>

            <div class="map-svg-wrapper">
              <svg viewBox="220 65 320 350" style="width:100%; height:auto; max-height:400px;" aria-label="خريطة مسار الهجرة النبوية السري">
                <defs>
                  <linearGradient id="redSeaStrip" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#06182c" />
                    <stop offset="100%" stop-color="#0b1e33" />
                  </linearGradient>
                </defs>
                <rect x="220" y="65" width="320" height="350" rx="14" fill="#0d1726" />
                <!-- Red Sea Coastline on the West -->
                <path d="M220,65 L272,65 L288,165 L302,265 L345,385 L358,415 L220,415 Z" fill="url(#redSeaStrip)" stroke="rgba(56,189,248,0.28)" />
                <text x="252" y="295" fill="rgba(56,189,248,0.5)" font-size="9.5" transform="rotate(68 252,295)" font-family="Readex Pro, sans-serif">ساحل البحر الأحمر</text>

                <!-- Usual Caravan Route (Faint Dashed Reference) -->
                <path d="M432,342 Q418,225 382,102" fill="none" stroke="rgba(239,68,68,0.22)" stroke-width="1.6" stroke-dasharray="4 5" />
                <text x="458" y="228" fill="rgba(239,68,68,0.55)" font-size="8.5" font-family="Readex Pro, sans-serif">طريق القوافل المعتاد (مرصود)</text>

                <!-- Secret Prophetic Route Base & Active Progress -->
                <polyline points="${fullRoutePoints}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="${traveledPoints}" fill="none" stroke="#10b981" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />

                ${nodesSvg}
              </svg>
            </div>

            <div class="time-scrubber-bar">
              <div class="scrubber-header">
                <span class="scrubber-year-display">${cur.dayLabel}</span>
                <span style="color:var(--teal-wahi); font-size:0.82rem;">المحطة ${this.stopIdx + 1} من ${stops.length}</span>
              </div>
              <input type="range" min="0" max="${stops.length - 1}" value="${this.stopIdx}" class="seerah-slider" id="hijrah-day-slider" />
            </div>
          </div>

          <!-- Right Inspector + Secret Team -->
          <div class="glass-panel station-inspector">
            <div>
              <span class="inspector-date">${cur.dayLabel} • ${cur.km} كم من مكة</span>
              <h3 class="inspector-title">${cur.title}</h3>
              <p style="font-size:0.83rem; color:var(--gold-primary); margin-top:4px;">⛰️ التضاريس: ${cur.terrain}</p>
            </div>

            <div class="narrative-box">
              <p>${cur.story}</p>
            </div>

            <div>
              <strong style="display:block; color:var(--gold-bright); margin-bottom:9px; font-size:0.92rem;">
                🕵️‍♂️ خلية التخطيط السرية في الهجرة (تكامل الأدوار):
              </strong>
              <div class="resp-two-col">
                ${this.data.team
                  .map(
                    (m) => `
                  <div style="background:rgba(8,14,24,0.72); border:1px solid var(--border-subtle); border-radius:10px; padding:9px 11px;">
                    <strong style="display:block; font-size:0.8rem; color:var(--teal-wahi);">${m.name}</strong>
                    <span style="display:block; font-size:0.72rem; color:var(--gold-bright); margin-bottom:3px;">${m.role}</span>
                    <p style="font-size:0.74rem; color:var(--text-secondary); line-height:1.5;">${m.detail}</p>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('hijrah-day-slider')?.addEventListener('input', (e) => {
        this.stopHijrahAuto();
        this.stopIdx = parseInt(e.target.value, 10);
        if (window.SiragAudio) window.SiragAudio.playClick(500 + this.stopIdx * 20);
        this.renderHijrahTracker(stage);
      });

      stage.querySelectorAll('.hijrah-stop-node').forEach((n) => {
        n.addEventListener('click', () => {
          this.stopHijrahAuto();
          this.stopIdx = parseInt(n.getAttribute('data-sidx'), 10);
          if (window.SiragAudio) window.SiragAudio.playClick(540);
          this.renderHijrahTracker(stage);
        });
      });

      document.getElementById('hijrah-autoplay-btn')?.addEventListener('click', () => {
        if (this.hijrahTimer) {
          this.stopHijrahAuto();
          this.renderHijrahTracker(stage);
          return;
        }
        this.hijrahTimer = setInterval(() => {
          this.stopIdx = (this.stopIdx + 1) % stops.length;
          if (window.SiragAudio) window.SiragAudio.playClick(520);
          this.renderHijrahTracker(stage);
        }, 3200);
        this.renderHijrahTracker(stage);
      });
    }

    renderQuizArena(stage) {
      const quiz = this.data.quiz;
      const q = quiz[this.currentQIdx] || quiz[0];
      const solvedCount = this.quizState.correctIds.length;

      stage.innerHTML = `
        <div class="atlas-grid">
          <!-- Active Question Card -->
          <div class="glass-panel scenario-stage-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
              <span class="era-badge">مستوى التحدي: ${q.level}</span>
              <span style="color:var(--gold-bright); font-weight:700;">
                🔥 سلسلة الفوز: ${this.quizState.streak} (الأعلى: ${this.quizState.bestStreak})
              </span>
            </div>

            <span class="inspector-date">السؤال ${this.currentQIdx + 1} من ${quiz.length}</span>
            <h3 class="inspector-title" style="font-size:1.42rem; margin:6px 0 16px;">${q.question}</h3>

            <div class="choice-grid">
              ${q.options
                .map((opt, idx) => {
                  let cls = '';
                  if (this.selectedOption !== null) {
                    if (idx === q.correctIndex) cls = 'selected-prophetic';
                    else if (idx === this.selectedOption) cls = 'selected-other';
                  }
                  return `
                    <button class="choice-btn quiz-opt-btn ${cls}" data-opt-idx="${idx}" ${this.selectedOption !== null ? 'disabled' : ''}>
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                        <span>${opt}</span>
                        ${
                          this.selectedOption !== null && idx === q.correctIndex
                            ? '<span style="color:#10b981; font-weight:700;">✅ إجابة صحيحة</span>'
                            : this.selectedOption === idx && idx !== q.correctIndex
                            ? '<span style="color:#ef4444; font-weight:700;">✖ راجع التوثيق</span>'
                            : ''
                        }
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>

            ${
              this.selectedOption !== null
                ? `
              <div class="revelation-outcome">
                <strong style="color:var(--gold-bright); display:block; margin-bottom:5px;">
                  ${this.selectedOption === q.correctIndex ? '🌟 أحسنت يا فارس السيرة!' : '📚 الفائدة التوثيقية:'}
                </strong>
                <p style="margin-bottom:14px;">${q.explanation}</p>
                <button class="btn-gold" id="next-quiz-q-btn">
                  ${this.currentQIdx < quiz.length - 1 ? 'التحدي التالي ←' : 'إعادة الجولة من السؤال الأول ↻'}
                </button>
              </div>
            `
                : ''
            }
          </div>

          <!-- Medals & Progress Board -->
          <div class="glass-panel station-inspector">
            <div>
              <span class="inspector-date">سجل البطولة والأوسمة المحققة</span>
              <h3 class="inspector-title">رصيدك: ${solvedCount} / ${quiz.length}</h3>
            </div>

            <div class="resp-two-col">
              ${this.data.badges
                .map((b) => {
                  const unlocked = solvedCount >= b.threshold;
                  return `
                    <div style="padding:14px; border-radius:14px; border:1px solid ${
                      unlocked ? 'var(--gold-bright)' : 'var(--border-subtle)'
                    }; background:${unlocked ? 'rgba(212,175,55,0.16)' : 'rgba(8,14,24,0.55)'}; opacity:${
                    unlocked ? '1' : '0.48'
                  }; text-align:center;">
                      <div style="font-size:1.8rem; margin-bottom:4px;">${b.icon}</div>
                      <strong style="display:block; color:var(--gold-bright); font-size:0.88rem;">${b.title}</strong>
                      <span style="font-size:0.75rem; color:var(--text-secondary);">${b.desc}</span>
                      <div style="margin-top:5px; font-size:0.72rem; color:${unlocked ? '#10b981' : 'var(--text-muted)'};">
                        ${unlocked ? '🔓 وسام مفتوح!' : '🔒 مقفل'}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div>
              <strong style="display:block; font-size:0.82rem; color:var(--text-secondary); margin-bottom:8px;">
                التنقل السريع بين الأسئلة (12):
              </strong>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${quiz
                  .map((item, idx) => {
                    const done = this.quizState.correctIds.includes(item.id);
                    return `
                      <button class="station-chip ${idx === this.currentQIdx ? 'active' : ''}" data-qjump="${idx}"
                              style="${done && idx !== this.currentQIdx ? 'border-color:#10b981; color:#10b981;' : ''}">
                        ${idx + 1} ${done ? '✓' : ''}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const picked = parseInt(btn.getAttribute('data-opt-idx'), 10);
          this.selectedOption = picked;
          if (picked === q.correctIndex) {
            this.quizState.streak += 1;
            if (this.quizState.streak > this.quizState.bestStreak) {
              this.quizState.bestStreak = this.quizState.streak;
            }
            if (!this.quizState.correctIds.includes(q.id)) {
              this.quizState.correctIds.push(q.id);
            }
            if (window.SiragAudio) window.SiragAudio.playClick(680);
          } else {
            this.quizState.streak = 0;
            if (window.SiragAudio) window.SiragAudio.playClick(260);
          }
          this.saveQuizState();
          this.renderQuizArena(stage);
        });
      });

      document.getElementById('next-quiz-q-btn')?.addEventListener('click', () => {
        this.selectedOption = null;
        this.currentQIdx = (this.currentQIdx + 1) % quiz.length;
        this.renderQuizArena(stage);
      });

      stage.querySelectorAll('[data-qjump]').forEach((chip) => {
        chip.addEventListener('click', () => {
          this.selectedOption = null;
          this.currentQIdx = parseInt(chip.getAttribute('data-qjump'), 10);
          this.renderQuizArena(stage);
        });
      });
    }
  }

  window.SiragHijrahQuiz = new HijrahAndKnightsController();
})();
