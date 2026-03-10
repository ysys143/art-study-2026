// fig2_31.js — Pattern Matching / Substrate of Resonance
// Grossberg Ch.2, Figure 2.31 & 2.32
// Demonstrates noise suppression via pattern matching:
//   in-phase (match)    → amplified output
//   out-of-phase (mismatch) → suppressed output

// ── Parameters ────────────────────────────────────────────────────────────────
let paramA  = 1.0;    // decay
let paramB  = 9.0;    // excitatory bound
let paramC  = 1.0;    // inhibitory bound
let nCells  = 10;     // number of cells
let mag     = 10;     // pattern magnitude
let buPattern = 'triangle';
let tdPattern = 'triangle';

// ── Pattern generators ────────────────────────────────────────────────────────
function makePattern(name, n, magnitude) {
  const arr = new Array(n).fill(0);
  const half = Math.floor(n / 2);
  switch (name) {
    case 'triangle':
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        arr[i] = magnitude * (1 - Math.abs(2 * t - 1));
      }
      break;
    case 'step':
      for (let i = 0; i < n; i++) arr[i] = i >= half ? magnitude : magnitude * 0.15;
      break;
    case 'bar': {
      const bS = Math.floor(n * 0.3), bE = Math.floor(n * 0.7);
      for (let i = 0; i < n; i++) arr[i] = (i >= bS && i < bE) ? magnitude : magnitude * 0.05;
      break;
    }
    case 'uniform':
      for (let i = 0; i < n; i++) arr[i] = magnitude;
      break;
    default:
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        arr[i] = magnitude * (1 - Math.abs(2 * t - 1));
      }
  }
  // Ensure no zeros to avoid division issues
  return arr.map(v => Math.max(v, 0.001));
}

function invertPattern(arr) {
  const mx = Math.max(...arr);
  const mn = Math.min(...arr);
  // Invert: maps max→min and min→max
  return arr.map(v => mx + mn - v);
}

// ── Core equation: combined output x_i ────────────────────────────────────────
// x_i = (B+C)(I+J)/(A+(I+J)) * [theta_i - C/(B+C)]
// where theta_i = (I_i + J_i) / (I + J)
// I = sum of I_i, J = sum of J_i
function calcCombined(Ii, Ji, I_total, J_total, A, B, C) {
  const IJ = I_total + J_total;
  if (IJ < 1e-10) return 0;
  const theta_i = (Ii + Ji) / IJ;
  const adaptLevel = C / (B + C);
  const gain = (B + C) * IJ / (A + IJ);
  return gain * (theta_i - adaptLevel);
}

// ── x-axis labels ──────────────────────────────────────────────────────────────
function makeXAxis(n) {
  return Array.from({ length: n }, (_, i) => 'Cell ' + (i + 1));
}

// ── Plotly layout helper ───────────────────────────────────────────────────────
function baseLayout(ytitle, yrange) {
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 48 },
    xaxis: {
      gridcolor: '#eae6e0',
      zeroline: false,
      tickfont: { size: 10 },
    },
    yaxis: {
      title: ytitle,
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#c0bbb5',
      zerolinewidth: 1.5,
      range: yrange || null,
    },
    showlegend: false,
  };
}

// ── Render BU input chart ──────────────────────────────────────────────────────
function renderBU(xs, vals) {
  const trace = {
    x: xs,
    y: vals,
    type: 'bar',
    marker: {
      color: 'rgba(74,127,181,0.65)',
      line: { color: '#4a7fb5', width: 1 },
    },
    name: 'BU Input',
  };
  const maxV = Math.max(...vals, 0);
  const layout = baseLayout('I[i] (BU)', [0, maxV * 1.2]);
  Plotly.react('plot-bu', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Render TD input chart ──────────────────────────────────────────────────────
function renderTD(xs, vals) {
  const trace = {
    x: xs,
    y: vals,
    type: 'bar',
    marker: {
      color: 'rgba(155,107,181,0.65)',
      line: { color: '#9b6bb5', width: 1 },
    },
    name: 'TD Input',
  };
  const maxV = Math.max(...vals, 0);
  const layout = baseLayout('J[i] (TD)', [0, maxV * 1.2]);
  Plotly.react('plot-td', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Render output chart ────────────────────────────────────────────────────────
function renderOutput(xs, vals) {
  const colors = vals.map(v => v >= 0 ? 'rgba(90,154,114,0.75)' : 'rgba(192,96,88,0.75)');
  const lineColors = vals.map(v => v >= 0 ? '#5a9a72' : '#c06058');
  const trace = {
    x: xs,
    y: vals,
    type: 'bar',
    marker: {
      color: colors,
      line: { color: lineColors, width: 1 },
    },
    name: 'Output',
  };
  const minV = Math.min(...vals, 0);
  const maxV = Math.max(...vals, 0);
  const pad = Math.max((maxV - minV) * 0.18, 0.3);
  const layout = baseLayout('x[i] (Output)', [minV - pad, maxV + pad]);

  // Zero line annotation if output is near zero (suppressed)
  const range = maxV - minV;
  if (range < 0.5 && Math.abs(maxV) < 0.5) {
    layout.annotations = [{
      x: xs[Math.floor(xs.length / 2)],
      y: 0,
      text: '억제됨 (Suppressed)',
      showarrow: false,
      yanchor: 'bottom',
      yshift: 6,
      font: { size: 11, color: '#c06058', weight: 700 },
    }];
  } else if (maxV > 1) {
    layout.annotations = [{
      x: xs[Math.floor(xs.length / 2)],
      y: maxV,
      text: '증폭됨 (Amplified)',
      showarrow: false,
      yanchor: 'bottom',
      yshift: 4,
      font: { size: 11, color: '#5a9a72', weight: 700 },
    }];
  }

  Plotly.react('plot-output', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Determine match state ──────────────────────────────────────────────────────
function getMatchState(buVals, tdVals) {
  const n = buVals.length;
  // Pearson correlation between BU and TD
  const buMean = buVals.reduce((s, v) => s + v, 0) / n;
  const tdMean = tdVals.reduce((s, v) => s + v, 0) / n;
  let num = 0, buSS = 0, tdSS = 0;
  for (let i = 0; i < n; i++) {
    num   += (buVals[i] - buMean) * (tdVals[i] - tdMean);
    buSS  += (buVals[i] - buMean) ** 2;
    tdSS  += (tdVals[i] - tdMean) ** 2;
  }
  const denom = Math.sqrt(buSS * tdSS);
  const r = denom > 1e-10 ? num / denom : 0;
  if (r > 0.7)  return 'match';
  if (r < -0.7) return 'mismatch';
  return 'partial';
}

// ── Update badge ───────────────────────────────────────────────────────────────
function updateBadges(buVals, tdVals, outputVals) {
  const state = getMatchState(buVals, tdVals);
  const badge = document.getElementById('badge-output');
  const dot   = document.getElementById('output-dot');
  if (state === 'match') {
    badge.className = 'status-badge amplified';
    badge.textContent = 'Amplified (증폭)';
    dot.style.background = '#5a9a72';
  } else if (state === 'mismatch') {
    badge.className = 'status-badge suppressed';
    badge.textContent = 'Suppressed (억제)';
    dot.style.background = '#c06058';
  } else {
    badge.className = 'status-badge neutral';
    badge.textContent = 'Partial';
    dot.style.background = '#c49a3c';
  }

  // Stats
  const I_total = buVals.reduce((s, v) => s + v, 0);
  const J_total = tdVals.reduce((s, v) => s + v, 0);
  document.getElementById('stat-I').textContent = I_total.toFixed(2);
  document.getElementById('stat-J').textContent = J_total.toFixed(2);
  document.getElementById('stat-adapt').textContent = (paramC / (paramB + paramC)).toFixed(3);
  document.getElementById('stat-xmax').textContent = Math.max(...outputVals).toFixed(3);
  document.getElementById('stat-xmin').textContent = Math.min(...outputVals).toFixed(3);
  document.getElementById('stat-state').textContent =
    state === 'match' ? '공명' : state === 'mismatch' ? '억제' : '부분';
}

// ── Main update ────────────────────────────────────────────────────────────────
function update() {
  const buVals = makePattern(buPattern, nCells, mag);
  const tdVals = makePattern(tdPattern, nCells, mag);

  const I_total = buVals.reduce((s, v) => s + v, 0);
  const J_total = tdVals.reduce((s, v) => s + v, 0);

  const outputVals = buVals.map((Ii, i) =>
    calcCombined(Ii, tdVals[i], I_total, J_total, paramA, paramB, paramC)
  );

  const xs = makeXAxis(nCells);
  renderBU(xs, buVals);
  renderTD(xs, tdVals);
  renderOutput(xs, outputVals);
  updateBadges(buVals, tdVals, outputVals);
}

// ── KaTeX equations ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Combined equation
  katex.render(
    String.raw`x_i = \frac{(B+C)(I+J)}{A+(I+J)} \left[\theta_i - \frac{C}{B+C}\right]`,
    document.getElementById('eq-combined'),
    { displayMode: true }
  );
  // Theta definition
  katex.render(
    String.raw`\theta_i = \frac{I_i + J_i}{I + J}`,
    document.getElementById('eq-theta'),
    { displayMode: true }
  );
  // Match case
  katex.render(
    String.raw`\text{Match: } I_i \propto J_i \;\Rightarrow\; \theta_i \text{ large where pattern has features} \;\Rightarrow\; x_i \uparrow`,
    document.getElementById('eq-match'),
    { displayMode: true }
  );
  // Mismatch case
  katex.render(
    String.raw`\text{Mismatch: } I_i + J_i \approx \tfrac{I+J}{n} \;\Rightarrow\; \theta_i \approx \tfrac{1}{n} \;\Rightarrow\; x_i \approx 0`,
    document.getElementById('eq-mismatch'),
    { displayMode: true }
  );

  // Set display values
  document.getElementById('val-A').textContent = paramA.toFixed(1);
  document.getElementById('val-B').textContent = paramB.toFixed(0);
  document.getElementById('val-C').textContent = paramC.toFixed(1);
  document.getElementById('val-n').textContent = nCells;
  document.getElementById('val-mag').textContent = mag.toFixed(1);

  update();
});

// ── Slider bindings ────────────────────────────────────────────────────────────
document.getElementById('slider-A').addEventListener('input', e => {
  paramA = parseFloat(e.target.value);
  document.getElementById('val-A').textContent = paramA.toFixed(1);
  update();
});

document.getElementById('slider-B').addEventListener('input', e => {
  paramB = parseFloat(e.target.value);
  document.getElementById('val-B').textContent = paramB.toFixed(0);
  update();
});

document.getElementById('slider-C').addEventListener('input', e => {
  paramC = parseFloat(e.target.value);
  document.getElementById('val-C').textContent = paramC.toFixed(1);
  update();
});

document.getElementById('slider-n').addEventListener('input', e => {
  nCells = parseInt(e.target.value);
  document.getElementById('val-n').textContent = nCells;
  update();
});

document.getElementById('slider-mag').addEventListener('input', e => {
  mag = parseFloat(e.target.value);
  document.getElementById('val-mag').textContent = mag.toFixed(1);
  update();
});

// ── BU pattern buttons ─────────────────────────────────────────────────────────
document.querySelectorAll('#bu-pattern-btns .pattern-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#bu-pattern-btns .pattern-btn').forEach(b => {
      b.classList.remove('active-blue');
    });
    btn.classList.add('active-blue');
    buPattern = btn.dataset.pattern;
    update();
  });
});

// ── TD pattern buttons ─────────────────────────────────────────────────────────
document.querySelectorAll('#td-pattern-btns .pattern-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#td-pattern-btns .pattern-btn').forEach(b => {
      b.classList.remove('active-purple');
    });
    btn.classList.add('active-purple');
    tdPattern = btn.dataset.pattern;
    update();
  });
});

// ── Match / Mismatch quick buttons ────────────────────────────────────────────
document.getElementById('btn-match').addEventListener('click', () => {
  // Set TD = same as BU (in phase)
  tdPattern = buPattern;

  // Sync TD button UI
  document.querySelectorAll('#td-pattern-btns .pattern-btn').forEach(b => {
    b.classList.remove('active-purple');
    if (b.dataset.pattern === tdPattern) b.classList.add('active-purple');
  });

  document.getElementById('btn-match').classList.add('active');
  document.getElementById('btn-mismatch').classList.remove('active');
  update();
});

document.getElementById('btn-mismatch').addEventListener('click', () => {
  // Set TD = step if BU is step, otherwise use 'bar' which is roughly inverse of triangle
  // Strategy: pick a different pattern to guarantee mismatch
  const mismatchMap = {
    triangle: 'bar',
    step:     'triangle',
    bar:      'step',
    uniform:  'triangle',
  };
  tdPattern = mismatchMap[buPattern] || 'bar';

  // Sync TD button UI
  document.querySelectorAll('#td-pattern-btns .pattern-btn').forEach(b => {
    b.classList.remove('active-purple');
    if (b.dataset.pattern === tdPattern) b.classList.add('active-purple');
  });

  document.getElementById('btn-mismatch').classList.add('active');
  document.getElementById('btn-match').classList.remove('active');
  update();
});
