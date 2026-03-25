/**
 * ============================================================
 * BeatByJosh — script.js
 * Mobile-first rebuild.
 *
 * KEY MOBILE FIXES vs previous version:
 *   1. touchstart listener fires audio IMMEDIATELY — no 300ms
 *      click delay that made it feel sluggish / broken
 *   2. preventDefault() on touch stops ghost click after tap
 *   3. touch-action: manipulation in CSS kills double-tap zoom
 *   4. AudioContext is resumed on the very first touch/click
 *      (required by iOS Safari's autoplay policy)
 *   5. Volume slider is now horizontal — easy to drag with thumb
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── WEB AUDIO CONTEXT ──────────────────────────────────────
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ── NOISE BUFFER HELPER ────────────────────────────────────
  function makeNoiseBuffer(ctx, duration) {
    const len    = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function makeGain(ctx, value) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(value, ctx.currentTime);
    return g;
  }

  // ── DRUM SYNTHESISERS ──────────────────────────────────────

  function playKick(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g   = makeGain(ctx, vol);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.5);
  }

  function playSnare(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx, 0.3);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 0.7;
    const ng = makeGain(ctx, vol * 0.7);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noise.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.3);
    // Tone crack
    const osc = ctx.createOscillator();
    osc.type = 'triangle'; osc.frequency.value = 200;
    const og = makeGain(ctx, vol * 0.5);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(og); og.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.15);
  }

  function playHihat(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx, 0.1);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 8000;
    const g = makeGain(ctx, vol * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noise.connect(hp); hp.connect(g); g.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.1);
  }

  function playClap(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    [0, 0.01, 0.02].forEach((offset, i) => {
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx, 0.15);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.5;
      const g = makeGain(ctx, vol * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.08 + i * 0.01);
      noise.connect(bp); bp.connect(g); g.connect(ctx.destination);
      noise.start(t + offset); noise.stop(t + offset + 0.15);
    });
  }

  function playTom(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.4);
    const g = makeGain(ctx, vol * 0.9);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.4);
  }

  function playOpenhat(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx, 0.5);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = makeGain(ctx, vol * 0.55);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    noise.connect(hp); hp.connect(g); g.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.5);
  }

  function playRim(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 480;
    const g = makeGain(ctx, vol * 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  function playCrash(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = makeNoiseBuffer(ctx, 1.5);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 9000; bp.Q.value = 0.5;
    const g = makeGain(ctx, vol * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    noise.connect(hp); hp.connect(bp); bp.connect(g); g.connect(ctx.destination);
    noise.start(t); noise.stop(t + 1.5);
  }

  function playPerc(vol) {
    const ctx = getAudioContext(), t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);
    const g = makeGain(ctx, vol * 0.65);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  }

  const soundMap = {
    kick: playKick, snare: playSnare, hihat: playHihat,
    clap: playClap, tom: playTom, openhat: playOpenhat,
    rim: playRim, crash: playCrash, perc: playPerc,
  };

  // ── DOM REFERENCES ─────────────────────────────────────────
  const displayText  = document.getElementById('display-text');
  const pads         = document.querySelectorAll('.drum-pad');
  const volumeSlider = document.getElementById('volume-slider');
  const volDisplay   = document.getElementById('vol-display');
  const powerSwitch  = document.getElementById('power-switch');
  const machineCard  = document.getElementById('drum-machine');
  const themeToggle  = document.getElementById('theme-toggle');
  const themeIcon    = document.getElementById('theme-icon');
  const clockTime    = document.getElementById('clock-time');
  const clockDate    = document.getElementById('clock-date');

  // ── STATE ──────────────────────────────────────────────────
  let isPoweredOn   = true;
  let currentVolume = parseFloat(volumeSlider.value);
  let currentTheme  = 'dark';

  // Key → pad map for keyboard handler
  const keyToPadMap = new Map();
  pads.forEach(pad => keyToPadMap.set(pad.dataset.key.toUpperCase(), pad));

  // ── PLAY PAD ───────────────────────────────────────────────
  function playPad(pad) {
    if (!isPoweredOn) return;
    const fn = soundMap[pad.dataset.sound];
    if (fn) fn(currentVolume);
    updateDisplay(pad.dataset.name);
    activatePad(pad);
  }

  function updateDisplay(text) {
    displayText.textContent = text;
    displayText.classList.remove('flash');
    void displayText.offsetWidth; // force reflow
    displayText.classList.add('flash');
  }

  function activatePad(pad) {
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 280);
  }

  // ── TOUCH EVENTS (mobile — fires immediately, no 300ms lag) ─
  pads.forEach(pad => {
    pad.addEventListener('touchstart', (e) => {
      e.preventDefault(); // stops ghost click firing after touchend
      playPad(pad);
    }, { passive: false });

    // Click fallback for desktop / devices without touch
    pad.addEventListener('click', () => {
      // Only fire on non-touch (touchstart already handled it)
      if (!('ontouchstart' in window)) {
        playPad(pad);
      }
    });
  });

  // ── KEYBOARD ──────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!isPoweredOn || e.repeat) return;
    const pad = keyToPadMap.get(e.key.toUpperCase());
    if (pad) playPad(pad);
  });

  // ── VOLUME ────────────────────────────────────────────────
  volumeSlider.addEventListener('input', () => {
    currentVolume = parseFloat(volumeSlider.value);
    volDisplay.textContent = `${Math.round(currentVolume * 100)}%`;
  });

  // ── POWER ─────────────────────────────────────────────────
  powerSwitch.addEventListener('change', () => {
    isPoweredOn = powerSwitch.checked;
    if (isPoweredOn) {
      machineCard.classList.remove('powered-off');
      updateDisplay('— READY —');
    } else {
      machineCard.classList.add('powered-off');
      displayText.textContent = '— OFF —';
      pads.forEach(p => p.classList.remove('active'));
    }
  });

  // ── THEME ─────────────────────────────────────────────────
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  });

  // Touch handler for theme button too
  themeToggle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  }, { passive: false });

  // ── CLOCK ─────────────────────────────────────────────────
  const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN',
                  'JUL','AUG','SEP','OCT','NOV','DEC'];

  function updateClock() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2,'0');
    const mm  = String(now.getMinutes()).padStart(2,'0');
    const ss  = String(now.getSeconds()).padStart(2,'0');
    clockTime.textContent = `${hh}:${mm}:${ss}`;
    const d = DAYS[now.getDay()];
    const dd = String(now.getDate()).padStart(2,'0');
    const mo = MONTHS[now.getMonth()];
    clockDate.textContent = `${d} ${dd} ${mo} ${now.getFullYear()}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  console.log('🥁 BeatByJosh ready!');

});
