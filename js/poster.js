/**
 * Sirag Atlas — Stage 9: Royal Gilded Poster Generator (HTML5 Canvas 1080x1350 PNG + Copy Quote)
 * Generates high-resolution shareable Arabic Seerah cards offline right in the browser!
 */
(function () {
  class GoldenPosterStudio {
    openForStation(ev) {
      if (!ev) return;
      if (window.SiragAudio) window.SiragAudio.playClick(610);

      const modal = document.getElementById('relic-modal');
      const content = document.getElementById('relic-modal-content');
      if (!modal || !content) return;

      content.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px;">
          <div>
            <span class="inspector-date">🖼️ استوديو البطاقة النبوية المذهّبة</span>
            <h3 class="inspector-title" style="font-size:1.35rem;">معاينة وتحميل بطاقة المشاركة</h3>
          </div>
          <button class="btn-outline" id="close-poster-modal">✕ إغلاق</button>
        </div>

        <div style="background:#05080f; border:1px solid var(--border-gold); border-radius:14px; padding:12px; text-align:center;">
          <canvas id="seerah-poster-canvas" width="1080" height="1350"
                  style="width:100%; max-width:360px; height:auto; border-radius:10px; box-shadow:0 12px 32px rgba(0,0,0,0.65);"></canvas>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:16px;">
          <button class="btn-gold" id="download-poster-png">⬇️ تحميل البطاقة عالية الدقة (PNG)</button>
          <button class="btn-outline" id="copy-poster-text">📋 نسخ النص والآية للمشاركة</button>
        </div>
        <p id="poster-status-msg" style="text-align:center; font-size:0.8rem; color:var(--teal-wahi); margin-top:8px; min-height:1.2em;"></p>
      `;

      modal.classList.add('open');

      document.getElementById('close-poster-modal')?.addEventListener('click', () => {
        modal.classList.remove('open');
      });

      const canvas = document.getElementById('seerah-poster-canvas');
      if (canvas) {
        this.drawPoster(canvas, ev);
      }

      document.getElementById('download-poster-png')?.addEventListener('click', () => {
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `sirag-atlas-${ev.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        const msg = document.getElementById('poster-status-msg');
        if (msg) msg.textContent = '✅ تم تجهيز وتحميل البطاقة الذهبية بنجاح!';
      });

      document.getElementById('copy-poster-text')?.addEventListener('click', async () => {
        const shareText = `✨ ${ev.title} (${ev.yearLabel})\n📍 ${ev.locationName}\n\n${ev.depths.flash}\n\n${ev.wahi.ayah} — ${ev.wahi.surah}\n\n— سِراج الأطلس (الأطلس النبوي الحي ﷺ)`;
        try {
          await navigator.clipboard.writeText(shareText);
          const msg = document.getElementById('poster-status-msg');
          if (msg) msg.textContent = '✅ تم نسخ النص المنسّق إلى الحافظة!';
        } catch (_) {
          const msg = document.getElementById('poster-status-msg');
          if (msg) msg.textContent = 'يمكنك تحميل البطاقة كصورة PNG مباشرة من الزر الذهبي.';
        }
      });
    }

    drawPoster(canvas, ev) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      // 1. Deep Celestial Gradient Background
      const bgGrad = ctx.createRadialGradient(W / 2, H * 0.22, 60, W / 2, H * 0.5, H * 0.85);
      bgGrad.addColorStop(0, '#162842');
      bgGrad.addColorStop(0.55, '#0b1423');
      bgGrad.addColorStop(1, '#050911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Astrolabe Subtle Rings
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.lineWidth = 2;
      [220, 360, 500].forEach((r) => {
        ctx.beginPath();
        ctx.arc(W / 2, 230, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 3. Double Ornate Gold Frame
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(44, 44, W - 88, H - 88);
      ctx.strokeStyle = 'rgba(245, 215, 127, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 60, W - 120, H - 120);

      // 4. Prophetic Golden Seal Medallion at Top
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, 175, 76, 0, Math.PI * 2);
      ctx.fillStyle = '#0c1626';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#f5d77f';
      ctx.stroke();

      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d77f';
      ctx.font = 'bold 28px Amiri, serif';
      ctx.fillText('اللّٰه', W / 2, 148);
      ctx.fillText('رَسُولُ', W / 2, 182);
      ctx.fillText('مُحَمَّدٌ', W / 2, 216);
      ctx.restore();

      // 5. Era & Date Pill
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2dd4bf';
      ctx.font = '600 26px "Readex Pro", sans-serif';
      ctx.fillText(`${ev.yearLabel}  •  المحطة ${ev.order}`, W / 2, 308);

      // 6. Title
      ctx.fillStyle = '#f5d77f';
      ctx.font = 'bold 46px Amiri, serif';
      this.wrapArabicText(ctx, ev.title, W / 2, 380, W - 180, 62);

      // 7. Location Subtitle
      ctx.fillStyle = '#c5bfb0';
      ctx.font = '500 25px "Readex Pro", sans-serif';
      ctx.fillText(`📍 ${ev.locationName}`, W / 2, 495);

      // Divider
      ctx.strokeStyle = 'rgba(212,175,55,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(220, 535);
      ctx.lineTo(W - 220, 535);
      ctx.stroke();

      // 8. Flash Narrative Body
      ctx.fillStyle = '#f8f4ea';
      ctx.font = '400 30px "Readex Pro", sans-serif';
      const afterStoryY = this.wrapArabicText(ctx, ev.depths.flash, W / 2, 600, W - 190, 52);

      // 9. Quranic Wahi Box
      const boxTop = Math.max(850, afterStoryY + 35);
      ctx.fillStyle = 'rgba(13, 45, 52, 0.68)';
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(95, boxTop, W - 190, 275, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 24px "Readex Pro", sans-serif';
      ctx.fillText(`✨ نبض الوحي المتزامن • ${ev.wahi.surah}`, W / 2, boxTop + 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px Amiri, serif';
      this.wrapArabicText(ctx, ev.wahi.ayah, W / 2, boxTop + 112, W - 250, 54);

      // 10. Signature Footer
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 26px Amiri, serif';
      ctx.fillText('سِراج الأطلس — الأطلس الزماني-المكاني الحي للسيرة النبوية ﷺ', W / 2, H - 88);
    }

    wrapArabicText(ctx, text, x, startY, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let y = startY;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), x, y);
        y += lineHeight;
      }
      return y;
    }
  }

  window.SiragPoster = new GoldenPosterStudio();
})();
