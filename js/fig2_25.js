// ── fig2_25.js  Weber's Law, Adaptation & Shift Property ─────────────────────
// Static equilibrium analysis — no ODE needed.
// x_i(K, J) = B * e^K / (A + e^K + J),  K = ln(I_i)

// ── State ────────────────────────────────────────────────────────────────────
let A = 1, B = 10, nJ = 4, Jmin = 0, Jmax = 30;
let K_demo = 0, J_demo = 5;

// ── Core equation ─────────────────────────────────────────────────────────────
function x_eq(K, J) {
  const I = Math.exp(K);
  return B * I / (A + I + J);
}

// ── Compute evenly-spaced J values ────────────────────────────────────────────
function getJLevels() {
  const levels = [];
  for (let k = 0; k < nJ; k++) {
    levels.push(Jmin + (Jmax - Jmin) * k / Math.max(nJ - 1, 1));
  }
  return levels;
}

// ── Colors for curves (warm to cool) ─────────────────────────────────────────
const CURVE_COLORS = ['#4a7fb5', '#5a9a72', '#c49a3c', '#c06058', '#9b6bb5', '#bf6a42'];

// ── KaTeX render on DOM ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  katex.render(
    String.raw`x_i(K,J) = \frac{B\,e^K}{A + e^K + J}`,
    document.getElementById('eq-equil'), { displayMode: true }
  );
  katex.render(
    String.raw`K = \ln I_i,\quad I_i = e^K,\quad J = \sum_{k \neq i} I_k`,
    document.getElementById('eq-log'), { displayMode: true }
  );
  katex.render(
    String.raw`x(K+S,\,J_1) \equiv x(K,\,J_2)`,
    document.getElementById('eq-shift'), { displayMode: true }
  );
  katex.render(
    String.raw`\dot{x}_i = -A\,x_i + I_i`,
    document.getElementById('eq-additive'), { displayMode: true }
  );
  katex.render(
    String.raw`x_i^* = \frac{B\,e^K}{A + e^K + J} \xrightarrow{\text{shift}} S = \ln\!\frac{A+J_1}{A+J_2}`,
    document.getElementById('eq-shunting'), { displayMode: true }
  );

  buildMainChart();
  buildDemoChart();
  buildCompareChart();
  updateDemoReadout();
});

// ── K sweep for curves ────────────────────────────────────────────────────────
function kRange() {
  const pts = [];
  for (let k = -5; k <= 8; k += 0.06) pts.push(k);
  return pts;
}

// ── Main chart: shift property ────────────────────────────────────────────────
function buildMainChart() {
  const Ks = kRange();
  const Jlevels = getJLevels();
  const traces = [];

  Jlevels.forEach((J, idx) => {
    traces.push({
      x: Ks,
      y: Ks.map(K => x_eq(K, J)),
      mode: 'lines',
      name: 'J = ' + J.toFixed(1),
      line: { color: CURVE_COLORS[idx % CURVE_COLORS.length], width: 2.5 }
    });
  });

  // Dashed B limit line
  traces.push({
    x: [Ks[0], Ks[Ks.length - 1]],
    y: [B, B],
    mode: 'lines',
    name: 'B (상한)',
    line: { color: '#9b9590', width: 1.5, dash: 'dash' },
    hoverinfo: 'skip'
  });

  // Annotate shift S between first two curves
  const shapes = [];
  const annotations = [];
  if (Jlevels.length >= 2) {
    const J1 = Jlevels[0], J2 = Jlevels[1];
    const S = Math.log((A + J1) / (A + J2));
    // Arrow between curves at y = B*0.5
    const yArrow = B * 0.5;
    // K values where each curve hits B/2: x=B/2 => e^K/(A+e^K+J) = 1/(2) => e^K = A+J
    const K_half_J1 = Math.log(A + J1);
    const K_half_J2 = Math.log(A + J2);

    shapes.push({
      type: 'line',
      x0: K_half_J1, x1: K_half_J2,
      y0: yArrow, y1: yArrow,
      line: { color: '#9b9590', width: 1.5, dash: 'dot' }
    });
    annotations.push({
      x: (K_half_J1 + K_half_J2) / 2,
      y: yArrow + B * 0.06,
      text: 'S = ' + Math.abs(S).toFixed(2),
      showarrow: false,
      font: { size: 11, color: '#9b9590', family: 'SF Mono, Fira Code, monospace' },
      bgcolor: 'rgba(250,248,245,0.85)',
      borderpad: 3
    });

    // Update shift info panel
    document.getElementById('shift-J1-val').textContent = J1.toFixed(1);
    document.getElementById('shift-J2-val').textContent = J2.toFixed(1);
    document.getElementById('shift-S-val').textContent = S.toFixed(3);
    document.getElementById('shift-S-log10').textContent = (S / Math.LN10).toFixed(3) + ' dec';
  }

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 54, r: 20, t: 16, b: 48 },
    xaxis: {
      title: 'K = ln(I)  (로그 입력)',
      gridcolor: '#eae6e0',
      zeroline: true, zerolinecolor: '#d0ccc6', zerolinewidth: 1
    },
    yaxis: {
      title: 'x_i(K, J)  (평형 활동)',
      gridcolor: '#eae6e0',
      range: [0, B * 1.15],
      zeroline: false
    },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(250,248,245,0.9)', bordercolor: '#eae6e0', borderwidth: 1 },
    shapes,
    annotations
  };

  Plotly.react('plotly-main', traces, layout, { responsive: true, displayModeBar: false });

  // Update legend
  const legendEl = document.getElementById('curve-legend');
  legendEl.innerHTML = getJLevels().map((J, idx) =>
    `<div class="legend-item">
       <span class="dot" style="background:${CURVE_COLORS[idx % CURVE_COLORS.length]}"></span>
       J = ${J.toFixed(1)}
     </div>`
  ).join('');
}

// ── Demo chart: single curve with marker ────────────────────────────────────
function buildDemoChart() {
  const Ks = kRange();
  const J = J_demo;

  const curve = {
    x: Ks,
    y: Ks.map(K => x_eq(K, J)),
    mode: 'lines',
    name: 'J = ' + J.toFixed(1),
    line: { color: CURVE_COLORS[0], width: 2.5 }
  };

  const xStar = x_eq(K_demo, J);
  const marker = {
    x: [K_demo],
    y: [xStar],
    mode: 'markers',
    name: 'Current point',
    marker: { color: '#bf6a42', size: 10, symbol: 'circle' },
    hovertemplate: 'K=%{x:.2f}<br>x*=%{y:.3f}<extra></extra>'
  };

  const hLine = {
    x: [Ks[0], Ks[Ks.length - 1]], y: [B, B],
    mode: 'lines', name: 'B', line: { color: '#9b9590', width: 1, dash: 'dash' },
    hoverinfo: 'skip'
  };

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 54, r: 20, t: 16, b: 48 },
    xaxis: {
      title: 'K = ln(I)',
      gridcolor: '#eae6e0',
      zeroline: true, zerolinecolor: '#d0ccc6', zerolinewidth: 1
    },
    yaxis: {
      title: 'x*(K, J)',
      gridcolor: '#eae6e0',
      range: [0, B * 1.15],
      zeroline: false
    },
    showlegend: false,
    shapes: [{
      type: 'line',
      x0: K_demo, x1: K_demo, y0: 0, y1: xStar,
      line: { color: '#bf6a4266', width: 1.5, dash: 'dot' }
    }]
  };

  Plotly.react('plotly-demo', [curve, hLine, marker], layout, { responsive: true, displayModeBar: false });
}

// ── Comparison chart: additive vs shunting ────────────────────────────────────
function buildCompareChart() {
  const Ks = kRange();
  const Jlevels = [0, Jmax * 0.33, Jmax * 0.66];
  const traces = [];

  // Additive: x* = e^K / A  (no J dependence — single curve)
  traces.push({
    x: Ks,
    y: Ks.map(K => {
      const I = Math.exp(K);
      return Math.min(I / A, B);  // cap at B for display
    }),
    mode: 'lines',
    name: '가산 (J=any)',
    line: { color: '#c06058', width: 2.5 },
    legendgroup: 'add'
  });

  // Shunting: multiple J curves showing shift
  const shuntColors = ['#4a7fb5', '#5a9a72', '#c49a3c'];
  Jlevels.forEach((J, idx) => {
    traces.push({
      x: Ks,
      y: Ks.map(K => x_eq(K, J)),
      mode: 'lines',
      name: '션팅 J=' + J.toFixed(1),
      line: { color: shuntColors[idx], width: 2, dash: idx === 0 ? 'solid' : 'dot' }
    });
  });

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 54, r: 20, t: 16, b: 48 },
    xaxis: {
      title: 'K = ln(I)',
      gridcolor: '#eae6e0',
      zeroline: true, zerolinecolor: '#d0ccc6', zerolinewidth: 1
    },
    yaxis: {
      title: '반응 활동',
      gridcolor: '#eae6e0',
      range: [0, B * 1.15],
      zeroline: false
    },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(250,248,245,0.9)', bordercolor: '#eae6e0', borderwidth: 1 },
    annotations: [{
      x: 3,
      y: B * 0.85,
      text: '가산: J 변화에도<br>곡선 이동 없음',
      showarrow: false,
      font: { size: 10, color: '#c06058' },
      bgcolor: 'rgba(250,248,245,0.85)',
      borderpad: 3
    }, {
      x: 1,
      y: B * 0.5,
      text: '션팅: J 변화로<br>오른쪽 이동',
      showarrow: false,
      font: { size: 10, color: '#4a7fb5' },
      bgcolor: 'rgba(250,248,245,0.85)',
      borderpad: 3
    }]
  };

  Plotly.react('plotly-compare', traces, layout, { responsive: true, displayModeBar: false });
}

// ── Update demo readout display ───────────────────────────────────────────────
function updateDemoReadout() {
  const I = Math.exp(K_demo);
  const xStar = x_eq(K_demo, J_demo);
  document.getElementById('live-K').textContent = K_demo.toFixed(2);
  document.getElementById('live-I').textContent = I < 0.01 ? I.toExponential(2) : I < 100 ? I.toFixed(3) : I.toFixed(1);
  document.getElementById('live-J').textContent = J_demo.toFixed(1);
  document.getElementById('live-x').textContent = xStar.toFixed(3);
  document.getElementById('live-xB').textContent = (xStar / B).toFixed(3);
}

// ── Slider bindings ───────────────────────────────────────────────────────────
document.getElementById('slider-A').addEventListener('input', function () {
  A = parseFloat(this.value);
  document.getElementById('val-A').textContent = A.toFixed(1);
  buildMainChart();
  buildDemoChart();
  buildCompareChart();
});

document.getElementById('slider-B').addEventListener('input', function () {
  B = parseFloat(this.value);
  document.getElementById('val-B').textContent = B;
  buildMainChart();
  buildDemoChart();
  buildCompareChart();
  updateDemoReadout();
});

document.getElementById('slider-nJ').addEventListener('input', function () {
  nJ = parseInt(this.value);
  document.getElementById('val-nJ').textContent = nJ;
  buildMainChart();
});

document.getElementById('slider-Jmin').addEventListener('input', function () {
  Jmin = parseFloat(this.value);
  document.getElementById('val-Jmin').textContent = Jmin.toFixed(1);
  if (Jmin >= Jmax) { Jmax = Jmin + 1; document.getElementById('slider-Jmax').value = Jmax; document.getElementById('val-Jmax').textContent = Jmax; }
  buildMainChart();
  buildCompareChart();
});

document.getElementById('slider-Jmax').addEventListener('input', function () {
  Jmax = parseFloat(this.value);
  document.getElementById('val-Jmax').textContent = Jmax;
  if (Jmax <= Jmin) { Jmin = Math.max(0, Jmax - 1); document.getElementById('slider-Jmin').value = Jmin; document.getElementById('val-Jmin').textContent = Jmin.toFixed(1); }
  buildMainChart();
  buildCompareChart();
});

document.getElementById('slider-K').addEventListener('input', function () {
  K_demo = parseFloat(this.value);
  document.getElementById('val-K').textContent = K_demo.toFixed(1);
  updateDemoReadout();
  buildDemoChart();
});

document.getElementById('slider-J-demo').addEventListener('input', function () {
  J_demo = parseFloat(this.value);
  document.getElementById('val-J-demo').textContent = J_demo.toFixed(1);
  updateDemoReadout();
  buildDemoChart();
  document.getElementById('double-J-msg').textContent = '';
});

// ── Double-J button ───────────────────────────────────────────────────────────
document.getElementById('btn-double-J').addEventListener('click', function () {
  const J_old = J_demo;
  const J_new = Math.min(J_old * 2 + 1, 50);  // avoid J=0 edge case
  const S = Math.log((A + J_old) / (A + J_new));
  J_demo = J_new;
  document.getElementById('slider-J-demo').value = J_new;
  document.getElementById('val-J-demo').textContent = J_new.toFixed(1);
  document.getElementById('double-J-msg').textContent =
    'J: ' + J_old.toFixed(1) + ' → ' + J_new.toFixed(1) + '  |  이동량 S = ' + S.toFixed(3) + ' (로그 단위)';
  updateDemoReadout();
  buildDemoChart();
});
