/**
 * Sirag Atlas — Interactive Companions Constellation Controller
 */
(function () {
  const ORBIT_RADII = {
    1: 72,
    2: 122,
    3: 172,
    4: 218
  };

  class CompanionsConstellation {
    constructor() {
      this.companions = window.SEERAH_COMPANIONS || [];
      this.events = window.SEERAH_EVENTS || [];
      this.activeOrbit = 'all';
      this.selectedCompanion = this.companions[0] || null;
    }

    init() {
      this.renderConstellation();
      this.bindFilters();
      if (this.selectedCompanion) {
        this.selectCompanion(this.selectedCompanion.id, false);
      }
    }

    bindFilters() {
      document.querySelectorAll('#orbit-filters .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#orbit-filters .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeOrbit = btn.getAttribute('data-orbit');
          if (window.SiragAudio) window.SiragAudio.playClick(510);
          this.updateVisibility();
        });
      });
    }

    renderConstellation() {
      const holder = document.getElementById('constellation-holder');
      if (!holder) return;

      const cx = 280;
      const cy = 260;

      const orbitsSvg = Object.entries(ORBIT_RADII)
        .map(
          ([orb, r]) => `
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(212,175,55,0.16)" stroke-dasharray="4 6" id="orbit-ring-${orb}" />`
        )
        .join('');

      const beamsSvg = this.companions
        .map((c) => {
          const pos = this.polarToCartesian(cx, cy, ORBIT_RADII[c.orbit], c.angle);
          return `<line id="beam-${c.id}" x1="${cx}" y1="${cy}" x2="${pos.x}" y2="${pos.y}" stroke="${c.color}" stroke-width="1.2" opacity="0.12" />`;
        })
        .join('');

      const starsSvg = this.companions
        .map((c) => {
          const pos = this.polarToCartesian(cx, cy, ORBIT_RADII[c.orbit], c.angle);
          return `
            <g class="companion-star" id="star-${c.id}" data-cid="${c.id}" data-orbit="${c.orbit}" transform="translate(${pos.x}, ${pos.y})">
              <circle class="star-halo" r="15" fill="${c.color}" opacity="0.14" />
              <circle class="star-core" r="7.5" fill="${c.color}" stroke="#070b12" stroke-width="1.8" />
              <rect x="-52" y="11" width="104" height="16" rx="5" fill="rgba(7,11,18,0.84)" />
              <text y="22" text-anchor="middle" fill="#f8f4ea" font-size="9.5" font-family="Readex Pro, sans-serif">${c.name}</text>
            </g>
          `;
        })
        .join('');

      holder.innerHTML = `
        <svg id="constellation-svg" viewBox="0 0 560 520" aria-label="مجرة الصحابة الكرام">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(245,215,127,0.42)" />
              <stop offset="100%" stop-color="rgba(245,215,127,0)" />
            </radialGradient>
          </defs>

          <!-- Ambient Starfield Dots -->
          <circle cx="65" cy="70" r="1.2" fill="#fff" opacity="0.4" />
          <circle cx="490" cy="85" r="1.5" fill="#f5d77f" opacity="0.5" />
          <circle cx="82" cy="445" r="1.4" fill="#2dd4bf" opacity="0.4" />
          <circle cx="478" cy="435" r="1.2" fill="#fff" opacity="0.4" />

          <!-- Orbits & Beams -->
          <g>${orbitsSvg}</g>
          <g>${beamsSvg}</g>

          <!-- Central Prophetic Seal -->
          <circle cx="${cx}" cy="${cy}" r="54" fill="url(#centerGlow)" />
          <circle cx="${cx}" cy="${cy}" r="31" fill="#0d1829" stroke="#f5d77f" stroke-width="2.5" />
          <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#f5d77f" font-size="11.5" font-weight="bold" font-family="Amiri, serif">اللّٰه</text>
          <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#f5d77f" font-size="11" font-weight="bold" font-family="Amiri, serif">رَسُولُ</text>
          <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#f5d77f" font-size="11.5" font-weight="bold" font-family="Amiri, serif">مُحَمَّدٌ</text>

          <!-- Companion Stars -->
          <g>${starsSvg}</g>
        </svg>
      `;

      holder.querySelectorAll('.companion-star').forEach((node) => {
        node.addEventListener('click', () => {
          this.selectCompanion(node.getAttribute('data-cid'), true);
        });
      });
    }

    polarToCartesian(cx, cy, r, angleDeg) {
      const rad = ((angleDeg - 90) * Math.PI) / 180;
      return {
        x: Math.round(cx + r * Math.cos(rad)),
        y: Math.round(cy + r * Math.sin(rad))
      };
    }

    updateVisibility() {
      this.companions.forEach((c) => {
        const star = document.getElementById(`star-${c.id}`);
        const beam = document.getElementById(`beam-${c.id}`);
        const visible = this.activeOrbit === 'all' || String(c.orbit) === String(this.activeOrbit);
        if (star) star.style.opacity = visible ? '1' : '0.16';
        if (beam) beam.setAttribute('opacity', visible ? '0.2' : '0.04');
      });
    }

    selectCompanion(id, sound = false) {
      const comp = this.companions.find((c) => c.id === id);
      if (!comp) return;
      this.selectedCompanion = comp;

      if (sound && window.SiragAudio) {
        window.SiragAudio.playClick(560);
      }

      if (window.SiragTracker) {
        window.SiragTracker.markCompanionVisited(id);
      }

      // Highlight selected star & beam
      this.companions.forEach((c) => {
        const beam = document.getElementById(`beam-${c.id}`);
        const star = document.getElementById(`star-${c.id}`);
        const isSel = c.id === id;
        if (beam) {
          beam.setAttribute('opacity', isSel ? '0.95' : '0.14');
          beam.setAttribute('stroke-width', isSel ? '2.8' : '1.1');
        }
        if (star) {
          const halo = star.querySelector('.star-halo');
          if (halo) {
            halo.setAttribute('r', isSel ? '22' : '14');
            halo.setAttribute('opacity', isSel ? '0.36' : '0.14');
          }
        }
      });

      this.renderProfile(comp);
    }

    renderProfile(comp) {
      const panel = document.getElementById('companion-profile-panel');
      if (!panel) return;

      const linkedEvents = comp.stations
        .map((sid) => this.events.find((e) => e.id === sid))
        .filter(Boolean);

      panel.innerHTML = `
        <div>
          <span class="inspector-date">رضي الله عنه/عنها • العمر عند الإسلام/الهجرة: ${comp.ageAtIslam}</span>
          <h3 class="inspector-title">${comp.name}</h3>
          <p style="color:${comp.color}; font-weight:600; font-size:0.9rem; margin-top:3px;">✨ ${comp.title}</p>
        </div>

        <div class="wahi-card">
          <span class="wahi-badge">🌟 البصمة الخالدة في السيرة</span>
          <p style="margin-top:7px; line-height:1.75; color:var(--text-ivory); font-size:0.92rem;">
            ${comp.signatureRole}
          </p>
        </div>

        <div class="narrative-box">
          <p>${comp.bio}</p>
        </div>

        <div class="then-now-card">
          <strong style="color:var(--gold-bright);">💬 موقف أو كلمة مضيئة:</strong>
          <p style="margin-top:6px; font-family:var(--font-serif); font-size:1.12rem; color:#fff;">
            ${comp.quote}
          </p>
        </div>

        <div>
          <strong style="display:block; font-size:0.84rem; color:var(--text-secondary); margin-bottom:8px;">
            🗺️ محطات شهدها على الأطلس (اضغط للانتقال مباشرة):
          </strong>
          <div style="display:flex; flex-wrap:wrap; gap:7px;">
            ${linkedEvents
              .map(
                (ev) => `
              <button class="btn-outline jump-station-from-comp" data-ev-id="${ev.id}" style="font-size:0.77rem; padding:6px 11px;">
                📍 ${ev.title.split(':')[0]}
              </button>`
              )
              .join('')}
          </div>
        </div>
      `;

      panel.querySelectorAll('.jump-station-from-comp').forEach((btn) => {
        btn.addEventListener('click', () => {
          const evId = btn.getAttribute('data-ev-id');
          window.SiragApp?.switchView('atlas');
          window.SiragAtlas?.jumpToEventById(evId);
        });
      });
    }
  }

  window.SiragConstellation = new CompanionsConstellation();
})();
