// ==================== SOUND SYSTEM ====================
let audioCtx = null;
let soundEnabled = false;
let engineOscillator = null;
let engineGain = null;
let crashBuffers = []; // Pre-computed crash sounds for instant playback
let lastCrashTime = 0;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;

    // Pre-compute crash sound buffers for instant playback
    createCrashBuffers();

    // Create persistent engine sound
    engineOscillator = audioCtx.createOscillator();
    engineGain = audioCtx.createGain();

    engineOscillator.type = 'sawtooth';
    engineOscillator.frequency.value = 60;
    engineGain.gain.value = 0;

    // Add some distortion for grittier engine sound
    const distortion = audioCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(20);

    // Low-pass filter for engine rumble
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    engineOscillator.connect(distortion);
    distortion.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(audioCtx.destination);
    engineOscillator.start();
  } catch (e) {
    soundEnabled = false;
  }
}

function createCrashBuffers() {
  // Create 5 crash sound variations at different intensities
  // Using a more realistic layered approach with:
  // - Initial impact transient (the "bang")
  // - Metal crunch/crumple noise
  // - Glass/debris scatter
  // - Low-end rumble/shake

  for (let i = 0; i < 5; i++) {
    const intensity = 0.6 + i * 0.35; // 0.6 to 2.0
    const duration = 0.18 + i * 0.06; // 0.18 to 0.42 seconds
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);

    // Pre-generate noise with some filtering for metal character
    const metalNoise = new Float32Array(bufferSize);
    let prev = 0;
    for (let j = 0; j < bufferSize; j++) {
      const white = Math.random() * 2 - 1;
      // Simple lowpass filter for metal character
      prev = prev * 0.7 + white * 0.3;
      metalNoise[j] = prev;
    }

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let j = 0; j < bufferSize; j++) {
        const t = j / audioCtx.sampleRate;

        // Layer 1: Sharp impact transient (the initial "bang")
        // Short attack, fast decay - the moment of impact
        const impactEnv = Math.exp(-t * 80) * (t < 0.01 ? t * 100 : 1);
        const impact = (Math.sin(t * 80 * Math.PI * 2) + Math.sin(t * 160 * Math.PI * 2) * 0.5) * impactEnv;

        // Layer 2: Metal crunch (crumpling sound)
        // Slower decay, uses filtered noise
        const crunchEnv = Math.exp(-t * (18 - i * 2));
        const crunch = metalNoise[j] * crunchEnv;

        // Layer 3: Glass/debris scatter (high frequency)
        const debrisEnv = Math.exp(-t * 25) * (t > 0.02 ? 1 : 0);
        const debris = (Math.random() * 2 - 1) * 0.15 * debrisEnv *
          (1 + Math.sin(t * 2000 * Math.PI) * 0.3);

        // Layer 4: Body resonance (low thump that follows)
        const bodyEnv = Math.exp(-t * 12);
        const bodyRes = Math.sin(t * 45 * Math.PI * 2) * bodyEnv * 0.4 +
                       Math.sin(t * 90 * Math.PI * 2) * bodyEnv * 0.2;

        // Layer 5: Metallic ring/shimmer (panel vibration)
        const ringEnv = Math.exp(-t * 10) * (t > 0.03 ? 1 : 0);
        const ring = Math.sin(t * 420 * Math.PI * 2) * ringEnv * 0.08 +
                    Math.sin(t * 680 * Math.PI * 2) * ringEnv * 0.05;

        // Mix layers - heavier impacts get more of everything
        const mixed =
          impact * 0.5 * intensity +
          crunch * 0.6 * intensity +
          debris * intensity * 0.4 +
          bodyRes * 0.5 +
          ring * 0.3;

        // Soft clip to prevent harsh digital distortion
        data[j] = Math.tanh(mixed * 1.2) * 0.85;

        // Add slight stereo variation for depth
        if (ch === 1) {
          data[j] *= 0.92 + Math.random() * 0.08;
          // Slight delay on right channel for spaciousness
          if (j > 50) {
            data[j] = data[j] * 0.6 + buffer.getChannelData(0)[j - 50] * 0.4;
          }
        }
      }
    }
    crashBuffers.push(buffer);
  }
}

function makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function updateEngineSound(speed, isAccelerating) {
  if (!soundEnabled || !engineGain) return;

  const absSpeed = Math.abs(speed);

  // Base frequency based on speed - wider range for more variation
  const baseFreq = 40 + absSpeed * 40;
  // Rev up when accelerating
  const targetFreq = isAccelerating ? baseFreq + 25 : baseFreq;

  engineOscillator.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);

  // MUCH quieter - subtle background rumble only
  // Only audible when actively accelerating
  const targetVol = isAccelerating ? 0.03 + absSpeed * 0.008 : absSpeed * 0.003;
  engineGain.gain.setTargetAtTime(Math.min(targetVol, 0.06), audioCtx.currentTime, 0.1);
}

function playCrashSound(intensity) {
  if (!soundEnabled || !audioCtx || crashBuffers.length === 0) return;

  // Limit crash sound frequency (minimum gap between sounds)
  const now = audioCtx.currentTime;
  if (now - lastCrashTime < 0.04) return;
  lastCrashTime = now;

  // Select buffer based on intensity (0-4 index)
  const bufferIndex = Math.min(4, Math.max(0, Math.floor(intensity * 0.6)));

  // Create source and play immediately
  const source = audioCtx.createBufferSource();
  source.buffer = crashBuffers[bufferIndex];

  // Apply gain based on intensity - louder crashes for bigger impacts
  const gain = audioCtx.createGain();
  const volume = Math.min(0.7, 0.25 + intensity * 0.1);
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioCtx.destination);

  // Start immediately (no scheduling delay)
  source.start(0);
}

function muteEngine() {
  if (engineGain) {
    engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
  }
}
