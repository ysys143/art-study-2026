// ============================================================
// fig2_30.js -- Noise Suppression & Weber Law (Grossberg Ch.2)
//
// Full shunting equilibrium (on-center off-surround):
//   x_i* = [(B+C)*I / (A+I)] * [theta_i - C/(B+C)]
//
// where:
//   I     = total illumination (sum of all I_k)
//   theta_i = I_i / I  (reflectance of cell i)
//   C/(B+C) = adaptation level
//
// Noise suppression:
//   Uniform input -> all theta_i = 1/n
//   If B = (n-1)*C -> C/(B+C) = 1/n -> x_i* = 0 for all i
// ============================================================

// -- Log-scale conversion for illumination slider --
function sliderToI(v) {
  // 0 -> 0.01, 500 -> ~3.16, 1000 -> 1000
  return Math.pow(10, (v / 1000) * 5 - 2);
}

// -- Parameters --
let paramA = 1.0;
let paramB = 9.0;
let paramC = 1.0;
let nCells = 10;
let totalI = sliderToI(400);
let currentPattern = 'uniform';

// -- Core equation: x_i* = [(B+C)*I/(A+I)] * [theta_i - C/(B+C)] --
function calcX(theta_i, I, A, B, C) {
  const adaptLevel = C / (B + C);
  const weberGain  = (B + C) * I / (A + I);
  return weberGain * (theta_i - adaptLevel);
}

function adaptationLevel(B, C) {
  return C / (B + C);
}

function weberGain(I, A, B, C) {
  return (B + C) * I / (A + I);
}

// -- Pattern generators: return array of I_i values (length n) --
function makePattern(name, n, totalIval) {
  const arr = new Array(n);
  switch (name) {
    case 'uniform':
      // All equal -> theta_i = 1/n for all i
      for (let i = 0; i < n; i++) arr[i] = totalIval / n;
      break;
    case 'step':
      // Left half bright, right half dim
      for (let i = 0; i < n; i++) {
        arr[i] = i < n / 2 ? (totalIval / n) * 1.8 : (totalIval / n) * 0.2;
      }
      break;
    case 'bar':
      // Single bright bar in the center (20% of cells), rest dim
      for (let i = 0; i < n; i++) {
        const center = Math.floor(n / 2);
        const half   = Math.max(1, Math.floor(n * 0.1));
        arr[i] = Math.abs(i - center) <= half
          ? (totalIval / n) * 2.5
          : (totalIval / n) * 0.3;
      }
      break;
    case 'gradient':
      // Linear gradient from bright to dim
      for (let i = 0; i < n; i++) {
        arr[i] = (totalIval / n) * (2.0 - (1.5 * i) / (n - 1));
      }
      break;
    default:
      for (let i = 0; i < n; i++) arr[i] = totalIval / n;
  }
  // Normalize so sum === totalIval
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (let i = 0; i < n; i++) arr[i] = (arr[i] / sum) * totalIval;
  }
  return arr;
}

// -- Compute theta from input array --
function computeTheta(input) {
  const sum = input.reduce((a, b) => a + b, 0);
  if (sum <= 0) return input.map(() => 1 / input.length);
  return input.map(v => v / sum);
}

// -- Cell labels --
function cellLabels(n) {
  return Array.from({ length: n }, (_, i) => 'cell ' + (i + 1));
}

// -- Plot styling helpers --
const PLOT_OPTS = { responsive: true, displayModeBar: false };

function basePlotLayout(extra) {
  return Object.assign({
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 16, b: 48 },
    showlegend: false
  }, extra || {});
}

// ============================================================
// UPDATE FUNCTIONS
// ============================================================

function update() {
  const input  = makePattern(currentPattern, nCells, totalI);
  const theta  = computeTheta(input);
  const al     = adaptationLevel(paramB, paramC);
  const xs     = theta.map(th => calcX(th, totalI, paramA, paramB, paramC));
  const labels = cellLabels(nCells);

  updateStatusBar(theta, xs, al);
  updateInputChart(input, labels);
  updateThetaChart(theta, labels, al);
  updateActivityChart(xs, labels);
  updateWeberChart(theta);
}

// -- Status bar --
function updateStatusBar(_theta, xs, al) {
  const n          = nCells;
  const idealAL    = 1 / n;
  const allNearZero = xs.every(x => Math.abs(x) < 1e-6);
  const gain       = weberGain(totalI, paramA, paramB, paramC);

  let html =
    '적응 수준 C/(B+C) = <strong>' + al.toFixed(4) + '</strong>' +
    ' &mdash; 1/n = <strong>' + idealAL.toFixed(4) + '</strong>' +
    ' &mdash; B=(n−1)C 조건: <strong>' + ((paramB - (n - 1) * paramC) < 0.01 && (paramB - (n - 1) * paramC) > -0.01 ? '만족' : '미충족') + '</strong>' +
    ' &mdash; Weber 이득: <strong>' + gain.toFixed(3) + '</strong>';

  if (currentPattern === 'uniform') {
    html += allNearZero
      ? ' <span class="suppressed-tag">잡음 억제 완벽</span>'
      : ' <span class="suppressed-tag">균일 패턴 — 거의 0</span>';
  } else {
    html += ' <span class="preserved-tag">특징 패턴 보존됨</span>';
  }

  document.getElementById('status-bar').innerHTML = html;
}

// -- Input pattern chart --
function updateInputChart(input, labels) {
  const trace = {
    x: labels,
    y: input,
    type: 'bar',
    marker: { color: '#4a7fb5', opacity: 0.8 },
    hovertemplate: 'I_%{x} = %{y:.4f}<extra></extra>'
  };

  const layout = basePlotLayout({
    margin: { l: 52, r: 16, t: 8, b: 40 },
    xaxis: { gridcolor: '#eae6e0', tickfont: { size: 9 } },
    yaxis: { title: 'I_i', gridcolor: '#eae6e0', rangemode: 'tozero' }
  });

  Plotly.react('plot-input', [trace], layout, PLOT_OPTS);
}

// -- Theta (reflectance) chart --
function updateThetaChart(theta, labels, al) {
  const n = nCells;
  const idealAL = 1 / n;

  const barColors = theta.map(th =>
    Math.abs(th - al) < 1e-5 ? '#c49a3c' : (th > al ? '#4a7fb5' : '#c06058')
  );

  const trace = {
    x: labels,
    y: theta,
    type: 'bar',
    marker: { color: barColors, opacity: 0.82 },
    hovertemplate: 'θ_%{x} = %{y:.4f}<extra></extra>'
  };

  const maxTheta = Math.max(...theta, idealAL * 1.5, 0.01);

  const layout = basePlotLayout({
    margin: { l: 52, r: 16, t: 8, b: 40 },
    xaxis: { gridcolor: '#eae6e0', tickfont: { size: 9 } },
    yaxis: {
      title: 'θ_i',
      gridcolor: '#eae6e0',
      rangemode: 'tozero',
      range: [0, maxTheta * 1.25]
    },
    shapes: [
      {
        type: 'line', x0: -0.5, x1: n - 0.5, y0: al, y1: al,
        line: { color: '#bf6a42', width: 2, dash: 'dash' }
      }
    ],
    annotations: [
      {
        x: n - 1, y: al, xanchor: 'right', yanchor: 'bottom',
        text: 'adapt. level = ' + al.toFixed(3),
        showarrow: false,
        font: { size: 9, color: '#bf6a42' }
      }
    ]
  });

  Plotly.react('plot-theta', [trace], layout, PLOT_OPTS);
}

// -- Activity chart --
function updateActivityChart(xs, labels) {
  const maxAbs = Math.max(...xs.map(Math.abs), 0.001);

  const colors = xs.map(x =>
    Math.abs(x) < 1e-6 ? '#c49a3c' : (x > 0 ? '#5a9a72' : '#c06058')
  );

  const trace = {
    x: labels,
    y: xs,
    type: 'bar',
    marker: { color: colors, opacity: 0.85 },
    hovertemplate: 'x_%{x}* = %{y:.4f}<extra></extra>'
  };

  const suppressed = xs.every(x => Math.abs(x) < 1e-4);

  const layout = basePlotLayout({
    margin: { l: 52, r: 16, t: 8, b: 40 },
    xaxis: { gridcolor: '#eae6e0', tickfont: { size: 9 } },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#bf6a42',
      zerolinewidth: 2,
      range: suppressed
        ? [-0.01, 0.01]
        : [-maxAbs * 1.35, maxAbs * 1.35]
    },
    shapes: [
      {
        type: 'line', x0: -0.5, x1: nCells - 0.5, y0: 0, y1: 0,
        line: { color: '#bf6a42', width: 1.5, dash: 'dash' }
      }
    ],
    annotations: suppressed ? [
      {
        x: Math.floor(nCells / 2) - 1, y: 0.005, xanchor: 'center',
        text: '균일 입력 억제 — x_i* ≈ 0',
        showarrow: false,
        font: { size: 11, color: '#c06058', weight: 700 }
      }
    ] : []
  });

  Plotly.react('plot-activity', [trace], layout, PLOT_OPTS);
}

// -- Weber law chart: x_i* vs I for each cell (sign invariance) --
function updateWeberChart(theta) {
  const Is = [];
  for (let e = -2; e <= 3; e += 0.04) Is.push(Math.pow(10, e));

  const palette = [
    '#4a7fb5', '#5a9a72', '#c06058', '#c49a3c', '#9b6bb5',
    '#bf6a42', '#3a8fa0', '#7a6fb5', '#a07040', '#5a7060'
  ];

  const traces = theta.map((th, i) => ({
    x: Is,
    y: Is.map(I => calcX(th, I, paramA, paramB, paramC)),
    mode: 'lines',
    name: 'θ=' + th.toFixed(3),
    line: { color: palette[i % palette.length], width: currentPattern === 'uniform' ? 1.5 : 2 },
    hovertemplate: 'I=%{x:.2f} x*=%{y:.4f}<extra>θ=' + th.toFixed(3) + '</extra>'
  }));

  // Zero reference line
  traces.push({
    x: [Is[0], Is[Is.length - 1]],
    y: [0, 0],
    mode: 'lines',
    name: 'zero',
    line: { color: '#bf6a42', width: 1.5, dash: 'dash' },
    hoverinfo: 'skip'
  });

  // Mark current I
  const currentXs = theta.map(th => calcX(th, totalI, paramA, paramB, paramC));
  traces.push({
    x: theta.map(() => totalI),
    y: currentXs,
    mode: 'markers',
    name: '현재 I',
    marker: { color: '#bf6a42', size: 7, symbol: 'circle' },
    hovertemplate: 'I=' + totalI.toFixed(2) + ' x*=%{y:.4f}<extra>현재</extra>'
  });

  const layout = basePlotLayout({
    margin: { l: 52, r: 16, t: 8, b: 48 },
    showlegend: true,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } },
    xaxis: {
      title: 'Total Input I',
      type: 'log',
      gridcolor: '#eae6e0',
      zeroline: false
    },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#bf6a4266'
    }
  });

  Plotly.react('plot-weber', traces, layout, PLOT_OPTS);
}

// ============================================================
// INIT + BINDINGS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // KaTeX: main equation
  katex.render(
    String.raw`x_i^* = \underbrace{\frac{(B+C)\,I}{A+I}}_{\text{Weber Law}} \cdot \left[\,\theta_i - \underbrace{\frac{C}{B+C}}_{\text{Adapt. Level}}\,\right]`,
    document.getElementById('eq-main'),
    { displayMode: true, throwOnError: false }
  );

  // KaTeX: Weber factor
  katex.render(
    String.raw`\frac{(B+C)\,I}{A+I}`,
    document.getElementById('eq-weber'),
    { displayMode: true, throwOnError: false }
  );

  // KaTeX: theta
  katex.render(
    String.raw`\theta_i = \frac{I_i}{I}`,
    document.getElementById('eq-theta'),
    { displayMode: true, throwOnError: false }
  );

  // KaTeX: adaptation level
  katex.render(
    String.raw`\frac{C}{B+C} = \frac{1}{n} \text{ when } B=(n{-}1)C`,
    document.getElementById('eq-adapt'),
    { displayMode: true, throwOnError: false }
  );

  // Initial render
  update();

  // Slider: A
  document.getElementById('slider-A').addEventListener('input', function () {
    paramA = parseFloat(this.value);
    document.getElementById('val-A').textContent = paramA.toFixed(1);
    update();
  });

  // Slider: B
  document.getElementById('slider-B').addEventListener('input', function () {
    paramB = parseFloat(this.value);
    document.getElementById('val-B').textContent = paramB.toFixed(1);
    update();
  });

  // Slider: C
  document.getElementById('slider-C').addEventListener('input', function () {
    paramC = parseFloat(this.value);
    document.getElementById('val-C').textContent = paramC.toFixed(1);
    update();
  });

  // Slider: n (cell count)
  document.getElementById('slider-n').addEventListener('input', function () {
    nCells = parseInt(this.value, 10);
    document.getElementById('val-n').textContent = nCells;
    update();
  });

  // Slider: I (total illumination, log scale)
  document.getElementById('slider-I').addEventListener('input', function () {
    totalI = sliderToI(parseFloat(this.value));
    const disp = totalI < 0.1
      ? totalI.toExponential(2)
      : totalI < 10
        ? totalI.toFixed(2)
        : totalI.toFixed(1);
    document.getElementById('val-I').textContent = disp;
    update();
  });

  // Pattern buttons
  document.querySelectorAll('#pattern-btns .pattern-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#pattern-btns .pattern-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentPattern = this.dataset.pattern;
      update();
    });
  });
});
