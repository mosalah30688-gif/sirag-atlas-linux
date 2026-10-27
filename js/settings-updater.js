/**
 * Sirag Atlas — Stage 16 (v1.2.0):
 * 1) Comprehensive Settings Center (Theme, 4-Step Font Size, Natural Soundscape, Notifications)
 * 2) Cross-Platform Live GitHub Update Engine (Android APK + Linux AppImage) with Notifications
 * 3) Desktop Electron Bridge Integration (Arabic Menu Shortcuts & External Browser Handler)
 * 4) Official Developer Attribution ("تم التطوير بواسطة محمد صلاح عبد الخالق")
 */
(function () {
  const APP_VERSION = '1.2.0';
  const REPO_SLUG = 'mosalah30688-gif/sirag-atlas-linux';
  const DEV_URL = 'https://elkatebmohamadsalah.blogspot.com/?m=1#google_vignette';

  const SETTINGS_STORAGE_KEY = 'sirag_atlas_settings_v2';

  class SettingsAndUpdater {
    constructor() {
      this.currentVersion = APP_VERSION;
      this.prefs = this.loadPrefs();
      this.latestRemoteInfo = null;
      this.updateAvailable = false;
    }

    loadPrefs() {
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return {
        theme: localStorage.getItem('sirag_atlas_theme_v1') || 'night',
        fontScale: 'normal',
        ambianceType: 'desert',
        autoUpdateNotify: true
      };
    }

    savePrefs() {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.prefs));
        localStorage.setItem('sirag_atlas_theme_v1', this.prefs.theme);
      } catch (_) {}
    }

    isLinuxEnvironment() {
      if (window.SiragDesktop?.isDesktop) return true;
      return /linux/i.test(navigator.platform || '') && !/android/i.test(navigator.userAgent || '');
    }

    init() {
      this.applyAppearance();
      this.bindHeaderSettingsBtn();
      this.bindDeveloperLinks();
      this.bindDesktopMenuBridge();

      if (this.prefs.autoUpdateNotify) {
        setTimeout(() => this.checkForUpdates(true), 2800);
      }
    }

    bindDesktopMenuBridge() {
      if (!window.SiragDesktop?.onMenuAction) return;
      window.SiragDesktop.onMenuAction(({ action, value }) => {
        if (action === 'open-settings') {
          this.openSettingsModal();
        } else if (action === 'open-search') {
          document.getElementById('omni-search-btn')?.click();
        } else if (action === 'switch-view' && value) {
          window.SiragApp?.switchView(value);
        } else if (action === 'set-theme' && value) {
          this.prefs.theme = value;
          this.savePrefs();
          this.applyAppearance();
        }
      });
    }

    applyAppearance() {
      document.body.classList.toggle('theme-parchment', this.prefs.theme === 'parchment');
      const scaleMap = {
        small: '14.5px',
        normal: '16px',
        large: '17.5px',
        xlarge: '19px'
      };
      document.documentElement.style.fontSize = scaleMap[this.prefs.fontScale] || '16px';
    }

    bindHeaderSettingsBtn() {
      document.getElementById('open-settings-btn')?.addEventListener('click', () => {
        if (window.SiragAudio) window.SiragAudio.playClick(560);
        this.openSettingsModal();
      });

      document.getElementById('mobile-settings-btn')?.addEventListener('click', () => {
        if (window.SiragAudio) window.SiragAudio.playClick(560);
        this.openSettingsModal();
      });
    }

    bindDeveloperLinks() {
      document.querySelectorAll('.dev-credit-link').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          this.openExternalUrl(DEV_URL);
        });
      });
    }

    openExternalUrl(url) {
      if (window.SiragDesktop?.openExternal) {
        window.SiragDesktop.openExternal(url);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    /* ============ VERSION COMPARISON & UPDATE ENGINE ============ */
    compareSemver(a, b) {
      const pa = String(a).replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
      const pb = String(b).replace(/^v/i, '').split('.').map((n) => parseInt(n, 10) || 0);
      for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) > (pb[i] || 0)) return 1;
        if ((pa[i] || 0) < (pb[i] || 0)) return -1;
      }
      return 0;
    }

    async checkForUpdates(silent = false) {
      const statusBox = document.getElementById('settings-update-status');
      if (statusBox && !silent) {
        statusBox.innerHTML = `<span style="color:var(--gold-bright);">⏳ جاري الاتصال بمستودع GitHub للتحقق من آخر إصدار...</span>`;
      }

      try {
        const cacheBust = Date.now();
        const [verRes, relRes] = await Promise.allSettled([
          fetch(`https://raw.githubusercontent.com/${REPO_SLUG}/main/version.json?t=${cacheBust}`, { cache: 'no-store' }),
          fetch(`https://api.github.com/repos/${REPO_SLUG}/releases/latest`, {
            headers: { Accept: 'application/vnd.github+json' },
            cache: 'no-store'
          })
        ]);

        let remoteVersion = this.currentVersion;
        let changelog = 'تحديثات وتحسينات جديدة من المستودع الرسمي.';
        let apkUrl = `https://github.com/${REPO_SLUG}/releases/latest/download/sirag-atlas-seerah.apk`;
        let appImageUrl = `https://github.com/${REPO_SLUG}/releases/latest/download/Sirag-Atlas-Seerah-x86_64.AppImage`;

        if (verRes.status === 'fulfilled' && verRes.value.ok) {
          const vData = await verRes.value.json();
          if (vData.version) remoteVersion = vData.version;
          if (vData.changelog) changelog = vData.changelog;
          if (vData.apkUrl) apkUrl = vData.apkUrl;
          if (vData.appImageUrl) appImageUrl = vData.appImageUrl;
        }

        if (relRes.status === 'fulfilled' && relRes.value.ok) {
          const rData = await relRes.value.json();
          const tagVer = (rData.tag_name || '').replace(/^v/i, '');
          if (tagVer && this.compareSemver(tagVer, remoteVersion) > 0) {
            remoteVersion = tagVer;
          }
          const apkAsset = (rData.assets || []).find((a) => a.name && a.name.endsWith('.apk'));
          if (apkAsset?.browser_download_url) apkUrl = apkAsset.browser_download_url;

          const appImageAsset = (rData.assets || []).find(
            (a) => a.name && a.name.endsWith('.AppImage') && !a.name.includes('Lite')
          );
          if (appImageAsset?.browser_download_url) appImageUrl = appImageAsset.browser_download_url;
        }

        this.latestRemoteInfo = { remoteVersion, changelog, apkUrl, appImageUrl };
        const isNewer = this.compareSemver(remoteVersion, this.currentVersion) > 0;
        this.updateAvailable = isNewer;

        const dot = document.getElementById('settings-update-dot');
        if (dot) dot.style.display = isNewer ? 'block' : 'none';

        const preferredBinaryUrl = this.isLinuxEnvironment() ? appImageUrl : apkUrl;

        if (isNewer) {
          this.triggerUpdateNotification(remoteVersion, changelog, preferredBinaryUrl);
          if (statusBox) {
            statusBox.innerHTML = `
              <div class="update-alert-card">
                <strong>🔔 يتوفر إصدار أحدث (${remoteVersion}) على المستودع!</strong>
                <p>${changelog}</p>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
                  <button class="btn-gold" id="install-remote-update-now" style="flex:1;">
                    ⬇️ تنزيل التحديث (${this.isLinuxEnvironment() ? 'Linux AppImage' : 'Android / مزامنة'})
                  </button>
                </div>
              </div>
            `;
            document.getElementById('install-remote-update-now')?.addEventListener('click', () => {
              this.applyAndDownloadUpdate(preferredBinaryUrl);
            });
          }
        } else if (!silent) {
          this.showToast(`✅ تطبيقك محدّث إلى آخر إصدار على المستودع (v${this.currentVersion})`, 'success');
          if (statusBox) {
            statusBox.innerHTML = `
              <div style="padding:12px; border-radius:12px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.4);">
                <strong style="color:#10b981; display:block; margin-bottom:4px;">✅ أنت على أحدث إصدار (v${this.currentVersion})</strong>
                <span style="font-size:0.8rem; color:var(--text-secondary);">المستودع متصل ويعمل بنجاح. يمكنك مزامنة الملفات أو تنزيل الحزم الرسمية لنظامي أندرويد ولينكس:</span>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
                  <button class="btn-outline" id="force-sw-sync-btn" style="flex:1; font-size:0.77rem;">🔄 مزامنة المحتوى</button>
                  <button class="btn-outline" id="redownload-apk-btn" style="flex:1; font-size:0.77rem;">🤖 حزمة Android APK</button>
                  <button class="btn-outline" id="redownload-appimage-btn" style="flex:1; font-size:0.77rem;">🐧 حزمة Linux AppImage</button>
                </div>
              </div>
            `;
            document.getElementById('force-sw-sync-btn')?.addEventListener('click', () => this.refreshWebCache());
            document.getElementById('redownload-apk-btn')?.addEventListener('click', () => this.openExternalUrl(apkUrl));
            document.getElementById('redownload-appimage-btn')?.addEventListener('click', () => this.openExternalUrl(appImageUrl));
          }
        }
      } catch (_) {
        if (!silent && statusBox) {
          statusBox.innerHTML = `<span style="color:var(--amber-warn); font-size:0.84rem;">⚠️ تعذّر الاتصال بالمستودع حالياً — تأكد من اتصالك بالإنترنت (جميع مزايا التطبيق تعمل أوفلاين بالكامل).</span>`;
        }
      }
    }

    triggerUpdateNotification(version, changelog, targetUrl) {
      this.showToast(
        `🔔 تحديث جديد متاح (v${version}): ${changelog}`,
        'update',
        () => this.applyAndDownloadUpdate(targetUrl)
      );

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          const n = new Notification(`تحديث جديد — سراج أطلس السيرة النبوية v${version}`, {
            body: changelog,
            icon: 'assets/icon-192.png'
          });
          n.onclick = () => {
            window.focus();
            this.applyAndDownloadUpdate(targetUrl);
          };
        } catch (_) {}
      }
    }

    async applyAndDownloadUpdate(targetUrl) {
      this.showToast('⏳ جاري تنزيل التحديث ومزامنة ملفات المستودع...', 'success');
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (_) {}
      }
      const isAndroid = /android/i.test(navigator.userAgent || '');
      if ((isAndroid || this.isLinuxEnvironment()) && targetUrl) {
        this.openExternalUrl(targetUrl);
      } else {
        window.location.reload();
      }
    }

    async refreshWebCache() {
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (_) {}
      }
      this.showToast('✅ تمت مزامنة أحدث ملفات المستودع بنجاح! جاري التحديث...', 'success');
      setTimeout(() => window.location.reload(), 900);
    }

    showToast(message, type = 'info', onAction = null) {
      let bar = document.getElementById('sirag-toast-banner');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'sirag-toast-banner';
        bar.className = 'sirag-toast-banner';
        document.body.appendChild(bar);
      }

      if (window.SiragAudio) window.SiragAudio.playClick(660);

      bar.innerHTML = `
        <div class="toast-content">
          <span>${message}</span>
          <div style="display:flex; gap:8px; align-items:center;">
            ${onAction ? `<button class="btn-gold" id="toast-action-btn" style="padding:5px 12px; font-size:0.78rem;">تحديث الآن</button>` : ''}
            <button class="toast-close-btn" id="toast-dismiss-btn" aria-label="إغلاق">✕</button>
          </div>
        </div>
      `;
      bar.classList.add('visible');

      document.getElementById('toast-dismiss-btn')?.addEventListener('click', () => {
        bar.classList.remove('visible');
      });

      if (onAction) {
        document.getElementById('toast-action-btn')?.addEventListener('click', () => {
          bar.classList.remove('visible');
          onAction();
        });
      } else {
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => bar.classList.remove('visible'), 5000);
      }
    }

    /* ============ SETTINGS MODAL UI ============ */
    openSettingsModal() {
      const modal = document.getElementById('relic-modal');
      const content = document.getElementById('relic-modal-content');
      if (!modal || !content) return;

      const audioOn = Boolean(window.SiragAudio?.enabled);

      content.innerHTML = `
        <div class="settings-modal-header">
          <div>
            <span class="inspector-date">⚙️ مركز التحكم والتفضيلات • الإصدار v${this.currentVersion}</span>
            <h3 class="inspector-title">إعدادات التطبيق والتحديثات</h3>
          </div>
          <button class="btn-outline" id="close-settings-modal">✕ إغلاق</button>
        </div>

        <div class="settings-sections-stack">
          <!-- 1. Live Repository Update Section -->
          <div class="settings-group-card">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
              <div>
                <strong style="color:var(--gold-bright); font-size:0.96rem;">🔄 التحديث المباشر من المستودع بالإشعارات</strong>
                <p style="font-size:0.78rem; color:var(--text-secondary);">متصل بمستودع GitHub الرسمي لنظامي أندرويد (APK) ولينكس (AppImage)</p>
              </div>
              <span class="era-badge" style="font-size:0.74rem;">v${this.currentVersion}</span>
            </div>

            <button class="btn-gold" id="check-updates-now-btn" style="width:100%; margin-bottom:10px;">
              🔄 التحقق من وجود تحديثات جديدة وتنزيلها
            </button>

            <label class="settings-toggle-row">
              <span>🔔 تفعيل إشعارات التحديثات التلقائية عند فتح التطبيق</span>
              <input type="checkbox" id="toggle-auto-notify" ${this.prefs.autoUpdateNotify ? 'checked' : ''} />
            </label>

            <div id="settings-update-status" style="margin-top:8px;"></div>
          </div>

          <!-- 2. Theme & Font Size Comfort -->
          <div class="settings-group-card">
            <strong style="color:var(--gold-bright); display:block; margin-bottom:10px; font-size:0.96rem;">🎨 المظهر وحجم الخط</strong>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
              <button class="btn-outline ${this.prefs.theme === 'night' ? 'active' : ''}" data-set-theme="night">
                🌙 الوضع الليلي الفلكي
              </button>
              <button class="btn-outline ${this.prefs.theme === 'parchment' ? 'active' : ''}" data-set-theme="parchment">
                📜 الرقّ النهاري العاجي
              </button>
            </div>

            <span style="font-size:0.8rem; color:var(--text-secondary); display:block; margin-bottom:6px;">حجم الخط المريح للقراءة:</span>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px;">
              <button class="btn-outline ${this.prefs.fontScale === 'small' ? 'active' : ''}" data-set-font="small">صغير</button>
              <button class="btn-outline ${this.prefs.fontScale === 'normal' ? 'active' : ''}" data-set-font="normal">متوسط</button>
              <button class="btn-outline ${this.prefs.fontScale === 'large' ? 'active' : ''}" data-set-font="large">كبير</button>
              <button class="btn-outline ${this.prefs.fontScale === 'xlarge' ? 'active' : ''}" data-set-font="xlarge">كبير جداً</button>
            </div>
          </div>

          <!-- 3. Natural Soundscape (No Music) -->
          <div class="settings-group-card">
            <strong style="color:var(--gold-bright); display:block; margin-bottom:8px; font-size:0.96rem;">🌬️ الأجواء الصوتية الطبيعية (بدون موسيقى)</strong>
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              <button class="${audioOn ? 'btn-gold' : 'btn-outline'}" id="settings-audio-toggle" style="flex:1;">
                ${audioOn ? '🔊 الأجواء الطبيعية مفعّلة (اضغط للإيقاف)' : '🔇 تشغيل الأجواء الطبيعية الهادئة'}
              </button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-top:8px;">
              <button class="btn-outline ${this.prefs.ambianceType === 'desert' ? 'active' : ''}" data-set-amb="desert">🌙 نسيم الليل</button>
              <button class="btn-outline ${this.prefs.ambianceType === 'rain' ? 'active' : ''}" data-set-amb="rain">🌧️ مطر بدر</button>
              <button class="btn-outline ${this.prefs.ambianceType === 'wind' ? 'active' : ''}" data-set-amb="wind">🍃 رياح الجبال</button>
            </div>
          </div>

          <!-- 4. Developer Credit Card -->
          <div class="settings-group-card developer-credit-card">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
              <img src="assets/icon-round.png" alt="سراج أطلس السيرة النبوية" style="width:46px; height:46px; border-radius:50%; border:1.5px solid var(--gold-bright);" />
              <div>
                <span style="font-size:0.75rem; color:var(--teal-wahi); display:block;">حقوق التطوير والإعداد</span>
                <strong style="font-family:var(--font-serif); font-size:1.18rem; color:var(--gold-bright);">
                  تم التطوير بواسطة محمد صلاح عبد الخالق
                </strong>
              </div>
            </div>
            <a href="${DEV_URL}" target="_blank" rel="noopener noreferrer" class="btn-gold dev-modal-btn" style="width:100%; text-decoration:none;">
              🌐 تم التطوير بواسطة محمد صلاح عبد الخالق — زيارة الموقع ↗
            </a>
          </div>
        </div>
      `;

      modal.classList.add('open');

      document.getElementById('close-settings-modal')?.addEventListener('click', () => {
        modal.classList.remove('open');
      });

      document.getElementById('check-updates-now-btn')?.addEventListener('click', async () => {
        if ('Notification' in window && Notification.permission === 'default') {
          try { await Notification.requestPermission(); } catch (_) {}
        }
        this.checkForUpdates(false);
      });

      document.getElementById('toggle-auto-notify')?.addEventListener('change', async (e) => {
        this.prefs.autoUpdateNotify = e.target.checked;
        this.savePrefs();
        if (this.prefs.autoUpdateNotify && 'Notification' in window && Notification.permission === 'default') {
          try { await Notification.requestPermission(); } catch (_) {}
        }
      });

      content.querySelectorAll('[data-set-theme]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.prefs.theme = btn.getAttribute('data-set-theme');
          this.savePrefs();
          this.applyAppearance();
          if (window.SiragAudio) window.SiragAudio.playClick(520);
          this.openSettingsModal();
        });
      });

      content.querySelectorAll('[data-set-font]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.prefs.fontScale = btn.getAttribute('data-set-font');
          this.savePrefs();
          this.applyAppearance();
          if (window.SiragAudio) window.SiragAudio.playClick(540);
          this.openSettingsModal();
        });
      });

      document.getElementById('settings-audio-toggle')?.addEventListener('click', () => {
        window.SiragAudio?.toggle();
        if (window.SiragAudio?.enabled && window.SiragAudio?.setAmbianceMode) {
          window.SiragAudio.setAmbianceMode(this.prefs.ambianceType);
        }
        this.openSettingsModal();
      });

      content.querySelectorAll('[data-set-amb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.prefs.ambianceType = btn.getAttribute('data-set-amb');
          this.savePrefs();
          if (window.SiragAudio?.setAmbianceMode) {
            window.SiragAudio.setAmbianceMode(this.prefs.ambianceType);
          }
          if (!window.SiragAudio?.enabled) {
            window.SiragAudio?.toggle();
          }
          this.openSettingsModal();
        });
      });

      content.querySelector('.dev-modal-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.openExternalUrl(DEV_URL);
      });
    }
  }

  window.SiragSettings = new SettingsAndUpdater();
})();
