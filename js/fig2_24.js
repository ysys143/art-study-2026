// fig2_24.js — Membrane (Shunting) Equation: Neurophysiology meets Neural Networks
// dx/dt = -A*x + (B - x)*I - x*J
// where I = on-center excitatory input, J = off-surround inhibitory input (silent inhibition: V- = 0)

let sim24 = { t: 0, x: 0 };
let sim24Running = false;
let sim24InputStopped = false;
let sim24Timer = null;
let pulse24 = { active: false, endT: 0, peakI: 0, peakJ: 0, rampDown: false, rampStartT: 0, rampI: 0, rampJ: 0 };
let simData24 = { ts: [], xs: [], pulseFlags: [] };

// ── Equation rendering ──────────────────────────────────────────────────────

function initPage24() {
  // Full membrane equation
  katex.render(
    String.raw`C\,\frac{\partial V}{\partial t} = (V^+ - V)\,g^+ + (V^- - V)\,g^- + (V^p - V)\,g^p`,
    document.getElementById('eq-membrane'),
    { displayMode: true }
  );

  // Shunting on-center off-surround equation
  katex.render(
    String.raw`\frac{dx_i}{dt} = \underbrace{-A\,x_i}_{\text{수동 감쇠}} + \underbrace{(B - x_i)\,I_i}_{\text{shunting 흥분}} - \underbrace{x_i \cdot \sum_{k \neq i} I_k}_{\text{silent 억제}}`,
    document.getElementById('eq-shunting'),
    { displayMode: true }
  );

  // Silent inhibition term
  katex.render(
    String.raw`V^- = 0 \;\Rightarrow\; -\,(0 - x)\,g^- = -\,x \cdot J`,
    document.getElementById('eq-silent-inh'),
    { displayMode: true }
  );

  // Hyperpolarizing inhibition term
  katex.render(
    String.raw`V^- = -C \;\Rightarrow\; -\,(-C - x)\,g^- = (x + C)\,J`,
    document.getElementById('eq-hyper-inh'),
    { displayMode: true }
  );

  // Equilibrium formula
  katex.render(
    String.raw`x^* = \frac{B \cdot I_i}{A + I_i + J} \qquad \text{(dx/dt = 0 풀이)}`,
    document.getElementById('eq-equil'),
    { displayMode: true }
  );

  // Sliders
  setupSlider24('slider-A', 'val-A', v => v / 100);
  setupSlider24('slider-B', 'val-B', v => v / 100);

  document.getElementById('slider-I').addEventListener('input', () => {
    document.getElementById('val-I').textContent = fmt24(getParams24().I);
  });
  document.getElementById('slider-J').addEventListener('input', () => {
    document.getElementById('val-J').textContent = fmt24(getParams24().J);
  });
  document.getElementById('slider-speed').addEventListener('input', getSpeed24);

  // Buttons
  document.getElementById('btn-pulse').addEventListener('click', onPulse24);
  document.getElementById('btn-reset').addEventListener('click', simReset24);
  document.getElementById('btn-pause').addEventListener('click', onPause24);

  // Init
  simReset24();
  sim24Timer = setInterval(simStep24, 50);

  // Plot refresh loop
  setInterval(() => { if (sim24Running) { updatePlot24(); } }, 200);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt24(v) {
  if (v === undefined || isNaN(v)) return '0.00';
  return v < 0.1 ? v.toExponential(1) : v < 10 ? v.toFixed(2) : v.toFixed(1);
}

function setupSlider24(id, valId, transform) {
  const slider = document.getElementById(id);
  const valSpan = document.getElementById(valId);
  if (!slider || !valSpan) return;
  slider.addEventListener('input', () => {
    valSpan.textContent = fmt24(transform(parseFloat(slider.value)));
  });
}

function getParams24() {
  const A = parseFloat(document.getElementById('slider-A').value) / 100;
  const B = parseFloat(document.getElementById('slider-B').value) / 100;
  const rawI = parseFloat(document.getElementById('slider-I').value);
  const rawJ = parseFloat(document.getElementById('slider-J').value);
  // Log scale: 0→0.1, 500→1.0, 1000→100
  const I = rawI === 0 ? 0 : Math.pow(10, (rawI / 1000) * 3 - 1);
  const J = rawJ === 0 ? 0 : Math.pow(10, (rawJ / 1000) * 3 - 1);
  return { A, B, I, J };
}

function getSpeed24() {
  const v = parseFloat(document.getElementById('slider-speed').value);
  const speed = Math.pow(10, (v / 100) * 2.7 - 1.7);
  const el = document.getElementById('val-speed');
  if (el) el.textContent = speed < 1 ? speed.toFixed(2) + 'x' : speed.toFixed(1) + 'x';
  return speed;
}

function equil24(A, B, I, J) {
  const denom = A + I + J;
  return denom < 1e-12 ? 0 : (B * I) / denom;
}

// ── Sim core ─────────────────────────────────────────────────────────────────

function simReset24() {
  sim24 = { t: 0, x: 0 };
  simData24 = { ts: [0], xs: [0], pulseFlags: [0] };
  pulse24 = { active: false, endT: 0, peakI: 0, peakJ: 0, rampDown: false, rampStartT: 0, rampI: 0, rampJ: 0 };
  sim24Running = false;
  sim24InputStopped = false;

  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.classList.add('p09rt-start-blink');
    pauseBtn.textContent = '[>] Start';
    pauseBtn.style.borderColor = '#4caf50';
    pauseBtn.style.color = '#4caf50';
  }
  const pb = document.getElementById('btn-pulse');
  if (pb) { pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }

  // Sync display values
  const p = getParams24();
  document.getElementById('val-A').textContent = fmt24(p.A);
  document.getElementById('val-B').textContent = fmt24(p.B);
  document.getElementById('val-I').textContent = fmt24(p.I);
  document.getElementById('val-J').textContent = fmt24(p.J);
  getSpeed24();

  updateUI24(p);
  updatePlot24();
}

function getCurrentInput24() {
  const p = getParams24();

  if (pulse24.rampDown) {
    const elapsed = sim24.t - pulse24.rampStartT;
    let pI = pulse24.rampI * Math.exp(-elapsed * 3.0);
    let pJ = pulse24.rampJ * Math.exp(-elapsed * 3.0);
    if (pI < 0.005) {
      // Transition to pulse phase
      pulse24.rampDown = false;
      pulse24.active = true;
      pulse24.endT = sim24.t + 2;
      sim24InputStopped = true;
      const pauseBtn = document.getElementById('btn-pause');
      if (pauseBtn) {
        pauseBtn.textContent = '[>] Input On';
        pauseBtn.style.borderColor = '#4caf50';
        pauseBtn.style.color = '#4caf50';
      }
      const pb = document.getElementById('btn-pulse');
      if (pb) pb.textContent = '[~] Pulsing...';
      return { I: pulse24.peakI, J: pulse24.peakJ, isPulsing: true };
    }
    return { I: pI, J: pJ, isPulsing: false };
  }

  if (pulse24.active) {
    if (sim24.t < pulse24.endT) {
      return { I: pulse24.peakI, J: pulse24.peakJ, isPulsing: true };
    } else {
      const elapsed = sim24.t - pulse24.endT;
      let pI = pulse24.peakI * Math.exp(-elapsed * 1.5);
      let pJ = pulse24.peakJ * Math.exp(-elapsed * 1.5);
      if (pI < 0.001) {
        pI = 0; pJ = 0;
        pulse24.active = false;
        const pb = document.getElementById('btn-pulse');
        if (pb) { pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }
      }
      return { I: pI, J: pJ, isPulsing: false };
    }
  }

  const I = sim24InputStopped ? 0 : p.I;
  const J = sim24InputStopped ? 0 : p.J;
  return { I, J, isPulsing: false };
}

function simStep24() {
  if (!sim24Running) return;

  const p = getParams24();
  const speed = getSpeed24();
  const dt = 0.05 * speed;
  sim24.t += dt;

  const inp = getCurrentInput24();
  const { I, J } = inp;

  // Euler with sub-stepping for stability
  const subSteps = 5;
  const subDt = dt / subSteps;
  for (let s = 0; s < subSteps; s++) {
    // dx/dt = -A*x + (B - x)*I - x*J
    const dx = -p.A * sim24.x + (p.B - sim24.x) * I - sim24.x * J;
    sim24.x = Math.max(0, Math.min(p.B, sim24.x + dx * subDt));
  }

  simData24.ts.push(sim24.t);
  simData24.xs.push(sim24.x);
  simData24.pulseFlags.push(inp.isPulsing ? p.B * 1.05 : 0);

  // Window data
  const WINDOW = Math.max(400, Math.floor(600 * speed));
  while (simData24.ts.length > WINDOW) {
    simData24.ts.shift();
    simData24.xs.shift();
    simData24.pulseFlags.shift();
  }

  updateUI24(p, I, J);
}

// ── UI updates ───────────────────────────────────────────────────────────────

function updateUI24(p, I, J) {
  if (I === undefined) {
    const inp = getCurrentInput24();
    I = inp.I; J = inp.J;
  }

  const xstar = equil24(p.A, p.B, I, J);

  const liveX = document.getElementById('live-x');
  const liveXstar = document.getElementById('live-xstar');
  const liveTime = document.getElementById('live-time');
  if (liveX) liveX.textContent = sim24.x.toFixed(3);
  if (liveXstar) liveXstar.textContent = xstar.toFixed(3);
  if (liveTime) liveTime.textContent = sim24.t.toFixed(1);

  // Conductance bars
  const excite = Math.max(0, (p.B - sim24.x) * I);
  const inhibit = sim24.x * J;
  const passive = p.A * sim24.x;
  const dxdt = excite - inhibit - passive;
  const maxCurr = Math.max(excite, inhibit, passive, Math.abs(dxdt), 0.01);

  const setBar = (id, valId, val, maxV) => {
    const bar = document.getElementById(id);
    const valEl = document.getElementById(valId);
    if (bar) bar.style.height = Math.min(100, (Math.abs(val) / maxV) * 100) + '%';
    if (valEl) valEl.textContent = val.toFixed(3);
  };

  setBar('bar-excite', 'val-excite', excite, maxCurr);
  setBar('bar-inhibit', 'val-inhibit', inhibit, maxCurr);
  setBar('bar-passive', 'val-passive', passive, maxCurr);
  setBar('bar-dxdt', 'val-dxdt', Math.abs(dxdt), maxCurr);
}

function updatePlot24() {
  const p = getParams24();
  const inp = getCurrentInput24();
  const { I, J } = inp;
  const speed = getSpeed24();

  // ── Left chart: x(t) time evolution ──────────────────────────────────────
  const traces = [];

  // Pulse indicator shading
  traces.push({
    x: simData24.ts.slice(),
    y: simData24.pulseFlags.slice(),
    mode: 'lines',
    name: 'Input Pulse',
    line: { color: '#bf6a42', width: 0 },
    fill: 'tozeroy',
    fillcolor: 'rgba(191,106,66,0.10)',
    showlegend: true,
    hoverinfo: 'skip'
  });

  // x(t)
  traces.push({
    x: simData24.ts.slice(),
    y: simData24.xs.slice(),
    mode: 'lines',
    name: 'x(t)',
    line: { color: '#bf6a42', width: 2.5 }
  });

  // B upper bound
  const tMax = simData24.ts.length > 0 ? Math.max(simData24.ts[simData24.ts.length - 1], simData24.ts[0] + 15) : 15;
  traces.push({
    x: [simData24.ts[0] || 0, tMax],
    y: [p.B, p.B],
    mode: 'lines',
    name: 'B (upper bound)',
    line: { color: '#5a9a72', width: 1.5, dash: 'dash' },
    showlegend: true
  });

  // 0 lower bound annotation
  traces.push({
    x: [simData24.ts[0] || 0, tMax],
    y: [0, 0],
    mode: 'lines',
    name: '0 (silent inh. floor)',
    line: { color: '#c06058', width: 1.2, dash: 'dot' },
    showlegend: true
  });

  // x* equilibrium
  const xstar = equil24(p.A, p.B, I, J);
  traces.push({
    x: [simData24.ts[0] || 0, tMax],
    y: [xstar, xstar],
    mode: 'lines',
    name: 'x* (equilibrium)',
    line: { color: '#4a7fb5', width: 1.5, dash: 'longdash' },
    showlegend: true
  });

  const WINDOW = Math.max(10, 30 * speed);
  const tStart = simData24.ts.length > 0 ? simData24.ts[0] : 0;
  const tEnd = simData24.ts.length > 0 ? Math.max(simData24.ts[simData24.ts.length - 1], tStart + WINDOW) : WINDOW;

  const layout1 = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 20, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [tStart, tEnd] },
    yaxis: { title: 'Activity x(t)', gridcolor: '#eae6e0', zeroline: false, range: [-p.B * 0.1, p.B * 1.3] },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } }
  };

  Plotly.react('plot-time', traces, layout1, { responsive: true, displayModeBar: false });

  // ── Right chart: equilibrium curve x* vs I ────────────────────────────────
  const iVals = [];
  const xstarVals = [];
  const nPts = 200;
  const iMax = Math.pow(10, 2.5); // ~316
  for (let k = 0; k <= nPts; k++) {
    const iv = (k / nPts) * iMax;
    iVals.push(iv);
    xstarVals.push(equil24(p.A, p.B, iv, J));
  }

  const equilTraces = [
    {
      x: iVals,
      y: xstarVals,
      mode: 'lines',
      name: 'x* = BI/(A+I+J)',
      line: { color: '#4a7fb5', width: 2.5 }
    },
    // Vertical line at current I
    {
      x: [I, I],
      y: [0, p.B],
      mode: 'lines',
      name: 'Current I',
      line: { color: '#bf6a42', width: 1.5, dash: 'dot' }
    },
    // Dot at current equilibrium
    {
      x: [I],
      y: [xstar],
      mode: 'markers',
      name: 'x* now',
      marker: { color: '#bf6a42', size: 9, symbol: 'circle' },
      showlegend: false
    }
  ];

  const layout2 = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 20, b: 40 },
    xaxis: { title: 'I (excitatory input)', gridcolor: '#eae6e0', zeroline: false, range: [0, iMax] },
    yaxis: { title: 'x* (equilibrium)', gridcolor: '#eae6e0', zeroline: false, range: [0, p.B * 1.15] },
    showlegend: true,
    legend: { x: 0.50, y: 0.15, font: { size: 10 } },
    annotations: [{
      x: iMax * 0.6,
      y: p.B * 1.05,
      text: `J = ${fmt24(J)} (fixed)`,
      showarrow: false,
      font: { size: 10, color: '#c06058' }
    }]
  };

  Plotly.react('plot-equil', equilTraces, layout2, { responsive: true, displayModeBar: false });
}

// ── Button handlers ──────────────────────────────────────────────────────────

function onPulse24() {
  const p = getParams24();
  if (!sim24Running) return;
  if (pulse24.active || pulse24.rampDown) return;

  if (!sim24InputStopped && p.I > 0.01) {
    // Ramp down first, then deliver pulse from silence
    pulse24 = {
      active: false, endT: 0,
      peakI: p.I, peakJ: p.J,
      rampDown: true, rampStartT: sim24.t,
      rampI: p.I, rampJ: p.J
    };
    const pb = document.getElementById('btn-pulse');
    if (pb) { pb.textContent = '[~] Ramping...'; pb.classList.add('p09rt-pulse-btn'); }
  } else {
    // Direct pulse: deliver I for 2s then ramp off
    pulse24 = {
      active: true, endT: sim24.t + 2,
      peakI: p.I, peakJ: p.J,
      rampDown: false, rampStartT: 0,
      rampI: 0, rampJ: 0
    };
    sim24InputStopped = true;
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      pauseBtn.textContent = '[>] Input On';
      pauseBtn.style.borderColor = '#4caf50';
      pauseBtn.style.color = '#4caf50';
    }
    const pb = document.getElementById('btn-pulse');
    if (pb) { pb.textContent = '[~] Pulsing...'; pb.classList.add('p09rt-pulse-btn'); }
  }
}

function onPause24() {
  const pauseBtn = document.getElementById('btn-pause');
  if (!sim24Running) {
    // Start
    sim24Running = true;
    sim24InputStopped = false;
    if (pauseBtn) {
      pauseBtn.classList.remove('p09rt-start-blink');
      pauseBtn.textContent = '[||] Input Off';
      pauseBtn.style.borderColor = '#ff9800';
      pauseBtn.style.color = '#ff9800';
    }
  } else {
    // Toggle input on/off
    sim24InputStopped = !sim24InputStopped;
    if (sim24InputStopped) {
      pulse24.active = false;
      pulse24.rampDown = false;
      const pb = document.getElementById('btn-pulse');
      if (pb) { pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }
    }
    if (pauseBtn) {
      pauseBtn.textContent = sim24InputStopped ? '[>] Input On' : '[||] Input Off';
      pauseBtn.style.borderColor = sim24InputStopped ? '#4caf50' : '#ff9800';
      pauseBtn.style.color = sim24InputStopped ? '#4caf50' : '#ff9800';
    }
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initPage24);
