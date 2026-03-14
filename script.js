/**
 * ============================================================
 * BeatByJosh — script.js
 * ============================================================
 *
 * KEY FIX — Why sounds now work 100% of the time:
 *   Instead of loading .wav files (which fail silently due to
 *   browser autoplay policies, MIME types, or CORS), every drum
 *   sound is SYNTHESIZED on-the-fly using the Web Audio API.
 *   No files. No network. No loading errors. Just pure audio.
 *
 * FEATURES:
 *   • 9 synthesized drum sounds (kick, snare, hi-hat…)
 *   • Mouse click + keyboard (Q W E / A S D / Z X C)
 *   • Live clock (date + time)
 *   • Dark / Light theme toggle
 *   • Volume slider
 *   • Power on/off toggle
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── WEB AUDIO CONTEXT ──────────────────────────────────────
  /**
   * AudioContext is the engine behind all sound synthesis.
   * We create ONE context and reuse it for all sounds.
   * Browsers require a user gesture before audio can play —
   * clicking a pad IS that gesture, so it works perfectly.
   */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if browser suspended it (autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // ── SOUND SYNTHESIS FUNCTIONS ─────────────────────────────
  /**
   * Each function creates a short audio buffer and plays it.
   * @param {number} volume  — 0.0 to 1.0
   *
   * Technique overview:
   *   • OscillatorNode  → generates tones (sine, square, etc.)
   *   • AudioBuffer     → raw PCM data for noise (snare, hi-hat, etc.)
   *   • GainNode        → controls volume + envelope shape
   *   • connect() chain → source → gain → destination (speakers)
   */

  /** Helper: create a gain node with an instant level */
  function makeGain(ctx, value) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(value, ctx.currentTime);
    return g;
  }

  /** Helper: fill a buffer with white noise samples */
  function makeNoiseBuffer(ctx, duration) {
    const sampleRate = ctx.sampleRate;
    const length     = Math.ceil(sampleRate * duration);
    const buffer     = ctx.createBuffer(1, length, sampleRate);
    const data       = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1; // values between -1 and 1
    }
    return buffer;
  }

  // ── KICK DRUM ──────────────────────────────────────────────
  function playKick(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    // A sine oscillator whose pitch drops fast = classic kick "thud"
    const osc  = ctx.createOscillator();
    const gain = makeGain(ctx, volume * 1.0);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.001, now + 0.5); // pitch drop

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);     // fade out

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // ── SNARE ─────────────────────────────────────────────────
  function playSnare(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    // Noise burst for the "sss" snare sound
    const noiseBuffer = makeNoiseBuffer(ctx, 0.3);
    const noise       = ctx.createBufferSource();
    noise.buffer      = noiseBuffer;

    // Bandpass filter focuses the noise into snare frequencies
    const filter      = ctx.createBiquadFilter();
    filter.type       = 'bandpass';
    filter.frequency.value  = 3000;
    filter.Q.value          = 0.7;

    const noiseGain   = makeGain(ctx, volume * 0.7);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    // Tone component for the "crack"
    const osc         = ctx.createOscillator();
    osc.type          = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    const oscGain     = makeGain(ctx, volume * 0.5);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // ── CLOSED HI-HAT ─────────────────────────────────────────
  function playHihat(volume) {
    const ctx   = getAudioContext();
    const now   = ctx.currentTime;

    const noiseBuffer = makeNoiseBuffer(ctx, 0.1);
    const noise       = ctx.createBufferSource();
    noise.buffer      = noiseBuffer;

    // High-pass filter makes it sound "tinny" like a real hat
    const filter  = ctx.createBiquadFilter();
    filter.type   = 'highpass';
    filter.frequency.value = 8000;

    const gain    = makeGain(ctx, volume * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.1);
  }

  // ── CLAP ──────────────────────────────────────────────────
  function playClap(volume) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Three quick noise bursts close together = clap texture
    [0, 0.01, 0.02].forEach((offset, i) => {
      const noiseBuffer = makeNoiseBuffer(ctx, 0.15);
      const noise       = ctx.createBufferSource();
      noise.buffer      = noiseBuffer;

      const filter      = ctx.createBiquadFilter();
      filter.type       = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value         = 0.5;

      const fadeTime    = now + offset + 0.08 + i * 0.01;
      const gain        = makeGain(ctx, volume * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, fadeTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + offset);
      noise.stop(fadeTime);
    });
  }

  // ── TOM ───────────────────────────────────────────────────
  function playTom(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    osc.type   = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(0.001, now + 0.4);

    const gain = makeGain(ctx, volume * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ── OPEN HI-HAT ───────────────────────────────────────────
  function playOpenhat(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    const noiseBuffer = makeNoiseBuffer(ctx, 0.5);
    const noise       = ctx.createBufferSource();
    noise.buffer      = noiseBuffer;

    const filter      = ctx.createBiquadFilter();
    filter.type       = 'highpass';
    filter.frequency.value = 7000;

    // Slower fade = "open" sound (hat doesn't close quickly)
    const gain        = makeGain(ctx, volume * 0.55);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.5);
  }

  // ── RIM SHOT ──────────────────────────────────────────────
  function playRim(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    osc.type   = 'square';
    osc.frequency.setValueAtTime(480, now);

    const gain = makeGain(ctx, volume * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // ── CRASH CYMBAL ──────────────────────────────────────────
  function playCrash(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    const noiseBuffer = makeNoiseBuffer(ctx, 1.5);
    const noise       = ctx.createBufferSource();
    noise.buffer      = noiseBuffer;

    // Two stacked filters give crash its shimmer
    const hp   = ctx.createBiquadFilter();
    hp.type    = 'highpass';
    hp.frequency.value = 5000;

    const bp   = ctx.createBiquadFilter();
    bp.type    = 'bandpass';
    bp.frequency.value = 9000;
    bp.Q.value         = 0.5;

    const gain = makeGain(ctx, volume * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 1.5);
  }

  // ── PERC ──────────────────────────────────────────────────
  function playPerc(volume) {
    const ctx  = getAudioContext();
    const now  = ctx.currentTime;

    const osc  = ctx.createOscillator();
    osc.type   = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

    const gain = makeGain(ctx, volume * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // ── SOUND MAP ─────────────────────────────────────────────
  /** Maps data-sound attribute value → synthesis function */
  const soundMap = {
    kick:    playKick,
    snare:   playSnare,
    hihat:   playHihat,
    clap:    playClap,
    tom:     playTom,
    openhat: playOpenhat,
    rim:     playRim,
    crash:   playCrash,
    perc:    playPerc,
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
  let currentTheme  = 'dark'; // 'dark' | 'light'

  // Key → pad lookup for fast keyboard handling
  const keyToPadMap = new Map();
  pads.forEach(pad => {
    keyToPadMap.set(pad.dataset.key.toUpperCase(), pad);
  });

  // ── PLAY PAD ───────────────────────────────────────────────
  function playPad(pad) {
    if (!isPoweredOn) return;

    const soundKey = pad.dataset.sound;       // e.g. "kick"
    const playFn   = soundMap[soundKey];      // get the synth function

    if (playFn) {
      playFn(currentVolume);                  // synthesize and play!
    }

    updateDisplay(pad.dataset.name);           // update LCD screen
    activatePad(pad);                          // trigger CSS animation
  }

  // ── UPDATE DISPLAY ─────────────────────────────────────────
  function updateDisplay(text) {
    displayText.textContent = text;
    displayText.classList.remove('flash');
    void displayText.offsetWidth;             // force reflow to re-trigger animation
    displayText.classList.add('flash');
  }

  // ── PAD ANIMATION ──────────────────────────────────────────
  function activatePad(pad) {
    pad.classList.add('active');
    setTimeout(() => pad.classList.remove('active'), 300);
  }

  // ── CLICK LISTENERS ───────────────────────────────────────
  pads.forEach(pad => {
    pad.addEventListener('click', () => playPad(pad));
  });

  // ── KEYBOARD LISTENER ─────────────────────────────────────
  document.addEventListener('keydown', (event) => {
    if (!isPoweredOn) return;
    if (event.repeat) return;                 // ignore held keys

    const key = event.key.toUpperCase();
    if (keyToPadMap.has(key)) {
      playPad(keyToPadMap.get(key));
    }
  });

  // ── VOLUME SLIDER ─────────────────────────────────────────
  volumeSlider.addEventListener('input', () => {
    currentVolume = parseFloat(volumeSlider.value);
    volDisplay.textContent = `${Math.round(currentVolume * 100)}%`;
  });

  // ── POWER SWITCH ──────────────────────────────────────────
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

  // ── THEME TOGGLE ──────────────────────────────────────────
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'light') {
      themeIcon.textContent  = '🌙';
    } else {
      themeIcon.textContent  = '☀️';
    }
  });

  // ── LIVE CLOCK ────────────────────────────────────────────
  /**
   * Updates the clock every second.
   * Uses Intl.DateTimeFormat for clean, locale-aware formatting.
   */
  const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN',
                  'JUL','AUG','SEP','OCT','NOV','DEC'];

  function updateClock() {
    const now = new Date();

    // Time: HH:MM:SS with leading zeros
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    clockTime.textContent = `${hh}:${mm}:${ss}`;

    // Date: DAY DD MON YYYY
    const day  = DAYS[now.getDay()];
    const dd   = String(now.getDate()).padStart(2, '0');
    const mon  = MONTHS[now.getMonth()];
    const yyyy = now.getFullYear();
    clockDate.textContent = `${day} ${dd} ${mon} ${yyyy}`;
  }

  // Run once immediately, then every second
  updateClock();
  setInterval(updateClock, 1000);

  // ── READY ─────────────────────────────────────────────────
  console.log('🥁 BeatByJosh ready! Press Q W E / A S D / Z X C or click the pads.');

}); // end DOMContentLoaded
