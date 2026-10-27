/**
 * Sirag Atlas — Stage 11 Controller:
 * 1) Interactive Architectural Blueprints of Al-Masjid Al-Nabawi & Al-Masjid Al-Haram
 * 2) Royal Parchment / Celestial Night Theme Switcher + Font Comfort Scaler
 */
(function () {
  const THEME_KEY = 'sirag_atlas_theme_v1';
  const FONT_KEY = 'sirag_atlas_fontscale_v1';

  class SanctuariesAndComfort {
    constructor() {
      this.data = window.SEERAH_SANCTUARIES || {};
      this.site = 'madinah'; // 'madinah' | 'makkah'
      this.selectedHotspot = null;
      this.theme = localStorage.getItem(THEME_KEY) || 'night'; // 'night' | 'parchment'
      this.fontLarge = localStorage.getItem(FONT_KEY) === 'large';
    }

    init() {
      this.applySavedThemeAndFont();
      this.bindHeaderThemeControls();
      this.bindSiteSwitch();
      this.selectSite('madinah', false);
    }

    applySavedThemeAndFont() {
      document.body.classList.toggle('theme-parchment', this.theme === 'parchment');
      document.documentElement.style.fontSize = this.fontLarge ? '17.5px' : '16px';
      this.updateThemeButtonsUI();
    }

    updateThemeButtonsUI() {
      const themeBtn = document.getElementById('theme-toggle-btn');
      if (themeBtn) {
        themeBtn.innerHTML =
          this.theme === 'parchment'
            ? '<span>🌙</span><span>الوضع الليلي</span>'
            : '<span>📜</span><span>الرقّ النهاري</span>';
      }
      const fontBtn = document.getElementById('font-scale-btn');
      if (fontBtn) {
        fontBtn.classList.toggle('active', this.fontLarge);
      }
    }

    bindHeaderThemeControls() {
      document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        this.theme = this.theme === 'night' ? 'parchment' : 'night';
        try { localStorage.setItem(THEME_KEY, this.theme); } catch (_) {}
        if (window.SiragAudio) window.SiragAudio.playClick(550);
        this.applySavedThemeAndFont();
      });

      document.getElementById('font-scale-btn')?.addEventListener('click', () => {
        this.fontLarge = !this.fontLarge;
        try { localStorage.setItem(FONT_KEY, this.fontLarge ? 'large' : 'normal'); } catch (_) {}
        if (window.SiragAudio) window.SiragAudio.playClick(590);
        this.applySavedThemeAndFont();
      });
    }

    bindSiteSwitch() {
      document.querySelectorAll('#sanctuary-subtabs .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#sanctuary-subtabs .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectSite(btn.getAttribute('data-site'), true);
        });
      });
    }

    selectSite(siteKey, sound = false) {
      this.site = siteKey;
      const siteObj = this.data[siteKey];
      if (!siteObj) return;
      this.selectedHotspot = siteObj.hotspots[0];
      if (sound && window.SiragAudio) window.SiragAudio.playClick(510);
      this.render();
    }

    render() {
      const stage = document.getElementById('sanctuaries-stage');
      if (!stage) return;
      const siteObj = this.data[this.site];
      if (!siteObj) return;
      const cur = this.selectedHotspot || siteObj.hotspots[0];

      const blueprintSvg =
        this.site === 'madinah' ? this.buildMadinahBlueprint(siteObj, cur) : this.buildMakkahBlueprint(siteObj, cur);

      stage.innerHTML = `
        <div class="atlas-grid">
          <div class="glass-panel" style="padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="era-badge">${this.site === 'madinah' ? '🕌 العمارة النبوية بالمدينة' : '🕋 البيت العتيق بمكة'}</span>
              <span style="font-size:0.78rem; color:var(--text-secondary);">اضغط على أي نقطة مضيئة في المخطط</span>
            </div>
            ${blueprintSvg}
            <div class="station-strip" style="margin-top:10px;">
              ${siteObj.hotspots
                .map(
                  (h) => `
                <button class="station-chip ${h.id === cur.id ? 'active' : ''}" data-hspot="${h.id}">
                  ${h.name.split('(')[0].trim()}
                </button>`
                )
                .join('')}
            </div>
          </div>

          <div class="glass-panel station-inspector">
            <div>
              <span class="inspector-date">✨ ${cur.badge}</span>
              <h3 class="inspector-title">${cur.name}</h3>
              <p style="font-size:0.82rem; color:var(--gold-primary); margin-top:4px;">📐 الموقع والأبعاد: ${cur.dimensions}</p>
            </div>

            <div class="wahi-card">
              <span class="wahi-badge">📜 النص الحديثي أو القرآني الموثق</span>
              <p style="margin-top:8px; line-height:1.85; font-family:var(--font-serif); font-size:1.14rem; color:#ffffff;">
                ${cur.hadith}
              </p>
            </div>

            <div class="narrative-box">
              <strong style="display:block; color:var(--gold-bright); margin-bottom:5px;">الإضاءة التاريخية والروحية:</strong>
              <p>${cur.story}</p>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll('[data-hspot]').forEach((el) => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-hspot');
          this.selectedHotspot = siteObj.hotspots.find((h) => h.id === id) || cur;
          if (window.SiragAudio) window.SiragAudio.playClick(570);
          this.render();
        });
      });
    }

    buildMadinahBlueprint(siteObj, cur) {
      const pins = this.renderHotspotPins(siteObj.hotspots, cur);
      return `
        <svg viewBox="0 0 520 410" style="width:100%; height:auto; border-radius:14px; background:#091322; border:1px solid var(--border-gold);" aria-label="مخطط المسجد النبوي الشريف">
          <!-- North / South Qibla Indicators -->
          <text x="235" y="26" fill="rgba(56,189,248,0.75)" font-size="10.5" text-anchor="middle" font-family="Readex Pro, sans-serif">⬆ الشمال (القبلة الأولى نحو المسجد الأقصى)</text>
          <text x="235" y="396" fill="#f5d77f" font-size="11" font-weight="bold" text-anchor="middle" font-family="Readex Pro, sans-serif">⬇ الجنوب (القبلة الشريفة نحو الكعبة المشرفة)</text>

          <!-- Main Mosque Courtyard & Walls -->
          <rect x="95" y="45" width="275" height="325" rx="8" fill="rgba(16,28,46,0.9)" stroke="#d4af37" stroke-width="3" />

          <!-- Suffah Northern Shelter -->
          <rect x="145" y="54" width="185" height="62" rx="6" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.45)" stroke-dasharray="5 4" />
          <text x="237" y="76" fill="#7dd3fc" font-size="10.5" text-anchor="middle" font-family="Amiri, serif">ظُلّة أهل الصُّفَّة</text>

          <!-- Open Gravel Courtyard -->
          <text x="232" y="185" fill="rgba(248,244,234,0.35)" font-size="12" text-anchor="middle" font-family="Amiri, serif">صحن المسجد النبوي (المحصّب)</text>

          <!-- Sacred Rawdah Emerald Zone -->
          <rect x="155" y="255" width="198" height="105" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="2" />
          <text x="254" y="338" fill="#a7f3d0" font-size="11" font-weight="bold" text-anchor="middle" font-family="Amiri, serif">الروضة الشريفة المباركة</text>

          <!-- Palm-Trunk Pillars Grid in Southern Prayer Hall -->
          <g fill="rgba(212,175,55,0.45)">
            <circle cx="185" cy="285" r="4"/><circle cx="225" cy="285" r="4"/><circle cx="265" cy="285" r="4"/><circle cx="305" cy="285" r="4"/><circle cx="338" cy="285" r="4"/>
            <circle cx="185" cy="322" r="4"/><circle cx="265" cy="322" r="4"/><circle cx="305" cy="322" r="4"/><circle cx="338" cy="322" r="4"/>
          </g>

          <!-- Sacred Chambers of Mothers of the Believers (East Side) -->
          <rect x="374" y="275" width="88" height="78" rx="6" fill="rgba(244,114,182,0.16)" stroke="#f472b6" stroke-width="2" />
          <text x="418" y="302" fill="#fbcfe8" font-size="10" font-weight="bold" text-anchor="middle" font-family="Amiri, serif">حجرة عائشة</text>
          <text x="418" y="338" fill="#fbcfe8" font-size="9" text-anchor="middle" font-family="Readex Pro, sans-serif">(الحجرة الشريفة)</text>

          <rect x="374" y="195" width="76" height="34" rx="4" fill="rgba(244,114,182,0.08)" stroke="rgba(244,114,182,0.35)" />
          <rect x="374" y="234" width="76" height="34" rx="4" fill="rgba(244,114,182,0.08)" stroke="rgba(244,114,182,0.35)" />
          <text x="412" y="185" fill="rgba(251,207,232,0.65)" font-size="9" text-anchor="middle" font-family="Readex Pro, sans-serif">حجرات أمهات المؤمنين</text>

          ${pins}
        </svg>
      `;
    }

    buildMakkahBlueprint(siteObj, cur) {
      const pins = this.renderHotspotPins(siteObj.hotspots, cur);
      return `
        <svg viewBox="0 0 540 400" style="width:100%; height:auto; border-radius:14px; background:#091322; border:1px solid var(--border-gold);" aria-label="مخطط الكعبة المشرفة والمطاف">
          <!-- Mataf Concentric Tawaf Circles -->
          <circle cx="290" cy="215" r="142" fill="none" stroke="rgba(212,175,55,0.14)" stroke-width="18" />
          <circle cx="290" cy="215" r="106" fill="none" stroke="rgba(212,175,55,0.18)" stroke-dasharray="6 5" />
          <text x="172" y="335" fill="rgba(248,244,234,0.45)" font-size="10.5" font-family="Amiri, serif">صحن المطاف الشريف</text>

          <!-- Hijr Ismail (Hatim) Semi-Circle -->
          <path d="M252,172 A42,42 0 0,1 312,165" fill="rgba(45,212,191,0.12)" stroke="#2dd4bf" stroke-width="3.5" />

          <!-- The Honored Kaaba Cube -->
          <g transform="rotate(-18 290 215)">
            <rect x="255" y="178" width="70" height="78" rx="4" fill="#05070c" stroke="#f5d77f" stroke-width="3.2" />
            <line x1="255" y1="194" x2="325" y2="194" stroke="#d4af37" stroke-width="3" />
            <text x="290" y="224" fill="#f5d77f" font-size="12" font-weight="bold" text-anchor="middle" font-family="Amiri, serif">الكعبة</text>
          </g>

          <!-- Mas'a Strip between Safa & Marwah on the East -->
          <path d="M472,328 L452,95" fill="none" stroke="rgba(244,114,182,0.35)" stroke-width="14" stroke-linecap="round" />
          <text x="450" y="80" fill="#fbcfe8" font-size="10.5" text-anchor="middle" font-family="Amiri, serif">المروة</text>
          <text x="485" y="352" fill="#fbcfe8" font-size="10.5" text-anchor="middle" font-family="Amiri, serif">الصفا</text>

          ${pins}
        </svg>
      `;
    }

    renderHotspotPins(hotspots, cur) {
      return hotspots
        .map((h) => {
          const isSel = h.id === cur.id;
          return `
            <g data-hspot="${h.id}" transform="translate(${h.x}, ${h.y})" style="cursor:pointer;">
              ${isSel ? `<circle r="17" fill="none" stroke="${h.color}" stroke-width="2" class="pulse-ring" />` : ''}
              <circle r="${isSel ? '8.5' : '6.5'}" fill="${h.color}" stroke="#070b12" stroke-width="2" />
            </g>
          `;
        })
        .join('');
    }
  }

  window.SiragSanctuaries = new SanctuariesAndComfort();
})();
