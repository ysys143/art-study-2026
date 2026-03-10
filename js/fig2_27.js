// fig2_27.js — Mudpuppy Retina / Cooperative-Competitive Dynamics
// Grossberg Ch.2, Figure 2.27
// Compares subtractive (Limulus) vs shunting (Mudpuppy) lateral inhibition.

// ── Parameters ────────────────────────────────────────────────────────────────
let paramA  = 1.0;   // decay
let paramB  = 10.0;  // upper bound (shunting only)
let nCells  = 12;    // number of cells
let magSliderVal = 300;
let currentPattern = 'step';

// ── Log-scale slider for magnitude ────────────────────────────────────────────
function sliderToMag(v) {
  // 0 → 0.01, 1000 → 100
  return Math.pow(10, (v / 1000) * 4 - 2);
}

// ── Input patterns ─────────────────────────────────────────────────────────────
function makePattern(name, n, mag) {
  const arr = new Array(n).fill(0);
  const half = Math.floor(n / 2);
  switch (name) {
    case 'step':
      for (let i = 0; i < n; i++) arr[i] = i >= half ? mag : mag * 0.15;
      break;
    case 'bar': {
      const bS = Math.floor(n * 0.3), bE = Math.floor(n * 0.7);
      for (let i = 0; i < n; i++) arr[i] = (i >= bS && i < bE) ? mag : mag * 0.05;
      break;
    }
    case 'uniform':
      for (let i = 0; i < n; i++) arr[i] = mag;
      break;
    case 'gradient':
      for (let i = 0; i < n; i++) arr[i] = mag * (i / (n - 1));
      break;
    default:
      for (let i = 0; i < n; i++) arr[i] = i >= half ? mag : mag * 0.15;
  }
  return arr;
}

// ── Nearest-neighbor lateral inhibition sum ───────────────────────────────────
// J_i = average of immediate neighbors (simple local surround)
function computeJ(input) {
  const n = input.length;
  const J = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0, count = 0;
    if (i > 0)     { sum += input[i - 1]; count++; }
    if (i < n - 1) { sum += input[i + 1]; count++; }
    J[i] = count > 0 ? sum / count : 0;
  }
  return J;
}

// ── Subtractive equilibrium ────────────────────────────────────────────────────
// dx/dt = -A*x + I_i - J_i = 0
// x* = (I_i - J_i) / A   (no clamping — shows negatives!)
function solveSubtractive(input, J, A) {
  return input.map((Ii, i) => (Ii - J[i]) / A);
}

// ── Shunting equilibrium ───────────────────────────────────────────────────────
// dx/dt = -A*x + (B - x)*I_i - x*J_i = 0
// x*(A + I_i + J_i) = B*I_i
// x* = B*I_i / (A + I_i + J_i)   clamped to [0, B]
function solveShunting(input, J, A, B) {
  return input.map((Ii, i) => {
    const num = B * Ii;
    const den = A + Ii + J[i];
    return den > 0 ? Math.max(0, Math.min(B, num / den)) : 0;
  });
}

// ── x-axis labels ─────────────────────────────────────────────────────────────
function makeXAxis(n) {
  return Array.from({ length: n }, (_, i) => 'Cell ' + (i + 1));
}

// ── Plotly layout helper ───────────────────────────────────────────────────────
function baseLayout(ytitle, yrange) {
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 56 },
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

// ── Render input chart ────────────────────────────────────────────────────────
function renderInput(xs, input) {
  const trace = {
    x: xs,
    y: input,
    type: 'bar',
    marker: {
      color: input.map(() => 'rgba(74,127,181,0.7)'),
      line: { color: '#4a7fb5', width: 1 },
    },
    name: 'Input',
  };
  const layout = baseLayout('Input I[i]');
  layout.margin.t = 4;
  layout.margin.b = 56;
  Plotly.react('plot-input', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Render subtractive output ─────────────────────────────────────────────────
function renderSubtractive(xs, vals) {
  const colors = vals.map(v => v < 0 ? 'rgba(192,96,88,0.8)' : 'rgba(192,96,88,0.55)');
  const trace = {
    x: xs,
    y: vals,
    type: 'bar',
    marker: {
      color: colors,
      line: { color: '#c06058', width: 1 },
    },
    name: 'Subtractive',
  };
  const minV = Math.min(...vals, 0);
  const maxV = Math.max(...vals, 0);
  const pad = (maxV - minV) * 0.15 || 0.5;
  const layout = baseLayout('Activity x*');
  layout.yaxis.range = [minV - pad, maxV + pad];

  // Shade negative region
  if (minV < 0) {
    layout.shapes = [{
      type: 'rect',
      x0: -0.5, x1: xs.length - 0.5,
      y0: minV - pad, y1: 0,
      fillcolor: 'rgba(192,96,88,0.04)',
      line: { width: 0 },
      layer: 'below',
    }];
    layout.annotations = [{
      x: xs.length * 0.5,
      y: minV * 0.6,
      text: '음수 활동 발생!',
      showarrow: false,
      font: { size: 10, color: '#c06058' },
    }];
  }

  Plotly.react('plot-sub', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Render shunting output ─────────────────────────────────────────────────────
function renderShunting(xs, vals) {
  const trace = {
    x: xs,
    y: vals,
    type: 'bar',
    marker: {
      color: 'rgba(90,154,114,0.65)',
      line: { color: '#5a9a72', width: 1 },
    },
    name: 'Shunting',
  };
  const layout = baseLayout('Activity x*');
  layout.yaxis.range = [0, paramB * 1.15];

  // B boundary line
  layout.shapes = [{
    type: 'line',
    x0: -0.5, x1: xs.length - 0.5,
    y0: paramB, y1: paramB,
    line: { color: 'rgba(90,154,114,0.4)', width: 1.5, dash: 'dash' },
  }];
  layout.annotations = [{
    x: xs.length - 1,
    y: paramB,
    text: 'B = ' + paramB,
    showarrow: false,
    yanchor: 'bottom',
    font: { size: 10, color: '#5a9a72' },
  }];

  Plotly.react('plot-shunt', [trace], layout, { responsive: true, displayModeBar: false });
}

// ── Main update ───────────────────────────────────────────────────────────────
function update() {
  const mag = sliderToMag(magSliderVal);
  const input = makePattern(currentPattern, nCells, mag);
  const J = computeJ(input);
  const subVals   = solveSubtractive(input, J, paramA);
  const shuntVals = solveShunting(input, J, paramA, paramB);
  const xs = makeXAxis(nCells);

  renderInput(xs, input);
  renderSubtractive(xs, subVals);
  renderShunting(xs, shuntVals);
}

// ── KaTeX equations ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // ODE
  katex.render(
    String.raw`\frac{dx_i}{dt} = -A\,x_i + (B - x_i)\,I_i - x_i\,J_i`,
    document.getElementById('eq-ode'),
    { displayMode: true }
  );
  // Equilibrium
  katex.render(
    String.raw`x_i^* = \frac{B\,I_i}{A + I_i + J_i}`,
    document.getElementById('eq-equil'),
    { displayMode: true }
  );
  // Excitation
  katex.render(
    String.raw`I_i \;\text{(R} \to \text{B, on-center)}`,
    document.getElementById('eq-excit'),
    { displayMode: true }
  );
  // Inhibition
  katex.render(
    String.raw`J_i = \sum_{k \neq i} I_k \;\text{(R} \to \text{H} \to \text{B, off-surround)}`,
    document.getElementById('eq-inhib'),
    { displayMode: true }
  );
  // Subtractive comparison
  katex.render(
    String.raw`\frac{dx}{dt} = -Ax + I - J \;\Rightarrow\; x^* = \frac{I - J}{A}`,
    document.getElementById('eq-sub'),
    { displayMode: true }
  );
  // Shunting comparison
  katex.render(
    String.raw`\frac{dx}{dt} = -Ax + (B-x)I - xJ \;\Rightarrow\; x^* = \frac{BI}{A+I+J}`,
    document.getElementById('eq-shunt'),
    { displayMode: true }
  );

  // Set initial display values
  const mag = sliderToMag(magSliderVal);
  document.getElementById('val-mag').textContent =
    mag < 0.1 ? mag.toExponential(1) : mag < 10 ? mag.toFixed(2) : mag.toFixed(1);
  document.getElementById('val-A').textContent = paramA.toFixed(1);
  document.getElementById('val-B').textContent = paramB;
  document.getElementById('val-n').textContent = nCells;

  update();
});

// ── Slider bindings ───────────────────────────────────────────────────────────
document.getElementById('slider-mag').addEventListener('input', e => {
  magSliderVal = parseFloat(e.target.value);
  const mag = sliderToMag(magSliderVal);
  document.getElementById('val-mag').textContent =
    mag < 0.1 ? mag.toExponential(1) : mag < 10 ? mag.toFixed(2) : mag.toFixed(1);
  update();
});

document.getElementById('slider-A').addEventListener('input', e => {
  paramA = parseFloat(e.target.value);
  document.getElementById('val-A').textContent = paramA.toFixed(1);
  update();
});

document.getElementById('slider-B').addEventListener('input', e => {
  paramB = parseFloat(e.target.value);
  document.getElementById('val-B').textContent = paramB;
  update();
});

document.getElementById('slider-n').addEventListener('input', e => {
  nCells = parseInt(e.target.value);
  document.getElementById('val-n').textContent = nCells;
  update();
});

// ── Pattern buttons ───────────────────────────────────────────────────────────
document.querySelectorAll('.pattern-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPattern = btn.dataset.pattern;
    update();
  });
});
