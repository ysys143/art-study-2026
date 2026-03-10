// fig2_34.js — Ratio-Contrast Detector / DOG·SOG Contours
// Grossberg Ch.2, Figure 2.34 (Figs 2.35–2.36 in slides)
// DOG = Difference of Gaussians (contour detector)
// SOG = Sum of Gaussians (normalizing denominator)

// -- Parameters ----------------------------------------------------------------
let paramA   = 1.0;   // decay
let paramB   = 10.0;  // excitatory bound
let paramD   = 2.0;   // inhibitory bound
let C_amp    = 1.0;   // excitatory kernel amplitude
let E_amp    = 1.0;   // inhibitory kernel amplitude
let mu       = 2.0;   // excitatory kernel width inverse (larger = narrower)
let nu       = 0.3;   // inhibitory kernel width inverse (smaller = broader)
let totalI   = 10.0;  // total illumination
let nCells   = 30;    // number of cells in 1D array
let currentPattern = 'step';

// -- Gaussian helper -----------------------------------------------------------
function gaussian(dist, sigma_inv) {
  return Math.exp(-sigma_inv * dist * dist);
}

// -- Build kernel profile for center cell i=0 over distances ------------------
function buildKernelProfile(halfW) {
  const ds = [];
  const Ck = [];
  const Ek = [];
  for (let d = -halfW; d <= halfW; d++) {
    ds.push(d);
    Ck.push(C_amp * gaussian(d, mu));
    Ek.push(E_amp * gaussian(d, nu));
  }
  return { ds, Ck, Ek };
}

// -- Compute equilibrium output -----------------------------------------------
// C_ki = C_amp * exp(-mu*(k-i)^2)
// E_ki = E_amp * exp(-nu*(k-i)^2)
// F_ki = B*C_ki - D*E_ki  (DOG)
// G_ki = C_ki + E_ki       (SOG)
// x_i* = I * sum_k(theta_k * F_ki) / (A + I * sum_k(theta_k * G_ki))
// theta_k = I_k / I_total  (reflectance weights)
function computeOutput(input) {
  const n = input.length;
  const I_total = input.reduce((a, b) => a + b, 0);
  const theta = input.map(v => (I_total > 0 ? v / I_total : 1 / n));

  const output = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sumF = 0;
    let sumG = 0;
    for (let k = 0; k < n; k++) {
      const d = k - i;
      const Cki = C_amp * gaussian(d, mu);
      const Eki = E_amp * gaussian(d, nu);
      const Fki = paramB * Cki - paramD * Eki; // DOG
      const Gki = Cki + Eki;                   // SOG
      sumF += theta[k] * Fki;
      sumG += theta[k] * Gki;
    }
    const denom = paramA + totalI * sumG;
    output[i] = denom > 0 ? (totalI * sumF) / denom : 0;
  }
  return output;
}

// -- Compute noise suppression condition values --------------------------------
// Integrate C_ki and E_ki over distances to check B*sumC <= D*sumE
function computeConditionValues() {
  let sumC = 0, sumE = 0;
  const halfW = Math.min(nCells, 60);
  for (let d = -halfW; d <= halfW; d++) {
    sumC += C_amp * gaussian(d, mu);
    sumE += E_amp * gaussian(d, nu);
  }
  return {
    left:  paramB * sumC,   // B * sum C_ki
    right: paramD * sumE,   // D * sum E_ki
  };
}

// -- Input patterns -----------------------------------------------------------
function makePattern(name, n) {
  const arr = new Array(n).fill(0);
  const half = Math.floor(n / 2);
  switch (name) {
    case 'step':
      for (let i = 0; i < n; i++) arr[i] = i >= half ? 1.0 : 0.15;
      break;
    case 'bar': {
      const bS = Math.floor(n * 0.3), bE = Math.floor(n * 0.7);
      for (let i = 0; i < n; i++) arr[i] = (i >= bS && i < bE) ? 1.0 : 0.05;
      break;
    }
    case 'uniform':
      for (let i = 0; i < n; i++) arr[i] = 1.0;
      break;
    case 'gradient':
      for (let i = 0; i < n; i++) arr[i] = 0.05 + 0.95 * (i / (n - 1));
      break;
    default:
      for (let i = 0; i < n; i++) arr[i] = i >= half ? 1.0 : 0.15;
  }
  return arr.map(v => v * totalI);
}

// -- x-axis labels ------------------------------------------------------------
function makeXAxis(n) {
  return Array.from({ length: n }, (_, i) => i + 1);
}

// -- Plotly layout helper -----------------------------------------------------
function baseLayout(ytitle, extra) {
  return Object.assign({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 40 },
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
    },
    showlegend: false,
  }, extra || {});
}

// -- Render Gaussian kernel profile -------------------------------------------
function renderKernels() {
  const halfW = 15;
  const { ds, Ck, Ek } = buildKernelProfile(halfW);

  const traceC = {
    x: ds, y: Ck,
    type: 'scatter', mode: 'lines',
    name: 'C_ki (excitatory)',
    line: { color: '#5a9a72', width: 2.5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(90,154,114,0.12)',
  };
  const traceE = {
    x: ds, y: Ek,
    type: 'scatter', mode: 'lines',
    name: 'E_ki (inhibitory)',
    line: { color: '#c06058', width: 2.5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(192,96,88,0.1)',
  };

  const layout = baseLayout('Kernel weight');
  layout.xaxis.title = 'Distance (k - i)';
  layout.showlegend = true;
  layout.legend = { x: 0.7, y: 1, font: { size: 10 } };

  Plotly.react('plot-kernels', [traceC, traceE], layout, { responsive: true, displayModeBar: false });
}

// -- Render DOG and SOG -------------------------------------------------------
function renderDogSog() {
  const halfW = 15;
  const { ds, Ck, Ek } = buildKernelProfile(halfW);

  const Fk = Ck.map((c, idx) => paramB * c - paramD * Ek[idx]); // DOG
  const Gk = Ck.map((c, idx) => c + Ek[idx]);                   // SOG

  const traceDog = {
    x: ds, y: Fk,
    type: 'scatter', mode: 'lines',
    name: 'F_ki DOG',
    line: { color: '#4a7fb5', width: 2.5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(74,127,181,0.1)',
  };
  const traceSog = {
    x: ds, y: Gk,
    type: 'scatter', mode: 'lines',
    name: 'G_ki SOG',
    line: { color: '#9b9590', width: 1.8, dash: 'dot' },
  };

  const layout = baseLayout('Kernel weight');
  layout.xaxis.title = 'Distance (k - i)';
  layout.showlegend = true;
  layout.legend = { x: 0.7, y: 1, font: { size: 10 } };

  Plotly.react('plot-dogSog', [traceDog, traceSog], layout, { responsive: true, displayModeBar: false });
}

// -- Render input -------------------------------------------------------------
function renderInput(xs, input) {
  const trace = {
    x: xs, y: input,
    type: 'bar',
    marker: {
      color: 'rgba(74,127,181,0.6)',
      line: { color: '#4a7fb5', width: 1 },
    },
    name: 'Input I_i',
  };
  const layout = baseLayout('Input I_i');
  Plotly.react('plot-input', [trace], layout, { responsive: true, displayModeBar: false });
}

// -- Render output ------------------------------------------------------------
function renderOutput(xs, output) {
  const maxOut = Math.max(...output.map(Math.abs), 0.01);
  const minOut = Math.min(...output, 0);

  const trace = {
    x: xs, y: output,
    type: 'scatter', mode: 'lines+markers',
    line: { color: '#4a7fb5', width: 2.5 },
    marker: { color: '#4a7fb5', size: 5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(74,127,181,0.1)',
    name: 'Output x_i*',
  };

  const layout = baseLayout('Output x_i*');
  const pad = maxOut * 0.2 || 0.1;
  layout.yaxis.range = [Math.min(minOut - pad, -pad * 0.5), maxOut + pad];

  if (minOut < -0.01) {
    layout.annotations = [{
      x: xs[Math.floor(xs.length * 0.5)],
      y: minOut * 0.5,
      text: '억제 (x < 0)',
      showarrow: false,
      font: { size: 10, color: '#c06058' },
    }];
  }

  Plotly.react('plot-output', [trace], layout, { responsive: true, displayModeBar: false });
}

// -- Update noise suppression condition display --------------------------------
function updateCondition() {
  const { left, right } = computeConditionValues();
  const satisfied = left <= right;

  document.getElementById('cond-left').textContent  = left.toFixed(3);
  document.getElementById('cond-right').textContent = right.toFixed(3);

  const verdictEl    = document.getElementById('cond-verdict');
  const verdictTitle = document.getElementById('cond-verdict-title');
  const verdictCard  = document.getElementById('cond-verdict-card');
  const noiseStatus  = document.getElementById('noise-status');

  if (satisfied) {
    verdictEl.textContent = 'B*sumC <= D*sumE [OK]';
    verdictEl.style.color = 'var(--green)';
    verdictTitle.textContent = '균일 억제 ON';
    verdictTitle.className = 'condition-card-title green';
    verdictCard.className = 'condition-card satisfied';
    noiseStatus.textContent = '균일 억제 ON';
    noiseStatus.className = 'noise-status suppressed';
  } else {
    verdictEl.textContent = 'B*sumC > D*sumE [NO]';
    verdictEl.style.color = 'var(--red)';
    verdictTitle.textContent = '균일 억제 OFF';
    verdictTitle.className = 'condition-card-title red';
    verdictCard.className = 'condition-card violated';
    noiseStatus.textContent = '균일 억제 OFF';
    noiseStatus.className = 'noise-status not-suppressed';
  }
}

// -- Main update --------------------------------------------------------------
function update() {
  const input  = makePattern(currentPattern, nCells);
  const output = computeOutput(input);
  const xs     = makeXAxis(nCells);

  renderKernels();
  renderDogSog();
  renderInput(xs, input);
  renderOutput(xs, output);
  updateCondition();
}

// -- KaTeX equations ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  katex.render(
    String.raw`\frac{dx_i}{dt} = -A\,x_i + (B - x_i)\!\sum_k I_k C_{ki} - (x_i + D)\!\sum_k I_k E_{ki}`,
    document.getElementById('eq-ode'),
    { displayMode: true }
  );
  katex.render(
    String.raw`x_i^* = \frac{I\,\displaystyle\sum_k \theta_k\, F_{ki}}{A + I\,\displaystyle\sum_k \theta_k\, G_{ki}}`,
    document.getElementById('eq-equil'),
    { displayMode: true }
  );
  katex.render(
    String.raw`C_{ki} = C\,e^{-\mu(k-i)^2},\quad E_{ki} = E\,e^{-\nu(k-i)^2}`,
    document.getElementById('eq-kernels'),
    { displayMode: true }
  );
  katex.render(
    String.raw`F_{ki} = B\,C_{ki} - D\,E_{ki}`,
    document.getElementById('eq-dog'),
    { displayMode: true }
  );
  katex.render(
    String.raw`G_{ki} = C_{ki} + E_{ki}`,
    document.getElementById('eq-sog'),
    { displayMode: true }
  );
  katex.render(
    String.raw`B\sum_k C_{ki} \;\leq\; D\sum_k E_{ki} \;\Longrightarrow\; \text{uniform suppressed, contours enhanced}`,
    document.getElementById('eq-condition'),
    { displayMode: true }
  );

  // Init display values
  document.getElementById('val-A').textContent    = paramA.toFixed(1);
  document.getElementById('val-B').textContent    = paramB;
  document.getElementById('val-D').textContent    = paramD.toFixed(1);
  document.getElementById('val-Camp').textContent = C_amp.toFixed(1);
  document.getElementById('val-Eamp').textContent = E_amp.toFixed(1);
  document.getElementById('val-mu').textContent   = mu.toFixed(1);
  document.getElementById('val-nu').textContent   = nu.toFixed(2);
  document.getElementById('val-I').textContent    = totalI.toFixed(1);

  update();
});

// -- Slider bindings ----------------------------------------------------------
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

document.getElementById('slider-D').addEventListener('input', e => {
  paramD = parseFloat(e.target.value);
  document.getElementById('val-D').textContent = paramD.toFixed(1);
  update();
});

document.getElementById('slider-Camp').addEventListener('input', e => {
  C_amp = parseFloat(e.target.value);
  document.getElementById('val-Camp').textContent = C_amp.toFixed(1);
  update();
});

document.getElementById('slider-Eamp').addEventListener('input', e => {
  E_amp = parseFloat(e.target.value);
  document.getElementById('val-Eamp').textContent = E_amp.toFixed(1);
  update();
});

document.getElementById('slider-mu').addEventListener('input', e => {
  mu = parseFloat(e.target.value);
  document.getElementById('val-mu').textContent = mu.toFixed(1);
  update();
});

document.getElementById('slider-nu').addEventListener('input', e => {
  nu = parseFloat(e.target.value);
  document.getElementById('val-nu').textContent = nu.toFixed(2);
  update();
});

document.getElementById('slider-I').addEventListener('input', e => {
  totalI = parseFloat(e.target.value);
  document.getElementById('val-I').textContent = totalI.toFixed(1);
  update();
});

// -- Pattern buttons ----------------------------------------------------------
document.querySelectorAll('.pattern-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPattern = btn.dataset.pattern;
    update();
  });
});
