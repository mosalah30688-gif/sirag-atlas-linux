/**
 * Sirag Atlas — Stage 12 Controller:
 * 1) 30-Council Interactive Seerah Khatmah Tracker
 * 2) Personalized Golden Seerah Completion Certificate Studio (1600x1120 PNG)
 */
(function () {
  const KHATMAH_KEY = 'sirag_atlas_khatmah_v1';
  const CERT_NAME_KEY = 'sirag_atlas_cert_name_v1';

  class KhatmahAndCertificate {
    constructor() {
      this.days = window.SEERAH_KHATMAH_DAYS || [];
      this.completedDays = this.loadCompleted();
      this.readerName = localStorage.getItem(CERT_NAME_KEY) || '';
      this.subMode = 'khatmah'; // 'khatmah' | 'cert'
    }

    loadCompleted() {
      try {
        const raw = localStorage.getItem(KHATMAH_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return [];
    }

    saveCompleted() {
      try {
        localStorage.setItem(KHATMAH_KEY, JSON.stringify(this.completedDays));
      } catch (_) {}
    }

    init() {
      this.bindSubTabs();
      this.bindHeaderProgressClick();
      this.render();
    }

    bindHeaderProgressClick() {
      const pill = document.querySelector('.progress-pill');
      if (pill) {
        pill.style.cursor = 'pointer';
        pill.addEventListener('click', () => {
          window.SiragApp?.switchView('khatmah');
          this.subMode = 'cert';
          document.querySelectorAll('#khatmah-subtabs .pill-btn').forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-kmode') === 'cert');
          });
          this.render();
        });
      }
    }

    bindSubTabs() {
      document.querySelectorAll('#khatmah-subtabs .pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#khatmah-subtabs .pill-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.subMode = btn.getAttribute('data-kmode');
          if (window.SiragAudio) window.SiragAudio.playClick(540);
          this.render();
        });
      });
    }

    render() {
      const holder = document.getElementById('khatmah-cert-stage');
      if (!holder) return;
      if (this.subMode === 'khatmah') {
        this.renderKhatmahPlan(holder);
      } else {
        this.renderCertificateStudio(holder);
      }
    }

    renderKhatmahPlan(holder) {
      const doneCount = this.completedDays.length;
      const pct = Math.round((doneCount / this.days.length) * 100);

      holder.innerHTML = `
        <div class="glass-panel" style="padding:20px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
            <div>
              <strong style="color:var(--gold-bright); font-size:1.08rem;">📊 تقدمك في ختمة السيرة المباركة: ${doneCount} من 30 مجلساً (${pct}%)</strong>
              <p style="font-size:0.82rem; color:var(--text-secondary);">خمس دقائق يومياً تطوف بك على السيرة النبوية كاملةً فهماً ومعايشةً وتطبيقاً.</p>
            </div>
            <button class="btn-gold" id="go-issue-cert-btn">🎓 استخرج شهادتك الذهبية باسمك ←</button>
          </div>
          <div style="width:100%; height:10px; border-radius:999px; background:rgba(255,255,255,0.08); overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #d4af37, #10b981); transition:width 0.35s ease;"></div>
          </div>
        </div>

        <div class="museum-grid">
          ${this.days
            .map((d) => {
              const isDone = this.completedDays.includes(d.day);
              return `
                <article class="glass-panel" style="padding:18px; display:flex; flex-direction:column; justify-content:space-between; gap:12px; border-color:${
                  isDone ? '#10b981' : 'var(--border-gold)'
                };">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                      <span class="era-badge" style="font-size:0.74rem;">المجلس ${d.day} من 30</span>
                      <span style="font-size:0.8rem; color:${isDone ? '#10b981' : 'var(--text-muted)'}; font-weight:700;">
                        ${isDone ? '✅ مكتمل' : '⏳ في الانتظار'}
                      </span>
                    </div>
                    <h3 class="inspector-title" style="font-size:1.2rem; margin-bottom:6px;">${d.title}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.65;">${d.summary}</p>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="btn-outline jump-khatmah-btn" data-day="${d.day}" style="flex:1; font-size:0.78rem;">
                      ▶ افتح المجلس
                    </button>
                    <button class="${isDone ? 'btn-gold' : 'btn-outline'} toggle-khatmah-btn" data-day="${d.day}" style="font-size:0.78rem;">
                      ${isDone ? '✓ تم' : 'علّم كمكتمل'}
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      `;

      document.getElementById('go-issue-cert-btn')?.addEventListener('click', () => {
        this.subMode = 'cert';
        document.querySelectorAll('#khatmah-subtabs .pill-btn').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-kmode') === 'cert');
        });
        this.render();
      });

      holder.querySelectorAll('.toggle-khatmah-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayNum = parseInt(btn.getAttribute('data-day'), 10);
          if (this.completedDays.includes(dayNum)) {
            this.completedDays = this.completedDays.filter((x) => x !== dayNum);
          } else {
            this.completedDays.push(dayNum);
          }
          if (window.SiragAudio) window.SiragAudio.playClick(630);
          this.saveCompleted();
          this.renderKhatmahPlan(holder);
        });
      });

      holder.querySelectorAll('.jump-khatmah-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayNum = parseInt(btn.getAttribute('data-day'), 10);
          const item = this.days.find((x) => x.day === dayNum);
          if (!item) return;
          window.SiragApp?.switchView(item.targetView);
          if (item.targetView === 'atlas') window.SiragAtlas?.jumpToEventById(item.targetId);
          else if (item.targetView === 'battles') window.SiragBattles?.selectBattle(item.targetId);
          else if (item.targetView === 'constellation') window.SiragConstellation?.selectCompanion(item.targetId, true);
          else if (item.targetView === 'sanctuaries') window.SiragSanctuaries?.selectSite(item.targetId, true);
        });
      });
    }

    renderCertificateStudio(holder) {
      holder.innerHTML = `
        <div class="atlas-grid">
          <div class="glass-panel station-inspector">
            <div>
              <span class="inspector-date">🎓 إجازة التطواف في رحاب السيرة النبوية</span>
              <h3 class="inspector-title">أصدر وثيقتك المذهّبة باسمك الكريم</h3>
              <p style="font-size:0.86rem; color:var(--text-secondary); margin-top:6px;">
                اكتب اسمك كما تحب أن يظهر بالخط الأميري المذهّب وسط الوثيقة، ثم حمّلها بدقة فائقة (1600×1120 PNG).
              </p>
            </div>

            <div>
              <label for="cert-name-input" style="display:block; font-size:0.84rem; color:var(--gold-bright); margin-bottom:6px;">
                ✍️ الاسم الكريم على الشهادة:
              </label>
              <input type="text" id="cert-name-input" value="${this.readerName.replace(/"/g, '&quot;')}"
                     placeholder="مثال: محمد صلاح"
                     style="width:100%; background:var(--bg-card); border:1.5px solid var(--gold-primary); border-radius:12px; padding:11px 15px; color:var(--text-ivory); font-family:var(--font-ui); font-size:1rem; outline:none;" />
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:10px;">
              <button class="btn-gold" id="download-cert-btn" style="flex:1;">⬇️ تحميل الشهادة المذهّبة (PNG)</button>
            </div>

            <div class="wahi-card">
              <span class="wahi-badge">🌟 إحصاءاتك الموثقة على الشهادة تلقائياً</span>
              <p style="margin-top:6px; font-size:0.86rem; line-height:1.7;">
                • المحطات المستكشفة على الأطلس: <strong>${window.SiragTracker?.state?.stations?.length || 1} / 18</strong><br/>
                • مجالس الختمة المنجزة: <strong>${this.completedDays.length} / 30</strong><br/>
                • التاريخ الهجري المدوّن تلقائياً من تقويم أم القرى.
              </p>
            </div>
          </div>

          <div class="glass-panel" style="padding:16px; text-align:center;">
            <canvas id="certificate-canvas" width="1600" height="1120"
                    style="width:100%; height:auto; border-radius:12px; border:1px solid var(--border-gold); box-shadow:var(--shadow-deep);"></canvas>
          </div>
        </div>
      `;

      const canvas = document.getElementById('certificate-canvas');
      const input = document.getElementById('cert-name-input');
      this.drawCertificate(canvas, this.readerName || 'محبّ السيرة النبوية الشريفة');

      input?.addEventListener('input', (e) => {
        this.readerName = e.target.value;
        try { localStorage.setItem(CERT_NAME_KEY, this.readerName); } catch (_) {}
        this.drawCertificate(canvas, this.readerName || 'محبّ السيرة النبوية الشريفة');
      });

      document.getElementById('download-cert-btn')?.addEventListener('click', () => {
        if (!canvas) return;
        if (window.SiragAudio) window.SiragAudio.playClick(670);
        const a = document.createElement('a');
        a.download = 'sirag-atlas-certificate.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
    }

    drawCertificate(canvas, nameText) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      // Background Royal Obsidian & Lapis Gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, W * 0.65);
      bg.addColorStop(0, '#162844');
      bg.addColorStop(0.65, '#0b1424');
      bg.addColorStop(1, '#050912');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Ornate Borders
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 6;
      ctx.strokeRect(42, 42, W - 84, H - 84);
      ctx.strokeStyle = 'rgba(245,215,127,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(62, 62, W - 124, H - 124);

      // Corner Astrolabe Rosettes
      [[82, 82], [W - 82, 82], [82, H - 82], [W - 82, H - 82]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.strokeStyle = '#f5d77f';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Top Prophetic Seal Medallion
      ctx.beginPath();
      ctx.arc(W / 2, 175, 72, 0, Math.PI * 2);
      ctx.fillStyle = '#0a1220';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#f5d77f';
      ctx.stroke();

      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d77f';
      ctx.font = 'bold 26px Amiri, serif';
      ctx.fillText('اللّٰه', W / 2, 150);
      ctx.fillText('رَسُولُ', W / 2, 181);
      ctx.fillText('مُحَمَّدٌ', W / 2, 212);

      // Header Subtitle & Title
      ctx.fillStyle = '#2dd4bf';
      ctx.font = '600 28px "Readex Pro", sans-serif';
      ctx.fillText('سِراج الأطلس — الأطلس الزماني-المكاني الحي للسيرة النبوية ﷺ', W / 2, 302);

      ctx.fillStyle = '#f5d77f';
      ctx.font = 'bold 56px Amiri, serif';
      ctx.fillText('وثيقة استكشاف ومعايشة للسيرة النبوية الشريفة', W / 2, 382);

      ctx.fillStyle = '#c5bfb0';
      ctx.font = '400 28px "Readex Pro", sans-serif';
      ctx.fillText('تشهد منصة «سِراج الأطلس» بأن الباحث والمحبّ لسيرة خير الأنام ﷺ:', W / 2, 462);

      // Recipient Name Banner
      ctx.fillStyle = 'rgba(212,175,55,0.12)';
      ctx.strokeStyle = 'rgba(245,215,127,0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 430, 500, 860, 118, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 62px Amiri, serif';
      ctx.fillText(nameText.trim(), W / 2, 578);

      // Citation Body
      const stationsVisited = window.SiragTracker?.state?.stations?.length || 1;
      const khatmahDone = this.completedDays.length;
      const scoreText = document.getElementById('explorer-score')?.textContent || '';

      ctx.fillStyle = '#f8f4ea';
      ctx.font = '400 29px "Readex Pro", sans-serif';
      ctx.fillText(
        `قد طوّف في معالم الأطلس النبوي الشريف، وتدبّر مواطن الوحي ومجالس الشورى والشمائل المحمدية`,
        W / 2,
        695
      );
      ctx.fillStyle = '#2dd4bf';
      ctx.font = '600 27px "Readex Pro", sans-serif';
      ctx.fillText(
        `المحطات المستكشفة: ${stationsVisited}/18   •   مجالس الختمة: ${khatmahDone}/30   •   الرتبة: ${scoreText}`,
        W / 2,
        758
      );

      // Prayer Quote
      ctx.fillStyle = '#f5d77f';
      ctx.font = 'bold 34px Amiri, serif';
      ctx.fillText('﴿لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ لِّمَن كَانَ يَرْجُو اللَّهَ وَالْيَوْمَ الْآخِرَ﴾', W / 2, 855);

      // Date Footer
      const hijriDate = document.getElementById('hijri-date-text')?.textContent || '';
      ctx.fillStyle = '#c5bfb0';
      ctx.font = '500 24px "Readex Pro", sans-serif';
      ctx.fillText(`حُررت في: ${hijriDate}   |   منصة سِراج الأطلس التفاعلية`, W / 2, 985);
    }
  }

  window.SiragKhatmah = new KhatmahAndCertificate();
})();
