/**
 * Sirag Atlas — Stage 7 Controller: Interactive Prophetic Lineage, Noble Household & 24h Shama'il Dial
 */
(function () {
  class LineageAndShamail {
    constructor() {
      this.data = window.SEERAH_LINEAGE || { ancestors: [], children: [], dailyHours: [] };
      this.activeAncestor = this.data.ancestors[this.data.ancestors.length - 1] || null;
      this.activeHour = this.data.dailyHours[0] || null;
      this.subMode = 'tree'; // 'tree' | 'household' | 'shamail'
    }

    init() {
      this.bindSubModeTabs();
      this.renderCurrentSubMode();
    }

    bindSubModeTabs() {
      document.querySelectorAll('#lineage-subtabs .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#lineage-subtabs .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.subMode = btn.getAttribute('data-submode');
          if (window.SiragAudio) window.SiragAudio.playClick(540);
          this.renderCurrentSubMode();
        });
      });
    }

    renderCurrentSubMode() {
      const container = document.getElementById('lineage-dynamic-stage');
      if (!container) return;

      if (this.subMode === 'tree') {
        this.renderTreeMode(container);
      } else if (this.subMode === 'household') {
        this.renderHouseholdMode(container);
      } else {
        this.renderShamailMode(container);
      }
    }

    renderTreeMode(container) {
      const ancestors = this.data.ancestors;
      const nodesSvg = ancestors
        .map((a, idx) => {
          const isProphet = a.id === 'prophet';
          const isSelected = this.activeAncestor?.id === a.id;
          return `
            <g class="ancestor-node" data-aid="${a.id}" transform="translate(230, ${a.y})" style="cursor:pointer;">
              ${
                idx < ancestors.length - 1
                  ? `<line x1="0" y1="16" x2="0" y2="${ancestors[idx + 1].y - a.y - 16}" stroke="rgba(245,215,127,0.45)" stroke-width="2.5" />`
                  : ''
              }
              <rect x="-135" y="-17" width="270" height="34" rx="17"
                    fill="${isProphet ? 'rgba(212,175,55,0.28)' : isSelected ? 'rgba(45,212,191,0.22)' : 'rgba(16,28,46,0.92)'}"
                    stroke="${isProphet ? '#f5d77f' : isSelected ? '#2dd4bf' : 'rgba(212,175,55,0.42)'}"
                    stroke-width="${isSelected || isProphet ? '2.2' : '1.2'}" />
              <text y="5" text-anchor="middle" fill="${isProphet ? '#f5d77f' : '#f8f4ea'}"
                    font-size="${isProphet ? '13.5' : '12'}" font-weight="bold" font-family="Amiri, serif">
                ${a.name}
              </text>
            </g>
          `;
        })
        .join('');

      const sel = this.activeAncestor || ancestors[ancestors.length - 1];

      container.innerHTML = `
        <div class="atlas-grid">
          <div class="glass-panel" style="padding:16px;">
            <svg viewBox="0 0 460 568" style="width:100%; height:auto; max-height:530px; display:block;" aria-label="عمود النسب النبوي الشريف">
              <defs>
                <radialGradient id="treeGlow" cx="50%" cy="92%" r="48%">
                  <stop offset="0%" stop-color="rgba(245,215,127,0.25)" />
                  <stop offset="100%" stop-color="rgba(245,215,127,0)" />
                </radialGradient>
              </defs>
              <rect width="460" height="568" rx="14" fill="rgba(7,12,20,0.65)" />
              <circle cx="230" cy="528" r="120" fill="url(#treeGlow)" />
              ${nodesSvg}
            </svg>
          </div>

          <div class="glass-panel station-inspector">
            <div>
              <span class="inspector-date">🌿 عمود النسب المطهّر وتلاقي الأنساب</span>
              <h3 class="inspector-title">${sel.name}</h3>
              <p style="font-size:0.85rem; color:var(--gold-primary); margin-top:4px;">${sel.era}</p>
            </div>

            <div class="narrative-box">
              <p>${sel.story}</p>
            </div>

            <div class="wahi-card">
              <span class="wahi-badge">🤝 التقاء أنساب الصحابة الكرام عند هذا الجد</span>
              <p style="margin-top:8px; line-height:1.75; color:var(--text-ivory); font-size:0.92rem;">
                ${sel.convergence}
              </p>
            </div>

            <div class="then-now-card">
              <strong style="color:var(--gold-bright);">💡 نصيحة تفاعلية:</strong>
              <p style="margin-top:5px; color:var(--text-secondary);">
                اضغط على أي جد في الشجرة الذهبية (مثل <strong>مُرّة</strong> أو <strong>كعب</strong> أو <strong>قصي</strong> أو <strong>عبد مناف</strong>) لترى كيف تجتمع أنساب كبار الصحابة بنسب رسول الله ﷺ!
              </p>
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll('.ancestor-node').forEach((node) => {
        node.addEventListener('click', () => {
          const id = node.getAttribute('data-aid');
          this.activeAncestor = ancestors.find((a) => a.id === id) || sel;
          if (window.SiragAudio) window.SiragAudio.playClick(530);
          this.renderTreeMode(container);
        });
      });
    }

    renderHouseholdMode(container) {
      container.innerHTML = `
        <div class="museum-grid">
          ${this.data.children
            .map(
              (ch) => `
              <article class="glass-panel" style="padding:20px; border-color:var(--border-gold);">
                <span class="era-badge" style="font-size:0.74rem; margin-bottom:10px;">أبناء وبنات النبي ﷺ</span>
                <h3 class="inspector-title" style="font-size:1.35rem; margin-bottom:6px;">${ch.name}</h3>
                <p style="font-size:0.8rem; color:var(--teal-wahi); margin-bottom:10px;">الأم: ${ch.mother}</p>
                <p style="line-height:1.78; font-size:0.9rem; color:var(--text-ivory);">${ch.note}</p>
              </article>
            `
            )
            .join('')}
        </div>
      `;
    }

    renderShamailMode(container) {
      const hr = this.activeHour || this.data.dailyHours[0];
      container.innerHTML = `
        <div class="scenario-layout">
          <div class="scenario-list">
            ${this.data.dailyHours
              .map(
                (item) => `
                <button class="scenario-nav-item ${item.id === hr.id ? 'active' : ''}" data-hid="${item.id}">
                  <div style="display:flex; justify-content:space-between; font-size:0.76rem; color:var(--gold-primary); margin-bottom:4px;">
                    <span>${item.icon} ${item.period}</span>
                    <span>${item.timeLabel}</span>
                  </div>
                  <strong style="font-size:0.9rem;">${item.title}</strong>
                </button>
              `
              )
              .join('')}
          </div>

          <div class="glass-panel scenario-stage-card">
            <span class="inspector-date">🕰️ ساعة الشمائل النبوية • ${hr.timeLabel}</span>
            <h3 class="inspector-title" style="margin:6px 0 14px;">${hr.icon} ${hr.title}</h3>
            <div class="narrative-box" style="font-size:0.98rem;">
              <p>${hr.summary}</p>
            </div>
            <div class="wahi-card" style="margin-top:16px;">
              <span class="wahi-badge">✨ ميزان الحياة النبوية المتوازنة</span>
              <p style="margin-top:8px; line-height:1.75; font-size:0.9rem;">
                كان ﷺ يقسّم وقته ثلاثة أجزاء متكاملة: جزءاً لربه عبادةً ومناجاة، وجزءاً لأهله لطفاً وخدمةً ومؤانسة، وجزءاً لنفسه ثم يصرفه في مصالح الناس وتعليمهم دون احتجابٍ عنهم.
              </p>
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll('[data-hid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-hid');
          this.activeHour = this.data.dailyHours.find((h) => h.id === id) || hr;
          if (window.SiragAudio) window.SiragAudio.playClick(570);
          this.renderShamailMode(container);
        });
      });
    }
  }

  window.SiragLineage = new LineageAndShamail();
})();
