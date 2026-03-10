// ============================================================
// fig2_28.js -- Weber Law & Adaptation Level (Grossberg Ch.2)
//
// Full shunting equilibrium:
//   dx_i/dt = -Ax_i + (B - x_i)I_i - (x_i + C) * sum_{k!=i} I_k
//
// At equilibrium:
//   x_i* = [(B+C)*I / (A+I)] * [theta_i - C/(B+C)]
//
// where I = total input, theta_i = I_i / I (reflectance)
// ============================================================

// -- Log-scale slider for total input I --
function sliderToI(v) {
  // 0 -> 0.001, 500 -> 1, 1000 -> 1000
  return Math.pow(10, (v / 1000) * 6 - 3);
}

// -- Fixed reflectance pattern (5 cells) --
const THETAS = [0.70, 0.50, 0.30, 0.20, 0.10];
const N = THETAS.length;
const COLOR_POS = '#4a7fb5'; // blue = bright
const COLOR_NEG = '#c06058'; // red = dark
const CELL_COLORS = ['#4a7fb5', '#5a9a72', '#c49a3c', '#9b6bb5', '#bf6a42'];

// -- Parameters (mutable) --
let A = 1.0;
let B = 10.0;
let C = 5.0;
let totalI = sliderToI(400);

// -- Core equilibrium formula --
// x_i* = [(B+C)*I / (A+I)] * [theta_i - C/(B+C)]
function calcX(theta, I, a, b, c) {
  const weberG = (b + c) * I / (a + I);
  const adaptL = c / (b + c);
  return weberG * (theta - adaptL);
}

// Silent inhibition (C=0): x_i* = B*I*theta_i / (A+I)
function calcXSilent(theta, I, a, b) {
  return b * I * theta / (a + I);
}

function adaptationLevel(b, c) {
  return c / (b + c);
}

function weberGain(I, a, b, c) {
  return (b + c) * I / (a + I);
}

// -- KaTeX render --
document.addEventListener('DOMContentLoaded', () => {
  // Step 1: full ODE
  katex.render(
    String.raw`\frac{dx_i}{dt} = -A\,x_i + (B - x_i)\,I_i - (x_i + C)\!\sum_{k \neq i} I_k`,
    document.getElementById('eq-step1'), { displayMode: true, throwOnError: false }
  );

  // Step 2: equilibrium
  katex.render(
    String.raw`0 = -\!\left(A + I_i + \textstyle\sum_{k\neq i} I_k\right)x_i + B\,I_i - C\!\sum_{k\neq i} I_k`,
    document.getElementById('eq-step2'), { displayMode: true, throwOnError: false }
  );

  // Step 3: substituting I and theta
  katex.render(
    String.raw`0 = -(A+I)\,x_i + (B+C)\,I\!\left[\theta_i - \frac{C}{B+C}\right]`,
    document.getElementById('eq-step3'), { displayMode: true, throwOnError: false }
  );

  // Step 4: final result (highlighted)
  katex.render(
    String.raw`x_i^* = \underbrace{\frac{(B+C)\,I}{A+I}}_{\text{Weber gain}} \cdot \left[\theta_i - \underbrace{\frac{C}{B+C}}_{\text{adapt. level}}\right]`,
    document.getElementById('eq-step4'), { displayMode: true, throwOnError: false }
  );

  // Factor cards
  katex.render(
    String.raw`\frac{(B+C)\,I}{A+I}`,
    document.getElementById('eq-factor-weber'), { displayMode: true, throwOnError: false }
  );
  katex.render(
    String.raw`\theta_i = \frac{I_i}{I}`,
    document.getElementById('eq-factor-theta'), { displayMode: true, throwOnError: false }
  );
  katex.render(
    String.raw`\frac{C}{B+C}`,
    document.getElementById('eq-factor-adapt'), { displayMode: true, throwOnError: false }
  );

  buildWeberCurve();
  buildIllumInvarianceSmall();
  updateAll();
  bindSliders();
});

// -- Main update (called on any param change) --
function updateAll() {
  updatePhaseLabel();
  updateMainChart();
  updateComparisonCharts();
  updateIllumInteractive();
}

// -- Phase indicator --
function updatePhaseLabel() {
  const al = adaptationLevel(B, C);
  const gain = weberGain(totalI, A, B, C);
  const el = document.getElementById('phase-label');
  el.innerHTML =
    '<span class="phase-val">적응 수준 C/(B+C) = ' + al.toFixed(4) + '</span> &mdash; ' +
    'Weber 이득 = ' + gain.toFixed(3) + ' &mdash; ' +
    'theta_i가 ' + al.toFixed(3) + '보다 크면 밝다(+), 작으면 어둡다(-)';
}

// -- Main bar chart: x_i* for each cell --
function updateMainChart() {
  const al = adaptationLevel(B, C);
  const xs = THETAS.map(th => calcX(th, totalI, A, B, C));
  const labels = THETAS.map((th, i) => 'cell ' + (i+1) + ' (th=' + th.toFixed(2) + ')');
  const colors = xs.map(x => x >= 0 ? COLOR_POS : COLOR_NEG);

  const barTrace = {
    x: labels,
    y: xs,
    type: 'bar',
    marker: { color: colors, opacity: 0.85 },
    name: 'x_i*',
    hovertemplate: 'x_i* = %{y:.4f}<extra></extra>'
  };

  const maxAbs = Math.max(...xs.map(Math.abs), 0.01);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 56, r: 16, t: 16, b: 48 },
    xaxis: { gridcolor: '#eae6e0' },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#9b9590',
      zerolinewidth: 2,
      range: [-maxAbs * 1.3, maxAbs * 1.3]
    },
    showlegend: false,
    shapes: [
      {
        type: 'line', x0: -0.5, x1: N - 0.5, y0: 0, y1: 0,
        line: { color: '#bf6a42', width: 2, dash: 'dash' }
      }
    ],
    annotations: [
      {
        x: N - 1, y: maxAbs * 1.1, xanchor: 'right',
        text: 'bright +', showarrow: false,
        font: { size: 10, color: COLOR_POS }
      },
      {
        x: N - 1, y: -maxAbs * 1.1, xanchor: 'right',
        text: 'dark -', showarrow: false,
        font: { size: 10, color: COLOR_NEG }
      },
      {
        x: 0, y: 0, xanchor: 'left', yanchor: 'bottom',
        text: 'adapt. level (theta = ' + al.toFixed(3) + ')',
        showarrow: false,
        font: { size: 9, color: '#bf6a42' }
      }
    ]
  };

  Plotly.react('plotly-main', [barTrace], layout, { responsive: true, displayModeBar: false });
}

// -- Comparison charts: silent (C=0) vs hyperpolarizing (C>0) --
function updateComparisonCharts() {
  const al = adaptationLevel(B, C);
  const labels = THETAS.map((th, i) => 'cell' + (i+1) + ' th=' + th.toFixed(2));

  // Silent: C=0
  const xsSilent = THETAS.map(th => calcXSilent(th, totalI, A, B));
  const maxSilent = Math.max(...xsSilent, 0.01);

  const silentTrace = {
    x: labels,
    y: xsSilent,
    type: 'bar',
    marker: { color: xsSilent.map(() => '#c0605899') },
    hovertemplate: '%{y:.4f}<extra></extra>'
  };

  const layoutSilent = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 10, family: 'system-ui' },
    margin: { l: 48, r: 8, t: 8, b: 48 },
    xaxis: { gridcolor: '#eae6e0', tickfont: { size: 9 } },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#9b9590',
      range: [0, maxSilent * 1.25]
    },
    showlegend: false,
    annotations: [{
      x: labels[Math.floor(N/2)], y: maxSilent * 1.1, xanchor: 'center',
      text: 'ALL >= 0 -- "dark" contrast not representable',
      showarrow: false, font: { size: 9, color: '#c06058' }
    }]
  };

  Plotly.react('plotly-silent', [silentTrace], layoutSilent, { responsive: true, displayModeBar: false });

  // Hyperpolarizing: current C
  const xsHyper = THETAS.map(th => calcX(th, totalI, A, B, C));
  const maxAbsHyper = Math.max(...xsHyper.map(Math.abs), 0.01);
  const colorsHyper = xsHyper.map(x => x >= 0 ? COLOR_POS + 'cc' : COLOR_NEG + 'cc');

  const hyperTrace = {
    x: labels,
    y: xsHyper,
    type: 'bar',
    marker: { color: colorsHyper },
    hovertemplate: '%{y:.4f}<extra></extra>'
  };

  const layoutHyper = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 10, family: 'system-ui' },
    margin: { l: 48, r: 8, t: 8, b: 48 },
    xaxis: { gridcolor: '#eae6e0', tickfont: { size: 9 } },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#bf6a42',
      zerolinewidth: 2,
      range: [-maxAbsHyper * 1.3, maxAbsHyper * 1.3]
    },
    showlegend: false,
    shapes: [{
      type: 'line', x0: -0.5, x1: N - 0.5, y0: 0, y1: 0,
      line: { color: '#bf6a42', width: 1.5, dash: 'dash' }
    }],
    annotations: [{
      x: labels[0], y: 0, xanchor: 'left', yanchor: 'bottom',
      text: 'AL = C/(B+C) = ' + al.toFixed(3),
      showarrow: false, font: { size: 9, color: '#bf6a42' }
    }]
  };

  Plotly.react('plotly-hyper', [hyperTrace], layoutHyper, { responsive: true, displayModeBar: false });

  // Insight text
  const nNeg = xsHyper.filter(x => x < 0).length;
  const insightEl = document.getElementById('cmp-insight');
  if (C === 0) {
    insightEl.innerHTML =
      'C = 0: 두 모델이 동일합니다. 모든 x_i* >= 0. "어두운" 셀을 표현할 수 없습니다. ' +
      'C 슬라이더를 올려보세요.';
  } else {
    insightEl.innerHTML =
      'C = ' + C.toFixed(1) + ': 적응 수준 = <strong>' + al.toFixed(4) + '</strong>. ' +
      'theta_i &lt; ' + al.toFixed(3) + '인 셀 <strong>' + nNeg + '개</strong>가 음수(어둡다)로 부호화됨. ' +
      '왼쪽(C=0)은 모두 양수여서 "어두운" 대비를 표현할 수 없다.';
  }
}

// -- Weber gain curve --
function buildWeberCurve() {
  updateWeberCurve();
}

function updateWeberCurve() {
  const Is = [];
  for (let e = -3; e <= 3; e += 0.03) Is.push(Math.pow(10, e));

  const traceMain = {
    x: Is,
    y: Is.map(I => weberGain(I, A, B, C)),
    mode: 'lines',
    name: 'C=' + C.toFixed(1) + ' (현재)',
    line: { color: '#5a9a72', width: 2.5 },
    hovertemplate: 'I=%{x:.3f} gain=%{y:.3f}<extra>현재</extra>'
  };

  const traceSilent = {
    x: Is,
    y: Is.map(I => B * I / (A + I)),
    mode: 'lines',
    name: 'C=0 (silent)',
    line: { color: '#c06058', width: 1.5, dash: 'dot' },
    hovertemplate: 'I=%{x:.3f} gain=%{y:.3f}<extra>C=0</extra>'
  };

  const satMain = B + C;
  const satSilent = B;

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 48 },
    xaxis: { title: 'Total Input I', type: 'log', gridcolor: '#eae6e0', zeroline: false, range: [-3, 3] },
    yaxis: { title: 'Weber Gain', gridcolor: '#eae6e0', rangemode: 'tozero' },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } },
    shapes: [
      {
        type: 'line', x0: -3, x1: 3, y0: satMain, y1: satMain,
        line: { color: '#5a9a7244', width: 1, dash: 'dash' }
      },
      {
        type: 'line', x0: -3, x1: 3, y0: satSilent, y1: satSilent,
        line: { color: '#c0605844', width: 1, dash: 'dash' }
      }
    ],
    annotations: [
      { x: 3, y: satMain, xanchor: 'right', yanchor: 'bottom',
        text: 'B+C=' + satMain.toFixed(1), showarrow: false, font: { size: 9, color: '#5a9a72' } },
      { x: 3, y: satSilent, xanchor: 'right', yanchor: 'top',
        text: 'B=' + satSilent.toFixed(1), showarrow: false, font: { size: 9, color: '#c06058' } }
    ]
  };

  Plotly.react('plotly-weber', [traceMain, traceSilent], layout, { responsive: true, displayModeBar: false });
}

// -- Illumination invariance chart: x_i* vs I for each cell (shows sign preserved across I) --
function buildIllumInvarianceSmall() {
  updateIllumInvarianceSmall();
}

function updateIllumInvarianceSmall() {
  const Is = [];
  for (let e = -2; e <= 3; e += 0.05) Is.push(Math.pow(10, e));

  const traces = THETAS.map((th, i) => ({
    x: Is,
    y: Is.map(I => calcX(th, I, A, B, C)),
    mode: 'lines',
    name: 'th=' + th.toFixed(2),
    line: { color: CELL_COLORS[i], width: 2 },
    hovertemplate: 'I=%{x:.3f} x_i*=%{y:.4f}<extra>th=' + th.toFixed(2) + '</extra>'
  }));

  traces.push({
    x: [Is[0], Is[Is.length - 1]],
    y: [0, 0],
    mode: 'lines',
    name: 'adaptation level',
    line: { color: '#bf6a42', width: 1.5, dash: 'dash' },
    hoverinfo: 'skip'
  });

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 52, r: 16, t: 8, b: 48 },
    xaxis: { title: 'Total Input I', type: 'log', gridcolor: '#eae6e0', zeroline: false },
    yaxis: { title: 'x_i*', gridcolor: '#eae6e0', zeroline: true, zerolinecolor: '#bf6a4244' },
    showlegend: true,
    legend: { x: 0.01, y: 0.99, font: { size: 9 } }
  };

  Plotly.react('plotly-illum', traces, layout, { responsive: true, displayModeBar: false });
}

// -- Interactive illumination invariance (multiplier slider) --
function updateIllumInteractive() {
  const multSlider = document.getElementById('slider-illum');
  if (!multSlider) return;
  const mult = parseFloat(multSlider.value);
  document.getElementById('val-illum').textContent = mult + 'x';

  const labels = THETAS.map((th, i) => 'cell' + (i+1) + ' th=' + th.toFixed(2));

  const xsBase   = THETAS.map(th => calcX(th, totalI,        A, B, C));
  const xsScaled = THETAS.map(th => calcX(th, totalI * mult, A, B, C));

  const traceBase = {
    x: labels,
    y: xsBase,
    type: 'bar',
    name: 'I = ' + totalI.toFixed(2) + ' (base)',
    marker: { color: CELL_COLORS, opacity: 0.5 },
    hovertemplate: 'base %{y:.4f}<extra></extra>'
  };

  const traceScaled = {
    x: labels,
    y: xsScaled,
    type: 'bar',
    name: 'I x ' + mult + ' = ' + (totalI * mult).toFixed(1),
    marker: { color: CELL_COLORS, opacity: 0.9 },
    hovertemplate: 'x' + mult + ' %{y:.4f}<extra></extra>'
  };

  const maxAbs = Math.max(...xsBase.map(Math.abs), ...xsScaled.map(Math.abs), 0.01);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 56, r: 16, t: 8, b: 48 },
    xaxis: { gridcolor: '#eae6e0' },
    yaxis: {
      title: 'x_i*',
      gridcolor: '#eae6e0',
      zeroline: true,
      zerolinecolor: '#bf6a42',
      zerolinewidth: 1.5,
      range: [-maxAbs * 1.3, maxAbs * 1.3]
    },
    barmode: 'group',
    showlegend: true,
    legend: { x: 0.01, y: 0.99, font: { size: 10 } },
    shapes: [{
      type: 'line', x0: -0.5, x1: N - 0.5, y0: 0, y1: 0,
      line: { color: '#bf6a42', width: 1.5, dash: 'dash' }
    }]
  };

  Plotly.react('plotly-illum2', [traceBase, traceScaled], layout, { responsive: true, displayModeBar: false });

  // Insight: check sign pattern preserved
  const signsBase   = xsBase.map(x => Math.sign(x));
  const signsScaled = xsScaled.map(x => Math.sign(x));
  const signsMatch  = signsBase.every((s, i) => s === signsScaled[i]);
  const gainBase    = weberGain(totalI,        A, B, C).toFixed(3);
  const gainScaled  = weberGain(totalI * mult, A, B, C).toFixed(3);

  const insightEl = document.getElementById('illum-insight');
  insightEl.innerHTML =
    '기준 Weber 이득: <strong>' + gainBase + '</strong> -&gt; x' + mult + ' 후 이득: <strong>' + gainScaled + '</strong>. ' +
    (signsMatch
      ? '패턴의 부호(밝다/어둡다)가 <strong style="color:var(--green)">완벽히 보존</strong>됩니다. ' +
        'theta_i는 불변이므로 theta_i - C/(B+C)의 부호가 바뀌지 않는다.'
      : '[WARN] 일부 셀의 부호가 바뀌었습니다 -- 극단적으로 낮은 I에서 A의 기여로 패턴이 달라질 수 있습니다.'
    );
}

// -- Bind sliders --
function bindSliders() {
  document.getElementById('slider-A').addEventListener('input', function () {
    A = parseFloat(this.value);
    document.getElementById('val-A').textContent = A.toFixed(1);
    updateAll();
    updateWeberCurve();
    updateIllumInvarianceSmall();
  });

  document.getElementById('slider-B').addEventListener('input', function () {
    B = parseFloat(this.value);
    document.getElementById('val-B').textContent = B;
    updateAll();
    updateWeberCurve();
    updateIllumInvarianceSmall();
  });

  document.getElementById('slider-C').addEventListener('input', function () {
    C = parseFloat(this.value);
    document.getElementById('val-C').textContent = C.toFixed(1);
    updateAll();
    updateWeberCurve();
    updateIllumInvarianceSmall();
  });

  document.getElementById('slider-I').addEventListener('input', function () {
    totalI = sliderToI(parseFloat(this.value));
    const dispI = totalI < 0.1
      ? totalI.toExponential(2)
      : totalI < 10
        ? totalI.toFixed(2)
        : totalI.toFixed(1);
    document.getElementById('val-I').textContent = dispI;
    updateAll();
  });

  document.getElementById('slider-illum').addEventListener('input', function () {
    updateIllumInteractive();
  });
}
