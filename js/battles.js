/**
 * Sirag Atlas — Step-by-Step Tactical Battle Simulator Controller
 */
(function () {
  class TacticalSimulator {
    constructor() {
      this.battles = window.SEERAH_BATTLES || [];
      this.currentBattle = this.battles[0] || null;
      this.currentPhaseIdx = 0;
      this.playTimer = null;
    }

    init() {
      this.renderBattleSelector();
      this.bindControls();
      if (this.currentBattle) {
        this.selectBattle(this.currentBattle.id);
      }
    }

    renderBattleSelector() {
      const bar = document.getElementById('battle-selector-bar');
      if (!bar) return;
      bar.innerHTML = this.battles
        .map(
          (b) => `
          <button class="btn-outline battle-tab-btn" data-battle-id="${b.id}">
            ⚔️ ${b.title}
          </button>`
        )
        .join('');

      bar.querySelectorAll('.battle-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.stopPlay();
          this.selectBattle(btn.getAttribute('data-battle-id'));
        });
      });
    }

    bindControls() {
      document.getElementById('battle-prev-btn')?.addEventListener('click', () => {
        this.stopPlay();
        if (this.currentPhaseIdx > 0) this.setPhase(this.currentPhaseIdx - 1, true);
      });

      document.getElementById('battle-next-btn')?.addEventListener('click', () => {
        this.stopPlay();
        if (this.currentBattle && this.currentPhaseIdx < this.currentBattle.phases.length - 1) {
          this.setPhase(this.currentPhaseIdx + 1, true);
        }
      });

      document.getElementById('battle-play-btn')?.addEventListener('click', () => {
        this.togglePlay();
      });
    }

    togglePlay() {
      const btn = document.getElementById('battle-play-btn');
      if (this.playTimer) {
        this.stopPlay();
        return;
      }
      if (!this.currentBattle) return;
      if (btn) btn.textContent = '⏸ إيقاف المحاكاة';
      this.playTimer = setInterval(() => {
        const next = (this.currentPhaseIdx + 1) % this.currentBattle.phases.length;
        this.setPhase(next, true);
      }, 3600);
    }

    stopPlay() {
      if (this.playTimer) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
      const btn = document.getElementById('battle-play-btn');
      if (btn) btn.textContent = '▶ تشغيل التحريك التكتيكي';
    }

    selectBattle(battleId) {
      const found = this.battles.find((b) => b.id === battleId);
      if (!found) return;
      this.currentBattle = found;
      this.currentPhaseIdx = 0;

      document.querySelectorAll('.battle-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-battle-id') === battleId);
      });

      if (window.SiragTracker) {
        window.SiragTracker.markBattleExplored(battleId);
      }

      this.renderBoardSkeleton();
      this.setPhase(0, false);
    }

    renderBoardSkeleton() {
      const holder = document.getElementById('tactical-map-holder');
      if (!holder || !this.currentBattle) return;

      holder.innerHTML = `
        <svg id="tactical-svg" viewBox="0 0 640 400" aria-label="لوحة المحاكاة التكتيكية">
          <defs>
            <pattern id="tacGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(212,175,55,0.06)" stroke-width="0.8"/>
            </pattern>
            <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
            </marker>
            <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#ef4444" />
            </marker>
            <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="#f5d77f" />
            </marker>
          </defs>

          <rect width="640" height="400" fill="url(#tacGrid)" />

          <!-- Terrain Layer -->
          <g id="tactical-terrain-layer">${this.currentBattle.terrainSvg}</g>

          <!-- Movement Vectors Layer -->
          <g id="tactical-arrows-layer"></g>

          <!-- Units Layer -->
          <g id="tactical-units-layer"></g>

          <!-- Map Legend -->
          <g transform="translate(18, 368)">
            <circle cx="8" cy="8" r="6" fill="#f5d77f" />
            <text x="20" y="12" fill="#f8f4ea" font-size="10" font-family="Readex Pro, sans-serif">القيادة النبوية ﷺ</text>
            <rect x="118" y="2" width="12" height="12" rx="3" fill="#10b981" />
            <text x="136" y="12" fill="#f8f4ea" font-size="10" font-family="Readex Pro, sans-serif">وحدات المسلمين</text>
            <polygon points="238,2 245,8 238,14 231,8" fill="#ef4444" />
            <text x="252" y="12" fill="#f8f4ea" font-size="10" font-family="Readex Pro, sans-serif">قوات الخصوم</text>
          </g>
        </svg>
      `;
    }

    setPhase(phaseIdx, sound = false) {
      if (!this.currentBattle) return;
      this.currentPhaseIdx = phaseIdx;
      const phase = this.currentBattle.phases[phaseIdx];
      if (!phase) return;

      if (sound && window.SiragAudio) {
        window.SiragAudio.playClick(420 + phaseIdx * 60);
      }

      // Render Phase Buttons
      const dots = document.getElementById('battle-phase-dots');
      if (dots) {
        dots.innerHTML = this.currentBattle.phases
          .map(
            (p, idx) => `
            <button class="phase-step-btn ${idx === phaseIdx ? 'active' : ''}" data-pidx="${idx}">
              ${p.name}
            </button>`
          )
          .join('');
        dots.querySelectorAll('.phase-step-btn').forEach((b) => {
          b.addEventListener('click', () => {
            this.stopPlay();
            this.setPhase(parseInt(b.getAttribute('data-pidx'), 10), true);
          });
        });
      }

      // Render Arrows
      const arrowsLayer = document.getElementById('tactical-arrows-layer');
      if (arrowsLayer) {
        arrowsLayer.innerHTML = (phase.arrows || [])
          .map((a) => {
            const marker =
              a.color === '#ef4444'
                ? 'url(#arrowRed)'
                : a.color === '#10b981'
                ? 'url(#arrowGreen)'
                : 'url(#arrowGold)';
            return `<path d="${a.d}" fill="none" stroke="${a.color}" stroke-width="2.8" stroke-dasharray="6 4" marker-end="${marker}" />`;
          })
          .join('');
      }

      // Update or Create Units with Smooth Transitions
      const unitsLayer = document.getElementById('tactical-units-layer');
      if (unitsLayer) {
        // Remove stale units not in this phase
        const activeIds = new Set(phase.units.map((u) => `unit-${u.id}`));
        Array.from(unitsLayer.children).forEach((child) => {
          if (!activeIds.has(child.id)) child.remove();
        });

        phase.units.forEach((u) => {
          let g = document.getElementById(`unit-${u.id}`);
          if (!g) {
            g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('id', `unit-${u.id}`);
            g.style.transition = 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)';
            g.innerHTML = this.buildUnitGraphic(u);
            unitsLayer.appendChild(g);
          } else {
            const textEl = g.querySelector('text.unit-label');
            if (textEl) textEl.textContent = u.label;
          }
          g.setAttribute('transform', `translate(${u.x}, ${u.y})`);
        });
      }

      // Render Analysis Side Panel
      const panel = document.getElementById('battle-analysis-panel');
      if (panel) {
        panel.innerHTML = `
          <div>
            <span class="inspector-date">${this.currentBattle.date} • المرحلة ${phaseIdx + 1} من ${this.currentBattle.phases.length}</span>
            <h3 class="inspector-title">${this.currentBattle.title}</h3>
          </div>

          <div class="battle-metrics">
            <div class="metric-box">
              <span>قوام جيش المسلمين</span>
              <strong>${this.currentBattle.muslimForce}</strong>
            </div>
            <div class="metric-box">
              <span>قوام الطرف المقابل</span>
              <strong style="color:#f87171;">${this.currentBattle.enemyForce}</strong>
            </div>
          </div>

          <div class="narrative-box">
            <strong style="display:block; color:var(--gold-bright); margin-bottom:6px; font-size:1.02rem;">
              ${phase.headline}
            </strong>
            <p>${phase.analysis}</p>
          </div>

          <div class="wahi-card">
            <span class="wahi-badge">🎯 الخلاصة القيادية والاستراتيجية</span>
            <p style="margin-top:8px; line-height:1.75; font-size:0.9rem; color:var(--text-ivory);">
              ${phase.lesson}
            </p>
          </div>

          <div class="then-now-card">
            <strong style="color:var(--gold-bright);">⛰️ قراءة التضاريس الحاكمة:</strong>
            <p style="margin-top:5px; color:var(--text-secondary); line-height:1.65;">
              ${this.currentBattle.terrainSummary}
            </p>
          </div>
        `;
      }
    }

    buildUnitGraphic(u) {
      if (u.type === 'command') {
        return `
          <circle r="17" fill="rgba(245,215,127,0.22)" stroke="#f5d77f" stroke-width="1.5" />
          <circle r="10" fill="#d4af37" stroke="#070b12" stroke-width="2" />
          <text y="4" text-anchor="middle" fill="#070b12" font-size="10" font-weight="bold">ﷺ</text>
          <rect x="-78" y="-34" width="156" height="18" rx="6" fill="rgba(7,11,18,0.86)" stroke="rgba(245,215,127,0.5)" />
          <text class="unit-label" y="-21" text-anchor="middle" fill="#f5d77f" font-size="10" font-family="Readex Pro, sans-serif">${u.label}</text>
        `;
      }
      if (u.type === 'muslim') {
        return `
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="#10b981" stroke="#ecfdf5" stroke-width="1.5" />
          <rect x="-72" y="15" width="144" height="17" rx="5" fill="rgba(7,11,18,0.82)" />
          <text class="unit-label" y="27" text-anchor="middle" fill="#a7f3d0" font-size="9.5" font-family="Readex Pro, sans-serif">${u.label}</text>
        `;
      }
      return `
        <polygon points="0,-13 13,0 0,13 -13,0" fill="#ef4444" stroke="#fee2e2" stroke-width="1.4" />
        <rect x="-72" y="16" width="144" height="17" rx="5" fill="rgba(7,11,18,0.82)" />
        <text class="unit-label" y="28" text-anchor="middle" fill="#fecaca" font-size="9.5" font-family="Readex Pro, sans-serif">${u.label}</text>
      `;
    }
  }

  window.SiragBattles = new TacticalSimulator();
})();
