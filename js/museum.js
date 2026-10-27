/**
 * Sirag Atlas — 3D Interactive Prophetic Museum Controller
 * Applies hardware-accelerated 3D tilt & dynamic gold specular glare on pointer/touch movement.
 */
(function () {
  class PropheticMuseum {
    constructor() {
      this.relics = window.SEERAH_RELICS || [];
    }

    init() {
      this.renderGrid();
      this.bindModalClose();
    }

    renderGrid() {
      const grid = document.getElementById('museum-grid');
      if (!grid) return;

      grid.innerHTML = this.relics
        .map(
          (r) => `
          <div class="relic-3d-wrapper">
            <article class="relic-card" data-relic-id="${r.id}">
              <div class="relic-glare"></div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="era-badge" style="font-size:0.74rem;">${r.category}</span>
                <span style="font-size:1.55rem;">${r.icon}</span>
              </div>
              <span class="inspector-date">${r.year}</span>
              <h3 class="inspector-title" style="font-size:1.32rem; margin:4px 0 8px;">${r.title}</h3>
              <div class="relic-manuscript">${r.excerpt}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                <span style="font-size:0.78rem; color:var(--text-secondary);">حرّك البطاقة لمعاينة 3D</span>
                <button class="btn-outline" style="padding:5px 12px; font-size:0.78rem;">📜 قراءة الوثيقة كاملة</button>
              </div>
            </article>
          </div>
        `
        )
        .join('');

      grid.querySelectorAll('.relic-card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const pctX = (x / rect.width) * 100;
          const pctY = (y / rect.height) * 100;
          const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * -9;
          const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * 9;

          card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
          card.style.setProperty('--glare-x', `${pctX.toFixed(1)}%`);
          card.style.setProperty('--glare-y', `${pctY.toFixed(1)}%`);
        });

        card.addEventListener('pointerleave', () => {
          card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
        });

        card.addEventListener('click', () => {
          this.openRelicModal(card.getAttribute('data-relic-id'));
        });
      });
    }

    openRelicModal(id) {
      const r = this.relics.find((item) => item.id === id);
      if (!r) return;

      if (window.SiragAudio) window.SiragAudio.playClick(640);
      if (window.SiragTracker) window.SiragTracker.markRelicOpened(id);

      const modal = document.getElementById('relic-modal');
      const content = document.getElementById('relic-modal-content');
      if (!modal || !content) return;

      content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
          <div>
            <span class="inspector-date">${r.category} • ${r.year}</span>
            <h3 class="inspector-title">${r.icon} ${r.title}</h3>
          </div>
          <button class="btn-outline" id="close-relic-modal">✕ إغلاق</button>
        </div>

        <div class="relic-manuscript" style="font-size:1.18rem; margin:16px 0;">
          ${r.excerpt}
        </div>

        <div class="narrative-box" style="margin-bottom:14px;">
          <strong style="color:var(--gold-bright); display:block; margin-bottom:6px;">النص الكامل والتحقيق التاريخي:</strong>
          <p>${r.fullText}</p>
        </div>

        <div class="wahi-card">
          <span class="wahi-badge">🏛️ التوثيق والأهمية الحضارية</span>
          <p style="margin-top:6px; line-height:1.7; font-size:0.88rem;">${r.historicalNote}</p>
        </div>
      `;

      modal.classList.add('open');
      document.getElementById('close-relic-modal')?.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    bindModalClose() {
      const modal = document.getElementById('relic-modal');
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }
  }

  window.SiragMuseum = new PropheticMuseum();
})();
