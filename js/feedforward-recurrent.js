// Global variables
let showFF = true, showRNN = true;
let sim = { t: 0, ff1: 0, rnn1: 0, rnn2: 0 };
let simRunning = false;
let simInputStopped = false;
let simTimer = null;
let pulse = { active: false, endT: 0, peakI: 0, rampDown: false, rampStartT: 0, rampI: 0 };
let simData = { ts: [], ff1: [], rnn1: [], inputPulse: [] };

function initPageFFRNN() {
  // Render equations — unified + topology-specific
  katex.render(String.raw`\frac{dx_i}{dt} = -A x_i + (B - x_i)\, I_i - x_i \cdot \underbrace{(\cdots)}_{\text{억제 입력}}`, document.getElementById('unified-equation'), { displayMode: true });
  katex.render(String.raw`\frac{dx_i}{dt} = -A x_i + (B - x_i)\, I_i - x_i \cdot \color{#4a7fb5}{J_i}`, document.getElementById('ff-equation'), { displayMode: true });
  katex.render(String.raw`\frac{dx_i}{dt} = -A x_i + (B - x_i)\, I_i - x_i \cdot \color{#c06058}{c \sum_{j \neq i} x_j}`, document.getElementById('rnn-equation'), { displayMode: true });

  // Render equations — attractor dynamics explanation
  const eqTargets = {
    'eq-ff-detail': [String.raw`\frac{dx}{dt} = -Ax + (B-x)\,I \quad \xrightarrow{\;t \to \infty\;} \quad x^* = \frac{B \cdot I}{A + I}`, true],
    'eq-rnn-detail': [String.raw`\frac{dx_i}{dt} = \underbrace{-A x_i}_{\text{감쇠}} + \underbrace{(B - x_i) I_i}_{\text{분로 흥분}} - \underbrace{c \cdot x_i \cdot x_j}_{\text{측면 억제}}`, true],
    'eq-term-decay': [String.raw`-A x_i`, true],
    'eq-term-excite': [String.raw`(B - x_i)\, I_i`, true],
    'eq-term-inhib': [String.raw`-c \cdot x_i \cdot x_j`, true],
    'eq-no-input': [String.raw`I_i = 0 \;\Rightarrow\; \frac{dx_i}{dt} = -A x_i - c \cdot x_i \cdot x_j = -x_i\!\left(A + c \cdot x_j\right)`, true],
    'eq-wta-indep': [String.raw`x_i^* = \frac{B\,I_i}{A + I_i}`, true],
    'eq-wta-weak': [String.raw`x_1^* > 0,\; x_2^* > 0`, true],
    'eq-wta-strong': [String.raw`x_1^* \to B,\; x_2^* \to 0`, true],
  };
  for (const [id, [tex, displayMode]] of Object.entries(eqTargets)) {
    const el = document.getElementById(id);
    if (el) katex.render(tex, el, { displayMode });
  }

  // Setup model parameter sliders
  setupSlider('slider-comp', 'val-comp', v => v / 100);
  setupSlider('slider-A', 'val-A', v => v / 100);
  setupSlider('slider-B', 'val-B', v => v / 100);

  // Input slider
  document.getElementById('slider-I').addEventListener('input', () => {
    const { I_base } = getParams();
    const disp = fmtVal(I_base);
    document.getElementById('val-I').textContent = disp;
  });

  // Speed slider
  document.getElementById('slider-speed').addEventListener('input', getSpeed);

  // Pulse button — ramp down first if input is active, then pulse
  document.getElementById('btn-pulse').addEventListener('click', function () {
    const { I_base } = getParams();
    if (!simRunning) return;
    if (pulse.active || pulse.rampDown) return;

    if (!simInputStopped && I_base > 0.01) {
      pulse = { active: false, endT: 0, peakI: I_base, rampDown: true, rampStartT: sim.t, rampI: I_base };
      this.textContent = '[~] Ramping...';
      this.classList.add('p09rt-pulse-btn');
    } else {
      const pulseDuration = 2;
      pulse = { active: true, endT: sim.t + pulseDuration, peakI: I_base, rampDown: false, rampStartT: 0, rampI: 0 };
      simInputStopped = true;
      const pauseBtn = document.getElementById('btn-pause');
      pauseBtn.textContent = '[>] Input On';
      pauseBtn.style.borderColor = '#4caf50';
      pauseBtn.style.color = '#4caf50';
      this.textContent = '[~] Pulsing...';
      this.classList.add('p09rt-pulse-btn');
    }
  });

  // Reset button
  document.getElementById('btn-reset').addEventListener('click', simReset);

  // Start / Input Off toggle button
  document.getElementById('btn-pause').addEventListener('click', function () {
    if (!simRunning) {
      simRunning = true;
      simInputStopped = false;
      this.classList.remove('p09rt-start-blink');
      this.textContent = '[||] Input Off';
      this.style.borderColor = '#ff9800';
      this.style.color = '#ff9800';
    } else {
      simInputStopped = !simInputStopped;
      if (simInputStopped) {
        pulse.active = false;
        pulse.rampDown = false;
        const pb = document.getElementById('btn-pulse');
        pb.textContent = '[~] Pulse';
        pb.classList.remove('p09rt-pulse-btn');
      }
      this.textContent = simInputStopped ? '[>] Input On' : '[||] Input Off';
      this.style.borderColor = simInputStopped ? '#4caf50' : '#ff9800';
      this.style.color = simInputStopped ? '#4caf50' : '#ff9800';
    }
  });

  // Model toggles
  document.getElementById('toggle-ff').addEventListener('click', () => toggleModel('ff'));
  document.getElementById('toggle-rnn').addEventListener('click', () => toggleModel('rnn'));

  // Start sim loop (paused initially)
  simReset();
  simTimer = setInterval(simStep, 50);
  updatePlot();
}

function fmtVal(v) {
  return v < 0.1 ? v.toExponential(1) : v < 10 ? v.toFixed(2) : v.toFixed(1);
}

function setupSlider(id, valId, transform) {
  const slider = document.getElementById(id);
  const valSpan = document.getElementById(valId);
  if (!slider || !valSpan) return;
  slider.addEventListener('input', () => {
    const val = transform(parseFloat(slider.value));
    valSpan.textContent = fmtVal(val);
  });
}

function getParams() {
  const rawI = parseFloat(document.getElementById('slider-I').value);
  const I_base = Math.pow(10, (rawI / 1000) * 3 - 1);
  const comp = parseFloat(document.getElementById('slider-comp').value) / 100;
  const A = parseFloat(document.getElementById('slider-A').value) / 100;
  const B = parseFloat(document.getElementById('slider-B').value) / 100;
  return { I_base, comp, A, B };
}

function getSpeed() {
  const v = parseFloat(document.getElementById('slider-speed').value);
  const speed = Math.pow(10, (v / 100) * 2.7 - 1.7);
  const el = document.getElementById('val-speed');
  if (el) el.textContent = speed < 1 ? speed.toFixed(2) + 'x' : speed.toFixed(1) + 'x';
  return speed;
}

function simReset() {
  sim = { t: 0, ff1: 0, rnn1: 0, rnn2: 0 };
  simData = { ts: [0], ff1: [0], rnn1: [0], inputPulse: [0] };
  pulse = { active: false, endT: 0, peakI: 0, rampDown: false, rampStartT: 0, rampI: 0 };
  document.getElementById('val-I').textContent = fmtVal(getParams().I_base);
  const pb = document.getElementById('btn-pulse');
  if (pb) { pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }
  updatePlot();
}

function getCurrentInput() {
  const p = getParams();
  let pI;

  // Phase 1: Ramp-down before pulse
  if (pulse.rampDown) {
    const elapsed = sim.t - pulse.rampStartT;
    pI = pulse.rampI * Math.exp(-elapsed * 3.0);
    if (pI < 0.01) {
      pulse.rampDown = false;
      pulse.active = true;
      pulse.endT = sim.t + 2;
      simInputStopped = true;
      const pauseBtn = document.getElementById('btn-pause');
      if (pauseBtn) {
        pauseBtn.textContent = '[>] Input On';
        pauseBtn.style.borderColor = '#4caf50';
        pauseBtn.style.color = '#4caf50';
      }
      const pb = document.getElementById('btn-pulse');
      if (pb) pb.textContent = '[~] Pulsing...';
      pI = pulse.peakI;
      return { I1: pI, I2: pI * 0.5, isPulsing: true, effectiveI: pI };
    }
    return { I1: pI, I2: pI * 0.5, isPulsing: false, effectiveI: pI };
  }

  // Phase 2: Active pulse
  if (pulse.active) {
    if (sim.t < pulse.endT) {
      pI = pulse.peakI;
      return { I1: pI, I2: pI * 0.5, isPulsing: true, effectiveI: pI };
    } else {
      const elapsed = sim.t - pulse.endT;
      pI = pulse.peakI * Math.exp(-elapsed * 1.5);
      if (pI < 0.001) {
        pI = 0;
        pulse.active = false;
        const pb = document.getElementById('btn-pulse');
        if (pb) { pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }
      }
      return { I1: pI, I2: pI * 0.5, isPulsing: false, effectiveI: pI };
    }
  }

  // Normal mode
  pI = simInputStopped ? 0 : p.I_base;
  return { I1: pI, I2: pI * 0.5, isPulsing: false, effectiveI: pI };
}

function toggleModel(model) {
  if (model === 'ff') {
    showFF = !showFF;
    const el = document.getElementById('toggle-ff');
    if (el) el.classList.toggle('active', showFF);
  } else {
    showRNN = !showRNN;
    const el = document.getElementById('toggle-rnn');
    if (el) el.classList.toggle('active', showRNN);
  }
  updatePlot();
}

function simStep() {
  if (!simRunning) return;

  const p = getParams();
  const speed = getSpeed();
  const dt = 0.05 * speed;
  sim.t += dt;

  const input = getCurrentInput();
  const I1 = input.I1;
  const I2 = input.I2;

  // Update live I display during pulse/ramp
  if (pulse.active || pulse.rampDown) {
    document.getElementById('val-I').textContent = fmtVal(input.effectiveI);
  }

  // ODE sub-stepping for both FF and RNN
  const subSteps = 5;
  const subDt = dt / subSteps;

  for (let s = 0; s < subSteps; s++) {
    // Feedforward shunting: dx/dt = -Ax + (B-x)I  (no competition)
    const dff1 = -p.A * sim.ff1 + (p.B - sim.ff1) * I1;
    sim.ff1 = Math.max(0, Math.min(p.B, sim.ff1 + dff1 * subDt));

    // Recurrent shunting: dx_i/dt = -Ax_i + (B-x_i)I_i - c·x_i·x_j
    const inh1 = p.comp * sim.rnn2;
    const inh2 = p.comp * sim.rnn1;
    const drnn1 = -p.A * sim.rnn1 + (p.B - sim.rnn1) * I1 - sim.rnn1 * inh1;
    const drnn2 = -p.A * sim.rnn2 + (p.B - sim.rnn2) * I2 - sim.rnn2 * inh2;
    sim.rnn1 = Math.max(0, Math.min(p.B, sim.rnn1 + drnn1 * subDt));
    sim.rnn2 = Math.max(0, Math.min(p.B, sim.rnn2 + drnn2 * subDt));
  }

  // Store data
  simData.ts.push(sim.t);
  simData.ff1.push(sim.ff1);
  simData.rnn1.push(sim.rnn1);
  simData.inputPulse.push(input.isPulsing ? p.B * 1.05 : 0);

  const WINDOW = Math.max(400, Math.floor(600 * speed));
  while (simData.ts.length > WINDOW) {
    simData.ts.shift();
    simData.ff1.shift();
    simData.rnn1.shift();
    simData.inputPulse.shift();
  }

  updateUI(p);
}

function updateUI(p) {
  const ff1el = document.getElementById('ff-eq-x1');
  const rnn1el = document.getElementById('rnn-live-x1');
  const timeEl = document.getElementById('live-time');

  if (ff1el) ff1el.textContent = sim.ff1.toFixed(2);
  if (rnn1el) rnn1el.textContent = sim.rnn1.toFixed(2);
  if (timeEl) timeEl.textContent = sim.t.toFixed(1);

  const maxVal = p.B * 1.1;
  const barFF1 = document.getElementById('bar-ff-x1');
  const barRNN1 = document.getElementById('bar-rnn-x1');

  if (barFF1) barFF1.style.height = (sim.ff1 / maxVal * 100) + '%';
  if (barRNN1) barRNN1.style.height = (sim.rnn1 / maxVal * 100) + '%';

  const insightEl = document.getElementById('insight-ff-val');
  if (insightEl) insightEl.textContent = sim.ff1.toFixed(2);
}

function updatePlot() {
  const p = getParams();
  const speed = getSpeed();
  const traces = [];

  // Input pulse indicator
  traces.push({
    x: simData.ts.slice(),
    y: simData.inputPulse.slice(),
    mode: 'lines',
    name: 'Input Pulse',
    line: { color: '#4a7fb5', width: 0 },
    fill: 'tozeroy',
    fillcolor: 'rgba(74,127,181,0.15)',
    showlegend: true,
    hoverinfo: 'skip'
  });

  if (showFF) {
    traces.push({
      x: simData.ts.slice(),
      y: simData.ff1.slice(),
      mode: 'lines',
      name: 'Feedforward x(t)',
      line: { color: '#4a7fb5', width: 2.5, dash: 'dash' }
    });
  }

  if (showRNN) {
    traces.push({
      x: simData.ts.slice(),
      y: simData.rnn1.slice(),
      mode: 'lines',
      name: 'Recurrent x(t)',
      line: { color: '#c06058', width: 2.5 }
    });
  }

  // Attractor line
  traces.push({
    x: [0, Math.max(15, sim.t)],
    y: [p.B, p.B],
    mode: 'lines',
    name: 'B (saturation)',
    line: { color: '#5a9a7266', width: 1.5, dash: 'dash' },
    showlegend: true
  });

  const WINDOW = Math.max(10, 30 * speed);
  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 50, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [simData.ts.length > 0 ? simData.ts[0] : 0, simData.ts.length > 0 ? Math.max(simData.ts[simData.ts.length - 1], simData.ts[0] + WINDOW) : WINDOW] },
    yaxis: { title: 'Activity x(t)', gridcolor: '#eae6e0', zeroline: false, range: [0, p.B * 1.3] },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } }
  };

  Plotly.react('plot-time', traces, layout, { responsive: true, displayModeBar: false });
}

// Auto-update plot
setInterval(() => {
  if (simRunning) updatePlot();
}, 200);

// Initialize
document.addEventListener('DOMContentLoaded', initPageFFRNN);

// Make functions globally accessible
window.toggleModel = toggleModel;
