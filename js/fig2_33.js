// fig2_33.js -- Opposites Attract / Noise Suppression Parameters
// Grossberg Ch.2, Figures 2.33 & 2.34
// Demonstrates how intracellular parameters (B, C) predict intercellular wiring (n),
// and how symmetry-breaking produces narrow on-center + broad off-surround kernels.

// -- Parameters ----------------------------------------------------------------
let paramB = 9;    // excitatory saturation (upper bound)
let paramC = 1;    // inhibitory saturation
let nCells = 10;   // number of cells / connections

// Gaussian widths derived from B/C asymmetry
// excitatory sigma narrow, inhibitory sigma broad
function sigmaExc() { return 1.0; }
function sigmaInh() { return 1.0 + (paramB / paramC) * 0.25; }

// -- Gaussian function ---------------------------------------------------------
function gaussian(x, sigma) {
  return Math.exp(-(x * x) / (2 * sigma * sigma));
}

// -- DOG (Difference of Gaussians) kernel -------------------------------------
// K(d) = B * G(d, sigma_e) - C * G(d, sigma_i)
function dogKernel(dist, B, C, sigE, sigI) {
  return B * gaussian(dist, sigE) - C * gaussian(dist, sigI);
}

// -- Build kernel profile over distance range ---------------------------------
function buildKernel(B, C) {
  const sigE = sigmaExc();
  const sigI = sigmaInh();
  const xs = [];
  const excVals = [];
  const inhVals = [];
  const dogVals = [];
  const N = 200;
  const range = 8;
  for (let i = 0; i <= N; i++) {
    const d = -range + (2 * range * i) / N;
    xs.push(d);
    excVals.push(B * gaussian(d, sigE));
    inhVals.push(-C * gaussian(d, sigI));
    dogVals.push(dogKernel(d, B, C, sigE, sigI));
  }
  return { xs, excVals, inhVals, dogVals };
}

// -- Build step-edge input ----------------------------------------------------
function buildStepInput(n) {
  const xs = Array.from({ length: n }, (_, i) => i);
  const input = xs.map(i => i < n / 2 ? 0.2 : 1.0);
  return { xs, input };
}

// -- Apply DOG kernel to discrete input ---------------------------------------
// Response at cell i = sum over j of K(|i-j|) * input[j]
function applyKernel(input, B, C) {
  const sigE = sigmaExc();
  const sigI = sigmaInh();
  const n = input.length;
  const response = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let val = 0;
    for (let j = 0; j < n; j++) {
      val += dogKernel(i - j, B, C, sigE, sigI) * input[j];
    }
    response[i] = val;
  }
  return response;
}

// -- Plotly layout helper -----------------------------------------------------
function baseLayout(ytitle, yrange) {
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 48 },
    xaxis: {
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#c0bbb5',
      zerolinewidth: 1,
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
    showlegend: true,
    legend: {
      x: 0.01, y: 0.99,
      bgcolor: 'rgba(250,248,245,0.85)',
      bordercolor: '#eae6e0',
      borderwidth: 1,
      font: { size: 10 },
    },
  };
}

// -- Render kernel chart -------------------------------------------------------
function renderKernel(B, C) {
  const { xs, excVals, inhVals, dogVals } = buildKernel(B, C);

  const traceExc = {
    x: xs, y: excVals,
    type: 'scatter', mode: 'lines',
    name: 'Excitatory (+)',
    line: { color: '#5a9a72', width: 2 },
    fill: 'tozeroy',
    fillcolor: 'rgba(90,154,114,0.08)',
  };
  const traceInh = {
    x: xs, y: inhVals,
    type: 'scatter', mode: 'lines',
    name: 'Inhibitory (-)',
    line: { color: '#c06058', width: 2 },
    fill: 'tozeroy',
    fillcolor: 'rgba(192,96,88,0.08)',
  };
  const traceDog = {
    x: xs, y: dogVals,
    type: 'scatter', mode: 'lines',
    name: 'DOG (combined)',
    line: { color: '#4a7fb5', width: 2.5, dash: 'solid' },
  };

  const layout = baseLayout('Kernel K(d)');
  layout.xaxis.title = 'Distance d';

  Plotly.react('plot-kernel', [traceExc, traceInh, traceDog], layout,
    { responsive: true, displayModeBar: false });
}

// -- Render response chart ----------------------------------------------------
function renderResponse(B, C) {
  const n = 30;
  const { xs, input } = buildStepInput(n);
  const response = applyKernel(input, B, C);

  // Normalize response for display
  const maxAbs = Math.max(...response.map(Math.abs), 0.01);
  const respNorm = response.map(v => v / maxAbs);

  const traceInput = {
    x: xs, y: input,
    type: 'scatter', mode: 'lines',
    name: 'Input (step edge)',
    line: { color: '#c49a3c', width: 2, dash: 'dot' },
  };
  const traceResp = {
    x: xs, y: respNorm,
    type: 'scatter', mode: 'lines',
    name: 'Network response (norm.)',
    line: { color: '#4a7fb5', width: 2.5 },
    fill: 'tozeroy',
    fillcolor: 'rgba(74,127,181,0.08)',
  };

  const layout = baseLayout('Amplitude');
  layout.xaxis.title = 'Cell index';
  layout.shapes = [{
    type: 'line',
    x0: n / 2, x1: n / 2,
    y0: -2, y1: 2,
    line: { color: 'rgba(155,149,144,0.4)', width: 1, dash: 'dash' },
  }];
  layout.annotations = [{
    x: n / 2, y: 1.1,
    text: 'edge',
    showarrow: false,
    font: { size: 10, color: '#9b9590' },
  }];

  Plotly.react('plot-response', [traceInput, traceResp], layout,
    { responsive: true, displayModeBar: false });
}

// -- Update parameter status display ------------------------------------------
function updateStatus(B, C, n) {
  const cb = C / B;
  const target = 1 / (n - 1);
  const bc = B / C;

  document.getElementById('disp-cb').textContent = cb.toFixed(4);
  document.getElementById('disp-target').textContent = target.toFixed(4);
  document.getElementById('disp-bc').textContent = bc.toFixed(2) + 'x';

  const diff = Math.abs(cb - target);
  const relErr = diff / target;
  const box = document.getElementById('condition-box');

  if (relErr < 0.05) {
    box.className = 'condition-box satisfied';
    box.innerHTML =
      'Opposites Attract <strong>[O] SATISFIED</strong><br>' +
      '<span style="font-size:12px;font-weight:400">C/B = ' + cb.toFixed(4) +
      ' ~ 1/(n-1) = ' + target.toFixed(4) + '</span><br>' +
      '<span style="font-size:11px;color:inherit;opacity:.8">노이즈 억제가 정확하게 작동합니다.</span>';
  } else {
    const direction = cb < target
      ? 'C를 높이거나 B를 낮추세요 (또는 n을 키우세요)'
      : 'C를 낮추거나 B를 높이세요 (또는 n을 줄이세요)';
    box.className = 'condition-box violated';
    box.innerHTML =
      'Opposites Attract <strong>[X] NOT SATISFIED</strong><br>' +
      '<span style="font-size:12px;font-weight:400">C/B = ' + cb.toFixed(4) +
      ' vs 1/(n-1) = ' + target.toFixed(4) +
      ' (error ' + (relErr * 100).toFixed(1) + '%)</span><br>' +
      '<span style="font-size:11px;opacity:.8">' + direction + '</span>';
  }
}

// -- Main update --------------------------------------------------------------
function update() {
  updateStatus(paramB, paramC, nCells);
  renderKernel(paramB, paramC);
  renderResponse(paramB, paramC);
}

// -- KaTeX equations ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Opposites Attract Rule
  katex.render(
    String.raw`\frac{C}{B} = \frac{1}{n-1}`,
    document.getElementById('eq-oar'),
    { displayMode: true }
  );

  // Equivalent forms
  katex.render(
    String.raw`B = (n-1)C \;\Leftrightarrow\; \frac{C}{B+C} = \frac{1}{n}`,
    document.getElementById('eq-equiv'),
    { displayMode: true }
  );

  // Set initial display values
  document.getElementById('val-B').textContent = paramB;
  document.getElementById('val-C').textContent = paramC.toFixed(1);
  document.getElementById('val-n').textContent = nCells;

  update();
});

// -- Slider bindings ----------------------------------------------------------
document.getElementById('slider-B').addEventListener('input', e => {
  paramB = parseFloat(e.target.value);
  document.getElementById('val-B').textContent = paramB;
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
