/**
 * Sirag Atlas — Interactive "If You Were On That Day" Scenario Controller
 */
(function () {
  class ScenarioEngine {
    constructor() {
      this.scenarios = window.SEERAH_SCENARIOS || [];
      this.currentScenario = this.scenarios[0] || null;
      this.answers = {};
    }

    init() {
      this.renderSidebar();
      if (this.currentScenario) {
        this.selectScenario(this.currentScenario.id);
      }
    }

    renderSidebar() {
      const list = document.getElementById('scenario-list');
      if (!list) return;

      list.innerHTML = this.scenarios
        .map((sc, idx) => {
          const solved = Boolean(this.answers[sc.id]);
          return `
            <button class="scenario-nav-item ${this.currentScenario?.id === sc.id ? 'active' : ''}" data-sc-id="${sc.id}">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--gold-primary); margin-bottom:4px;">
                <span>الموقف ${idx + 1} • ${sc.era.split('•')[0]}</span>
                <span>${solved ? '✅ تمت المعايشة' : '⏳ بانتظار قرارك'}</span>
              </div>
              <strong style="font-size:0.92rem; color:var(--text-ivory);">${sc.title}</strong>
            </button>
          `;
        })
        .join('');

      list.querySelectorAll('.scenario-nav-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (window.SiragAudio) window.SiragAudio.playClick(500);
          this.selectScenario(btn.getAttribute('data-sc-id'));
        });
      });
    }

    selectScenario(id) {
      const sc = this.scenarios.find((s) => s.id === id);
      if (!sc) return;
      this.currentScenario = sc;
      if (window.SiragAudio) {
        window.SiragAudio.setAmbiance(sc.ambiance || 'calm');
      }
      this.renderSidebar();
      this.renderStage();
    }

    renderStage() {
      const stage = document.getElementById('scenario-stage');
      if (!stage || !this.currentScenario) return;
      const sc = this.currentScenario;
      const pickedChoiceId = this.answers[sc.id] || null;
      const pickedObj = sc.choices.find((c) => c.id === pickedChoiceId);

      stage.innerHTML = `
        <span class="inspector-date">🧭 مجلس المعايشة التفاعلي • ${sc.era}</span>
        <h3 class="inspector-title" style="margin-bottom:14px;">${sc.title}</h3>

        <div class="narrative-box" style="margin-bottom:16px;">
          <strong style="color:var(--gold-bright); display:block; margin-bottom:6px;">📜 المشهد التاريخي أمامك الآن:</strong>
          <p>${sc.situation}</p>
        </div>

        <h4 style="color:var(--teal-wahi); font-size:1.02rem; margin-bottom:8px;">❓ ${sc.question}</h4>

        <div class="choice-grid">
          ${sc.choices
            .map((ch) => {
              let cls = '';
              if (pickedChoiceId) {
                if (ch.isPropheticMatch) cls = 'selected-prophetic';
                else if (ch.id === pickedChoiceId) cls = 'selected-other';
              }
              return `
                <button class="choice-btn ${cls}" data-choice-id="${ch.id}">
                  <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
                    <span>${ch.text}</span>
                    ${
                      pickedChoiceId && ch.isPropheticMatch
                        ? '<span style="color:#10b981; font-weight:700; white-space:nowrap;">✨ الهدي النبوي</span>'
                        : ''
                    }
                  </div>
                </button>
              `;
            })
            .join('')}
        </div>

        ${
          pickedObj
            ? `
          <div class="revelation-outcome">
            <strong style="color:var(--gold-bright); font-size:1.05rem; display:block; margin-bottom:6px;">
              ${pickedObj.isPropheticMatch ? '🌟 بصيرة موفقة وافقت القرار النبوي!' : '💡 تأمل في اختيارك ومقارنته بالقرار النبوي:'}
            </strong>
            <p style="margin-bottom:12px; color:var(--text-ivory);">${pickedObj.feedback}</p>
            <hr style="border:none; border-top:1px solid var(--border-gold); margin:12px 0;" />
            <strong style="color:var(--teal-wahi); display:block; margin-bottom:4px;">ماذا حدث فعلاً في السيرة الشريفة؟</strong>
            <p style="margin-bottom:12px;">${sc.propheticOutcome}</p>
            <div style="background:rgba(7,12,20,0.65); padding:12px 14px; border-radius:10px; border-right:3px solid var(--gold-bright);">
              <strong style="color:var(--gold-bright);">${sc.lifeLesson}</strong>
            </div>
          </div>
        `
            : `<p style="font-size:0.82rem; color:var(--text-muted);">اختر أحد الخيارات الثلاثة أعلاه لكشف القرار النبوي والدرس القيادي.</p>`
        }
      `;

      stage.querySelectorAll('.choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-choice-id');
          this.answers[sc.id] = cid;
          if (window.SiragAudio) window.SiragAudio.playClick(620);
          if (window.SiragTracker) window.SiragTracker.markScenarioSolved(sc.id);
          this.renderSidebar();
          this.renderStage();
        });
      });
    }
  }

  window.SiragScenarios = new ScenarioEngine();
})();
