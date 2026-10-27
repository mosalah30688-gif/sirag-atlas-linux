/**
 * Sirag Atlas — Procedural Natural Soundscape Engine (No Music)
 * Synthesizes natural desert breeze, gentle rain (Badr), and subtle parchment tactile clicks via Web Audio API.
 */
(function () {
  class NaturalSoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.currentAmbiance = 'desert'; // 'desert' | 'rain' | 'calm'
      this.noiseNode = null;
      this.filterNode = null;
      this.gainNode = null;
      this.lfo = null;
      this.rainTimer = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }

    toggle() {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.startAmbiance(this.currentAmbiance);
        this.playClick(520);
      } else {
        this.stopAmbiance();
      }
      return this.enabled;
    }

    setAmbiance(mode) {
      this.currentAmbiance = mode || 'desert';
      if (this.enabled) {
        this.startAmbiance(this.currentAmbiance);
      }
    }

    startAmbiance(mode) {
      this.stopAmbiance();
      if (!this.ctx || !this.enabled) return;

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown/pinkish natural noise
        output[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = output[i];
        output[i] *= 2.4;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.gainNode = this.ctx.createGain();

      if (mode === 'rain') {
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.value = 950;
        this.filterNode.Q.value = 0.65;
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.065, this.ctx.currentTime + 1.2);
        this.rainTimer = setInterval(() => this.playRaindrop(), 280);
      } else if (mode === 'wind') {
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.value = 340;
        this.filterNode.Q.value = 2.8;
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);

        // Slow natural wind swell
        this.lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        this.lfo.frequency.value = 0.14;
        lfoGain.gain.value = 160;
        this.lfo.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);
        this.lfo.start();
      } else {
        // Gentle night desert breeze
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 260;
        this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 1.5);
      }

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      this.noiseNode.start();
    }

    playRaindrop() {
      if (!this.ctx || !this.enabled || Math.random() > 0.65) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 + Math.random() * 700, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);
      g.gain.setValueAtTime(0.012, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    }

    stopAmbiance() {
      if (this.rainTimer) {
        clearInterval(this.rainTimer);
        this.rainTimer = null;
      }
      if (this.lfo) {
        try { this.lfo.stop(); } catch (_) {}
        this.lfo = null;
      }
      if (this.noiseNode) {
        try { this.noiseNode.stop(); } catch (_) {}
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
    }

    playClick(freq = 440) {
      if (!this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.045);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    }
  }

  window.SiragAudio = new NaturalSoundEngine();
})();
