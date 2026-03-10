<script>
// -- Log scale slider --
function sliderToI(v) {
  // 0 -> 0.001, 500 -> 1, 1000 -> 1000
  return Math.pow(10, (v / 1000) * 6 - 3);
}

// -- Parameters --
const thetas = [0.40, 0.30, 0.20, 0.10];
const colors = ['#c06058','#c49a3c','#5a9a72','#4a7fb5'];
const n = thetas.length;

let B = 10, A = 1, totalI = sliderToI(300);

// -- KaTeX render --
document.addEventListener('DOMContentLoaded', () => {
  katex.render(
    String.raw`x_i = \frac{B\,\theta_i\, I}{A + \theta_i\, I} \;\xrightarrow{I\to\infty}\; B`,
    document.getElementById('eq-no-int'), { displayMode: true }
  );
  katex.render(
    String.raw`x_i = \frac{B\,\theta_i\, I}{A + I} \;\xrightarrow{I\to\infty}\; B\theta_i`,
    document.getElementById('eq-on-center'), { displayMode: true }
  );
  initBars();
  initRatioBars();
  buildCurves();
  updateBars();
  updateRatios();
  updatePhaseLabel();
  p19UpdateCrossDemo();
});

// -- Plotly curves --
function eqNoInt(theta, I) { return (B * theta * I) / (A + theta * I); }
function eqOnCenter(theta, I) { return (B * theta * I) / (A + I); }

function buildCurves() {
  const Is = [];
  for (let e = -3; e <= 3; e += 0.02) Is.push(Math.pow(10, e));

  const tracesL = [], tracesR = [];
  for (let c = 0; c < n; c++) {
    tracesL.push({
      x: Is, y: Is.map(I => eqNoInt(thetas[c], I)),
      mode: 'lines', name: 'theta=' + thetas[c],
      line: { color: colors[c], width: 2.5 }
    });
    tracesR.push({
      x: Is, y: Is.map(I => eqOnCenter(thetas[c], I)),
      mode: 'lines', name: 'theta=' + thetas[c],
      line: { color: colors[c], width: 2.5 }
    });
  }

  const vLine = {
    type: 'line', x0: Math.log10(Math.max(totalI, 0.001)), x1: Math.log10(Math.max(totalI, 0.001)), y0: 0, y1: B * 1.1,
    line: { color: '#bf6a4266', width: 2, dash: 'dot' }
  };
  const hLine = {
    type: 'line', x0: -3, x1: 3, y0: B, y1: B,
    line: { color: '#c0605833', width: 1, dash: 'dash' }
  };

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Total Input I', type: 'log', gridcolor: '#eae6e0', range: [-3, 3], zeroline: false },
    yaxis: { title: 'x_i', gridcolor: '#eae6e0', range: [0, B * 1.15], zeroline: false },
    showlegend: false,
    shapes: [vLine, hLine]
  };

  Plotly.react('plotly-left', tracesL, layout, { responsive: true, displayModeBar: false });
  Plotly.react('plotly-right', tracesR, layout, { responsive: true, displayModeBar: false });
}

// -- Bar visualization --
function initBars() {
  const barH = 100;
  ['bars-input', 'bars-no-int', 'bars-on-center'].forEach((id, secIdx) => {
    const container = document.getElementById(id);
    // Keep existing limit lines
    const existing = container.querySelector('.bar-limit');

    for (let i = 0; i < n; i++) {
      const col = document.createElement('div');
      col.className = 'bar-col';

      const fill = document.createElement('div');
      fill.className = 'bar-fill';
      fill.id = id + '-fill-' + i;
      fill.style.background = colors[i];
      fill.style.height = '0px';

      const val = document.createElement('div');
      val.className = 'bar-val';
      val.id = id + '-val-' + i;
      val.textContent = '0';

      col.appendChild(fill);
      col.appendChild(val);
      container.appendChild(col);
    }
  });
}

function updateBars() {
  const maxH = 100;

  for (let i = 0; i < n; i++) {
    // Input pattern
    const inputH = (thetas[i] / 0.5) * maxH;
    document.getElementById('bars-input-fill-' + i).style.height = inputH + 'px';
    document.getElementById('bars-input-val-' + i).textContent = thetas[i].toFixed(2);

    // No interaction equilibrium
    const valNo = eqNoInt(thetas[i], totalI);
    const hNo = (valNo / (B * 1.1)) * maxH;
    document.getElementById('bars-no-int-fill-' + i).style.height = hNo + 'px';
    document.getElementById('bars-no-int-val-' + i).textContent = valNo.toFixed(1);

    // On-center equilibrium
    const valOc = eqOnCenter(thetas[i], totalI);
    const hOc = (valOc / (B * 1.1)) * maxH;
    document.getElementById('bars-on-center-fill-' + i).style.height = hOc + 'px';
    document.getElementById('bars-on-center-val-' + i).textContent = valOc.toFixed(1);
  }

  // Update B limit lines
  const limitY = (B / (B * 1.1)) * maxH;
  const limitNo = document.getElementById('limit-no');
  const limitOc = document.getElementById('limit-oc');
  if (limitNo) limitNo.style.bottom = (20 + limitY) + 'px';
  if (limitOc) limitOc.style.bottom = (20 + limitY) + 'px';
}

// -- Ratio bars --
function initRatioBars() {
  ['ratio-input', 'ratio-no-int', 'ratio-on-center'].forEach(id => {
    const container = document.getElementById(id);
    for (let i = 0; i < n; i++) {
      const col = document.createElement('div');
      col.className = 'ratio-bar-col';

      const fill = document.createElement('div');
      fill.className = 'ratio-bar-fill';
      fill.id = id + '-fill-' + i;
      fill.style.background = colors[i];
      fill.style.height = '0px';

      const pct = document.createElement('div');
      pct.className = 'ratio-bar-pct';
      pct.id = id + '-pct-' + i;
      pct.textContent = '';

      col.appendChild(fill);
      col.appendChild(pct);
      container.appendChild(col);
    }
  });
}

function updateRatios() {
  const maxH = 90;
  const inputMax = Math.max(...thetas);

  // Compute values
  const valsNo = thetas.map(th => eqNoInt(th, totalI));
  const valsOc = thetas.map(th => eqOnCenter(th, totalI));
  const maxNo = Math.max(...valsNo);
  const maxOc = Math.max(...valsOc);

  // Normalized ratios (max = 1.0)
  const ratioInput = thetas.map(th => th / inputMax);
  const ratioNo = maxNo > 0 ? valsNo.map(v => v / maxNo) : valsNo.map(() => 0);
  const ratioOc = maxOc > 0 ? valsOc.map(v => v / maxOc) : valsOc.map(() => 0);

  // Update bars
  function setRatioBars(prefix, ratios) {
    for (let i = 0; i < n; i++) {
      document.getElementById(prefix + '-fill-' + i).style.height = (ratios[i] * maxH) + 'px';
      document.getElementById(prefix + '-pct-' + i).textContent = (ratios[i] * 100).toFixed(0) + '%';
    }
  }
  setRatioBars('ratio-input', ratioInput);
  setRatioBars('ratio-no-int', ratioNo);
  setRatioBars('ratio-on-center', ratioOc);

  // Ratio text (relative to max, as integer proportions)
  function toRatioStr(ratios) {
    const min = Math.min(...ratios.filter(r => r > 0.01));
    if (min <= 0) return '? : ? : ? : ?';
    const scaled = ratios.map(r => r / min);
    // Use integers if close enough, otherwise 1 decimal
    const allInt = scaled.every(s => Math.abs(s - Math.round(s)) < 0.15);
    return scaled.map(s => allInt ? Math.round(s) : s.toFixed(1)).join(':');
  }
  document.getElementById('ratio-no-text').textContent = toRatioStr(ratioNo);
  document.getElementById('ratio-oc-text').textContent = toRatioStr(ratioOc);

  // Cosine similarity between input ratios and output ratios
  function cosSim(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; magA += a[i]*a[i]; magB += b[i]*b[i]; }
    return (magA > 0 && magB > 0) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }
  const simNo = cosSim(ratioInput, ratioNo);
  const simOc = cosSim(ratioInput, ratioOc);

  const verdict = document.getElementById('ratio-verdict');
  if (totalI < 3) {
    verdict.className = 'ratio-verdict neutral';
    verdict.innerHTML = 'I가 낮아 두 모델 모두 입력 패턴과 유사합니다. I를 높여보세요.';
  } else {
    const pctNo = (simNo * 100).toFixed(1);
    const pctOc = (simOc * 100).toFixed(1);
    verdict.className = 'ratio-verdict bad';
    verdict.innerHTML =
      'No Interaction: 입력 패턴과 유사도 <strong>' + pctNo + '%</strong> — 비율이 무너지고 있습니다!<br>' +
      'On-center: 입력 패턴과 유사도 <strong>' + pctOc + '%</strong> — 비율이 보존됩니다.';
  }
}

// -- Phase label --
function updatePhaseLabel() {
  const el = document.getElementById('phase-label');
  let msg;
  if (totalI < 5) msg = 'Low input: both models similar';
  else if (totalI < 30) msg = 'Medium input: no-interaction saturating...';
  else msg = 'High input: no-interaction ALL at B, on-center preserves ratios!';
  el.innerHTML = '<span class="phase-val">I = ' + totalI.toFixed(1) + '</span> &mdash; ' + msg;
}

// -- Slider bindings --
const sliderI = document.getElementById('slider-I');
const sliderB = document.getElementById('slider-B');
const sliderA = document.getElementById('slider-A');

function onSliderChange() {
  totalI = sliderToI(parseFloat(sliderI.value));
  B = parseFloat(sliderB.value);
  A = parseFloat(sliderA.value);

  document.getElementById('val-I').textContent = totalI < 0.1 ? totalI.toExponential(1) : totalI < 10 ? totalI.toFixed(2) : totalI.toFixed(1);
  document.getElementById('val-B').textContent = B;
  document.getElementById('val-A').textContent = A.toFixed(1);

  updatePhaseLabel();
  buildCurves();
  updateBars();
  updateRatios();
  p19UpdateCrossDemo();
}

sliderI.addEventListener('input', onSliderChange);
sliderB.addEventListener('input', onSliderChange);
sliderA.addEventListener('input', onSliderChange);

// -- Cross Pattern Demo (p19) --
const p19CrossPattern = [
  0, 0, 0.625, 0, 0,
  0, 0, 0.625, 0, 0,
  0.375, 0.375, 1.0, 0.375, 0.375,
  0, 0, 0.625, 0, 0,
  0, 0, 0.625, 0, 0,
];
const p19TotalZ = p19CrossPattern.reduce((s, v) => s + v, 0);
const p19Theta = p19CrossPattern.map(v => v / p19TotalZ);

function renderP19Grid(containerId, values, maxVal, br, bg, bb) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'p11-cell';
    const t = maxVal > 0 ? Math.min(values[i] / maxVal, 1) : 0;
    const r = Math.round(240 + (br - 240) * t);
    const g = Math.round(236 + (bg - 236) * t);
    const b = Math.round(232 + (bb - 232) * t);
    cell.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    if (values[i] > 0.01) cell.textContent = values[i].toFixed(2);
    container.appendChild(cell);
  }
}

function p19UpdateCrossDemo() {
  const mag = parseFloat(document.getElementById('p19-cross-mag').value);
  const curB = parseFloat(document.getElementById('slider-B').value);
  const curA = parseFloat(document.getElementById('slider-A').value);
  const I_total = mag * p19TotalZ;

  document.getElementById('p19-cross-mag-val').textContent = mag.toFixed(1);

  // Input pattern
  const inputVals = p19CrossPattern.map(z => mag * z);
  const inputMax = Math.max(...inputVals);

  // Additive (no interaction): x_j = B * theta_j * I / (A + theta_j * I)
  const addVals = p19Theta.map(th => {
    const thI = th * I_total;
    return curB * thI / (curA + thI);
  });

  // Shunting: x_j = B * theta_j * I / (A + I)
  const shuntVals = p19Theta.map(th => curB * th * I_total / (curA + I_total));

  // Render grids: blue=74,127,181 | red=192,96,88 | green=90,154,114
  renderP19Grid('p19-grid-input',    inputVals, inputMax,  74, 127, 181);
  renderP19Grid('p19-grid-additive', addVals,   Math.max.apply(null, addVals) || 1,   192,  96,  88);
  renderP19Grid('p19-grid-shunting', shuntVals, Math.max.apply(null, shuntVals) || 1,  90, 154, 114);

  // Range info
  const addMax = Math.max(...addVals);
  const addActiveMin = Math.min(...addVals.filter(v => v > 0.001));
  const shuntMax = Math.max(...shuntVals);
  const shuntActiveMin = Math.min(...shuntVals.filter(v => v > 0.001));
  const addMin = isFinite(addActiveMin) ? addActiveMin : 0;
  const shuntMin = isFinite(shuntActiveMin) ? shuntActiveMin : 0;

  document.getElementById('p19-input-range').textContent = 'range: 0 ~ ' + inputMax.toFixed(2);
  document.getElementById('p19-add-range').textContent = 'x range: ' + addMin.toFixed(2) + ' ~ ' + addMax.toFixed(2) + ' (B=' + curB + ')';
  document.getElementById('p19-shunt-range').textContent = 'x range: ' + shuntMin.toFixed(2) + ' ~ ' + shuntMax.toFixed(2) + ' (B=' + curB + ')';

  // Cosine similarity for ratio preservation
  const activeIdx = p19CrossPattern.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0);

  function cosineSim(a, b, indices) {
    let dot = 0, magA = 0, magB = 0;
    for (const i of indices) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return (magA > 0 && magB > 0) ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }

  const addSim = cosineSim(p19CrossPattern, addVals, activeIdx);
  const shuntSim = cosineSim(p19CrossPattern, shuntVals, activeIdx);

  document.getElementById('p19-add-preserve-bar').style.width = (addSim * 100) + '%';
  document.getElementById('p19-add-preserve-text').textContent = '코사인 유사도: ' + addSim.toFixed(4) + (addSim < 0.99 ? ' -- 비율 왜곡!' : ' -- 보존');
  document.getElementById('p19-shunt-preserve-bar').style.width = (shuntSim * 100) + '%';
  document.getElementById('p19-shunt-preserve-text').textContent = '코사인 유사도: ' + shuntSim.toFixed(4) + (shuntSim > 0.999 ? ' -- 완벽 보존!' : ' -- 보존');

  // Ratio display
  const activeVals = p19CrossPattern.filter(v => v > 0);
  const origRatio = activeVals.length > 0 ? (Math.max(...activeVals) / Math.min(...activeVals)).toFixed(2) : '?';
  if (addMin > 0) {
    document.getElementById('p19-add-ratio').innerHTML = '<span style="color:#c06058">max/min = ' + (addMax / addMin).toFixed(2) + '</span> (원래: ' + origRatio + ')';
  } else {
    document.getElementById('p19-add-ratio').textContent = '';
  }
  if (shuntMin > 0) {
    document.getElementById('p19-shunt-ratio').innerHTML = '<span style="color:#5a9a72">max/min = ' + (shuntMax / shuntMin).toFixed(2) + '</span> (원래: ' + origRatio + ')';
  } else {
    document.getElementById('p19-shunt-ratio').textContent = '';
  }

  // Insight
  let insight = '';
  if (mag < 5) {
    insight = '낮은 입력: 두 모형 모두 비슷하게 반응한다. 아직 포화가 시작되지 않음.';
  } else if (addSim < 0.995) {
    insight = '<strong style="color:#c06058">가산 모형의 비율 왜곡 발생!</strong> ' +
      '큰 값(z=1.0)과 작은 값(z=0.375) 모두 B=' + curB + '에 가까워져 구분이 사라진다. ' +
      '<strong style="color:#5a9a72">션팅 모형</strong>은 B\u00B7\u03B8\u2C7C로 수렴하여 비율이 정확히 보존된다.' +
      '<br>이것이 <strong>shunting inhibition</strong>의 핵심: 입력 크기에 무관하게 패턴의 <strong>상대적 비율</strong>을 보존.';
  } else {
    insight = '두 모형 모두 아직 비율을 잘 보존 중. magnitude를 더 높여보세요.';
  }
  document.getElementById('p19-cross-insight').innerHTML = insight;
}

document.getElementById('p19-cross-mag').addEventListener('input', p19UpdateCrossDemo);

// -- Page switching --
const pageTitles = {
  fig2_09: 'Figure 2.9-2.10: Additive vs Shunting Model',
  fig2_11: 'Figure 2.11: MTM & LTM Dynamics',
  fig2_19: 'Figure 2.19-2.23: Noise-Saturation Dilemma',
};
const pageInited = {};

function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.style.display = 'block';

  const nav = document.querySelector('.nav-item[data-page="' + pageId + '"]');
  if (nav) nav.classList.add('active');

  document.getElementById('page-title').textContent = pageTitles[pageId] || pageId;

  // Init page on first visit
  if (!pageInited[pageId]) {
    pageInited[pageId] = true;
    if (pageId === 'fig2_09') initPage09();
    if (pageId === 'fig2_11') initPage11();
  }

  // Persist last visited page
  try { localStorage.setItem('grossberg_page', pageId); } catch(e) {}
}

document.querySelectorAll('.nav-item:not(.disabled)').forEach(item => {
  item.addEventListener('click', () => switchPage(item.dataset.page));
});

// =============================================
// PAGE: Fig 2.9-2.10 Additive vs Shunting
// =============================================
function initPage09() {
  katex.render(String.raw`\frac{d}{dt}x_i = -Ax_i + I_i`, document.getElementById('eq-additive'), { displayMode: true });
  katex.render(String.raw`\frac{d}{dt}x_i = -Ax_i + (B - x_i)I_i`, document.getElementById('eq-shunting'), { displayMode: true });
  katex.render(String.raw`x_i`, document.getElementById('var-xi'), { displayMode: false });
  katex.render(String.raw`I_i`, document.getElementById('var-Ii'), { displayMode: false });
  katex.render(String.raw`A`, document.getElementById('var-A'), { displayMode: false });
  katex.render(String.raw`B`, document.getElementById('var-B'), { displayMode: false });
  katex.render(String.raw`x^* = \frac{I}{A} \;\;\text{(unbounded!)}`, document.getElementById('eq-add-eq'), { displayMode: true });
  katex.render(String.raw`x^* = \frac{BI}{A+I} \leq B`, document.getElementById('eq-shunt-eq'), { displayMode: true });

  // SVG additive network diagram labels
  katex.render(String.raw`x_1(t)`, document.getElementById('ad-svglbl-n1'), { displayMode: false });
  katex.render(String.raw`x_2(t)`, document.getElementById('ad-svglbl-n2'), { displayMode: false });
  katex.render(String.raw`x_3(t)`, document.getElementById('ad-svglbl-n3'), { displayMode: false });
  katex.render(String.raw`x_n(t)`, document.getElementById('ad-svglbl-nn'), { displayMode: false });
  katex.render(String.raw`f_1(x_1)`, document.getElementById('ad-svglbl-f1'), { displayMode: false });
  katex.render(String.raw`f_2(x_2)`, document.getElementById('ad-svglbl-f2'), { displayMode: false });
  katex.render(String.raw`f_3(x_3)`, document.getElementById('ad-svglbl-f3'), { displayMode: false });
  katex.render(String.raw`B_{1i}\,z_{1i}{=}0.8`, document.getElementById('ad-svglbl-z1'), { displayMode: false });
  katex.render(String.raw`B_{2i}\,z_{2i}{=}0.5`, document.getElementById('ad-svglbl-z2'), { displayMode: false });
  katex.render(String.raw`B_{3i}\,z_{3i}{=}0.2`, document.getElementById('ad-svglbl-z3'), { displayMode: false });
  katex.render(String.raw`I_i`, document.getElementById('ad-svglbl-Ii'), { displayMode: false });
  katex.render(String.raw`g_1(x_1)`, document.getElementById('ad-svglbl-g1'), { displayMode: false });
  katex.render(String.raw`g_2(x_2)`, document.getElementById('ad-svglbl-g2'), { displayMode: false });
  katex.render(String.raw`g_3(x_3)`, document.getElementById('ad-svglbl-g3'), { displayMode: false });
  katex.render(String.raw`C_{1i}\,Z_{1i}{=}0.2`, document.getElementById('ad-svglbl-Z1'), { displayMode: false });
  katex.render(String.raw`C_{2i}\,Z_{2i}{=}0.6`, document.getElementById('ad-svglbl-Z2'), { displayMode: false });
  katex.render(String.raw`C_{3i}\,Z_{3i}{=}0.9`, document.getElementById('ad-svglbl-Z3'), { displayMode: false });
  katex.render(String.raw`x_i(t)`, document.getElementById('ad-svglbl-ni'), { displayMode: false });
  document.getElementById('ad-svglbl-ni').style.color = '#888';
  katex.render(String.raw`{-}Ax_i`, document.getElementById('ad-svglbl-decay'), { displayMode: false });
  document.getElementById('ad-svglbl-decay').style.color = '#c06058';

  // SVG shunting network diagram labels
  katex.render(String.raw`x_1(t)`, document.getElementById('sh-svglbl-n1'), { displayMode: false });
  katex.render(String.raw`x_2(t)`, document.getElementById('sh-svglbl-n2'), { displayMode: false });
  katex.render(String.raw`x_3(t)`, document.getElementById('sh-svglbl-n3'), { displayMode: false });
  katex.render(String.raw`x_n(t)`, document.getElementById('sh-svglbl-nn'), { displayMode: false });
  katex.render(String.raw`f_1(x_1)`, document.getElementById('sh-svglbl-f1'), { displayMode: false });
  katex.render(String.raw`f_2(x_2)`, document.getElementById('sh-svglbl-f2'), { displayMode: false });
  katex.render(String.raw`f_3(x_3)`, document.getElementById('sh-svglbl-f3'), { displayMode: false });
  katex.render(String.raw`D_{1i}\,y_{1i}\,z_{1i}`, document.getElementById('sh-svglbl-z1'), { displayMode: false });
  katex.render(String.raw`D_{2i}\,y_{2i}\,z_{2i}`, document.getElementById('sh-svglbl-z2'), { displayMode: false });
  katex.render(String.raw`D_{3i}\,y_{3i}\,z_{3i}`, document.getElementById('sh-svglbl-z3'), { displayMode: false });
  katex.render(String.raw`I_i`, document.getElementById('sh-svglbl-Ii'), { displayMode: false });
  katex.render(String.raw`g_1(x_1)`, document.getElementById('sh-svglbl-g1'), { displayMode: false });
  katex.render(String.raw`g_2(x_2)`, document.getElementById('sh-svglbl-g2'), { displayMode: false });
  katex.render(String.raw`g_3(x_3)`, document.getElementById('sh-svglbl-g3'), { displayMode: false });
  katex.render(String.raw`G_{1i}\,Y_{1i}\,Z_{1i}`, document.getElementById('sh-svglbl-Z1'), { displayMode: false });
  katex.render(String.raw`G_{2i}\,Y_{2i}\,Z_{2i}`, document.getElementById('sh-svglbl-Z2'), { displayMode: false });
  katex.render(String.raw`G_{3i}\,Y_{3i}\,Z_{3i}`, document.getElementById('sh-svglbl-Z3'), { displayMode: false });
  katex.render(String.raw`J_i`, document.getElementById('sh-svglbl-Ji'), { displayMode: false });
  katex.render(String.raw`\dot{y}=\alpha(1{-}y)-\beta\,f(x_j)\,y`, document.getElementById('sh-svglbl-mtm-eq'), { displayMode: false });
  katex.render(String.raw`B{-}C_i x_i`, document.getElementById('sh-svglbl-exc-gate'), { displayMode: false });
  katex.render(String.raw`E_i x_i{+}F_i`, document.getElementById('sh-svglbl-inh-gate'), { displayMode: false });
  katex.render(String.raw`x_i(t)`, document.getElementById('sh-svglbl-ni'), { displayMode: false });
  document.getElementById('sh-svglbl-ni').style.color = '#888';
  katex.render(String.raw`{-}Ax_i`, document.getElementById('sh-svglbl-decay'), { displayMode: false });
  document.getElementById('sh-svglbl-decay').style.color = '#c06058';


  // Table variable cells + chip labels
  const ck = (id, tex) => katex.render(tex, document.getElementById(id), { displayMode: false });
  // Additive table
  ck('tv-add-A', String.raw`A_i`);
  ck('tv-add-B', String.raw`B_{ji}`);
  ck('tv-add-C', String.raw`C_{ji}`);
  ck('tv-add-z', String.raw`z_{ji}`);
  ck('tv-add-Z', String.raw`Z_{ji}`);
  ck('tv-add-f', String.raw`f_j(x_j)`);
  ck('tv-add-g', String.raw`g_j(x_j)`);
  ck('tv-add-I', String.raw`I_i`);
  // Shunting table
  ck('tv-sh-B',  String.raw`B_i`);
  ck('tv-sh-C',  String.raw`C_i`);
  ck('tv-sh-D',  String.raw`D_{ji}`);
  ck('tv-sh-E',  String.raw`E_i`);
  ck('tv-sh-F',  String.raw`F_i`);
  ck('tv-sh-G',  String.raw`G_{ji}`);
  ck('tv-sh-yY', String.raw`y_{ji},\,Y_{ji}`);
  ck('tv-sh-J',  String.raw`J_i`);
  ck('chip-ae-f', String.raw`f_j(x_j)`);
  ck('chip-ae-B', String.raw`B_{ji}`);
  ck('chip-ae-z', String.raw`z_{ji}`);
  ck('chip-ai-g', String.raw`g_j(x_j)`);
  ck('chip-ai-C', String.raw`C_{ji}`);
  ck('chip-ai-Z', String.raw`Z_{ji}`);
  ck('chip-sg-xi1', String.raw`x_i`);
  ck('chip-sg-Bi1', String.raw`B_i`);
  ck('chip-sg-xi2', String.raw`x_i`);
  ck('chip-sg-Bi2', String.raw`B_i`);
  ck('chip-se-f', String.raw`f_j(x_j)`);
  ck('chip-se-D', String.raw`D_{ji}`);
  ck('chip-se-y', String.raw`y_{ji}`);
  ck('chip-se-z', String.raw`z_{ji}`);
  ck('chip-si-g', String.raw`g_j(x_j)`);
  ck('chip-si-G', String.raw`G_{ji}`);
  ck('chip-si-Y', String.raw`Y_{ji}`);
  ck('chip-si-Z', String.raw`Z_{ji}`);
  ck('chip-si-EF', String.raw`E_i X_i + F_i`);

  // Term chunk breakdowns
  katex.render(String.raw`\displaystyle\sum_{j=1}^{n} f_j(x_j)\cdot B_{ji}\cdot z_{ji}`, document.getElementById('eq-add-chunk-exc'), { displayMode: false });
  katex.render(String.raw`\displaystyle\sum_{j=1}^{n} g_j(x_j)\cdot C_{ji}\cdot Z_{ji}`, document.getElementById('eq-add-chunk-inh'), { displayMode: false });
  katex.render(String.raw`(B_i - C_i\,x_i)`, document.getElementById('eq-shunt-gain-exc'), { displayMode: false });
  katex.render(String.raw`(E_i X_i + F_i)`, document.getElementById('eq-shunt-gain-inh'), { displayMode: false });
  ck('chip-sg-Bi3', String.raw`B_i`);
  katex.render(String.raw`\displaystyle\sum_{j=1}^{n} f_j(x_j)\cdot D_{ji}\cdot y_{ji}\cdot z_{ji}`, document.getElementById('eq-shunt-chunk-exc'), { displayMode: false });
  katex.render(String.raw`\displaystyle\sum_{j=1}^{n} g_j(x_j)\cdot G_{ji}\cdot Y_{ji}\cdot Z_{ji}`, document.getElementById('eq-shunt-chunk-inh'), { displayMode: false });

  // General forms — segmented for hover highlighting
  const rk = (id, tex) => { const el = document.getElementById(id); if (el) katex.render(tex, el, { displayMode: false }); };
  rk('eq-ad-lhs',     String.raw`\dfrac{d}{dt}x_i = -A_i x_i +`);
  rk('eq-ad-exc-sum', String.raw`\displaystyle\sum_{j=1}^{n} f_j(x_j)\,B_{ji}\,z_{ji}`);
  rk('eq-ad-sep',     String.raw`\;-\;`);
  rk('eq-ad-inh-sum', String.raw`\displaystyle\sum_{j=1}^{n} g_j(x_j)\,C_{ji}\,Z_{ji}`);
  rk('eq-ad-rhs',     String.raw`\;+\; I_i`);
  katex.render(
    String.raw`\frac{d}{dt}x_i = -A_i x_i + \textstyle\sum_j f_j(x_j)\,z_{ji} + I_i`,
    document.getElementById('eq-add-special'), { displayMode: true }
  );
  rk('eq-sh-lhs',      String.raw`\dfrac{d}{dt}x_i = -A_i x_i +`);
  rk('eq-sh-exc-gain', String.raw`(B_i - C_i\,x_i)`);
  rk('eq-sh-lbr1',     String.raw`\Bigl[`);
  rk('eq-sh-exc-sum',  String.raw`\displaystyle\sum_{j=1}^{n} f_j(x_j)\,D_{ji}\,y_{ji}\,z_{ji}`);
  rk('eq-sh-ext-i',    String.raw`+\,I_i\Bigr]`);
  rk('eq-sh-sep',      String.raw`\;-\;`);
  rk('eq-sh-inh-gain', String.raw`(E_i X_i + F_i)`);
  rk('eq-sh-lbr2',     String.raw`\Bigl[`);
  rk('eq-sh-inh-sum',  String.raw`\displaystyle\sum_{j=1}^{n} g_j(x_j)\,G_{ji}\,Y_{ji}\,Z_{ji}`);
  rk('eq-sh-ext-j',    String.raw`+\,J_i\Bigr]`);
  katex.render(
    String.raw`\frac{d}{dt}x_i = -A x_i + (B - x_i)\,I_i`,
    document.getElementById('eq-shunt-special2'), { displayMode: true }
  );
  katex.render(
    String.raw`x^* = \dfrac{B\,I_i}{A + I_i} \;\leq\; B`,
    document.getElementById('eq-shunt-equil'), { displayMode: false }
  );

  updatePage09();

  // === 3-Neuron Network Simulation ===
  katex.render(String.raw`\frac{dx_1}{dt} = -Ax_1 + (B - x_1)\,I_1 - x_1(x_2 + x_3)`,
    document.getElementById('p09-net-eq1'), { displayMode: true });
  katex.render(String.raw`\frac{dx_2}{dt} = -Ax_2 + (B - x_2)\,I_2 - x_2(x_1 + x_3)`,
    document.getElementById('p09-net-eq2'), { displayMode: true });
  katex.render(String.raw`\frac{dx_3}{dt} = -Ax_3 + (B - x_3)\,I_3 - x_3(x_1 + x_2)`,
    document.getElementById('p09-net-eq3'), { displayMode: true });

  const netColors = ['#c06058', '#c49a3c', '#4a7fb5'];
  const labels = ['x\u2081', 'x\u2082', 'x\u2083'];

  const netLayoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } }
  };

  // Real-time streaming state
  const netRt = {
    x: [0, 0, 0],        // current neuron activities
    ts: [],               // time history
    xs: [[], [], []],     // activity history per neuron
    t: 0,                 // current sim time
    timer: null,          // setInterval id
    running: false
  };

  function netReadParams() {
    const I1 = parseFloat(document.getElementById('p09-net-I1').value);
    const I2 = parseFloat(document.getElementById('p09-net-I2').value);
    const I3 = parseFloat(document.getElementById('p09-net-I3').value);
    const mag = parseFloat(document.getElementById('p09-net-mag').value);
    const A = parseFloat(document.getElementById('p09-slider-A').value);
    const B = parseFloat(document.getElementById('p09-slider-B').value);
    document.getElementById('p09-net-I1-val').textContent = I1.toFixed(1);
    document.getElementById('p09-net-I2-val').textContent = I2.toFixed(1);
    document.getElementById('p09-net-I3-val').textContent = I3.toFixed(1);
    document.getElementById('p09-net-mag-val').textContent = mag.toFixed(1);
    return { I1, I2, I3, mag, A, B, Is: [I1*mag, I2*mag, I3*mag] };
  }

  // One simulation step: advance by dt_sim, update chart
  function netStep() {
    const p = netReadParams();
    const Itotal = p.Is[0] + p.Is[1] + p.Is[2];
    const dt_sim = 0.05;  // simulation time per tick
    const subSteps = 10;
    const dtSub = dt_sim / subSteps;

    for (let ss = 0; ss < subSteps; ss++) {
      const dx = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        const xInh = netRt.x.reduce((s, v, j) => j !== i ? s + v : s, 0);
        dx[i] = -p.A * netRt.x[i] + (p.B - netRt.x[i]) * p.Is[i] - netRt.x[i] * xInh;
      }
      for (let i = 0; i < 3; i++) {
        netRt.x[i] += dx[i] * dtSub;
        netRt.x[i] = Math.max(0, Math.min(p.B, netRt.x[i]));
      }
    }

    netRt.t += dt_sim;
    netRt.ts.push(netRt.t);
    for (let i = 0; i < 3; i++) netRt.xs[i].push(netRt.x[i]);

    // Update time chart with streaming data
    const timeTraces = [];
    for (let i = 0; i < 3; i++) {
      timeTraces.push({
        x: netRt.ts.slice(), y: netRt.xs[i].slice(), mode: 'lines', name: labels[i],
        line: { color: netColors[i], width: 2.5 }
      });
    }
    // B upper bound line only
    timeTraces.push({
      x: [netRt.ts[0] || 0, netRt.t], y: [p.B, p.B], mode: 'lines', name: 'B',
      line: { color: '#9b959044', width: 1, dash: 'dash' }, showlegend: false
    });

    Plotly.react('p09-net-plot-time', timeTraces, {
      ...netLayoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [Math.max(0, netRt.t - 10), Math.max(netRt.t, 10)] },
      yaxis: { title: 'x (activity)', gridcolor: '#eae6e0', range: [0, p.B * 1.1], zeroline: false },
    }, { responsive: true, displayModeBar: false });

    // Update activity bars in real-time (current values, not equilibrium)
    for (let i = 0; i < 3; i++) {
      const pct = p.B > 0 ? (netRt.x[i] / p.B) * 100 : 0;
      document.getElementById('p09-net-bar' + (i + 1)).style.height = Math.min(100, pct) + '%';
      document.getElementById('p09-net-x' + (i + 1) + '-val').textContent = netRt.x[i].toFixed(3);
    }

    // Keep last 20 seconds of data to avoid memory growth
    const maxPoints = 400; // 20s / 0.05 dt
    if (netRt.ts.length > maxPoints) {
      const trim = netRt.ts.length - maxPoints;
      netRt.ts.splice(0, trim);
      for (let i = 0; i < 3; i++) netRt.xs[i].splice(0, trim);
    }
  }

  // Static charts: equilibrium curve + ratio + insight (instant on slider)
  function netUpdateStatic() {
    const p = netReadParams();
    const Itotal = p.Is[0] + p.Is[1] + p.Is[2];

    // --- Equilibrium x* vs magnitude chart (numerical) ---
    const magRange = [];
    for (let m = 0.1; m <= 100; m += 0.5) magRange.push(m);

    // Solve equilibrium numerically for each magnitude
    function solveEq(Is, A, B) {
      const x = [0, 0, 0];
      for (let iter = 0; iter < 2000; iter++) {
        const dt = 0.02;
        for (let i = 0; i < 3; i++) {
          const xInh = x.reduce((s, v, j) => j !== i ? s + v : s, 0);
          x[i] += (-A * x[i] + (B - x[i]) * Is[i] - x[i] * xInh) * dt;
          x[i] = Math.max(0, Math.min(B, x[i]));
        }
      }
      return x.slice();
    }

    const eqTraces = [];
    const eqData = [[], [], []];
    for (const m of magRange) {
      const eq = solveEq([p.I1 * m, p.I2 * m, p.I3 * m], p.A, p.B);
      for (let i = 0; i < 3; i++) eqData[i].push(eq[i]);
    }
    for (let i = 0; i < 3; i++) {
      eqTraces.push({
        x: magRange, y: eqData[i], mode: 'lines', name: labels[i] + '*',
        line: { color: netColors[i], width: 2.5 }
      });
    }
    eqTraces.push({
      x: [p.mag, p.mag], y: [0, p.B], mode: 'lines',
      line: { color: '#9b959066', width: 2, dash: 'dot' }, showlegend: false
    });
    eqTraces.push({
      x: [0.1, 100], y: [p.B, p.B], mode: 'lines', name: 'B',
      line: { color: '#9b959044', width: 1, dash: 'dash' }, showlegend: false
    });

    Plotly.react('p09-net-plot-eq', eqTraces, {
      ...netLayoutBase,
      xaxis: { title: 'Magnitude', gridcolor: '#eae6e0', zeroline: false, type: 'log', range: [Math.log10(0.1), Math.log10(100)] },
      yaxis: { title: 'x* (equilibrium)', gridcolor: '#eae6e0', range: [0, p.B * 1.1], zeroline: false },
    }, { responsive: true, displayModeBar: false });

    // --- Ratio display ---
    const eqVals = solveEq(p.Is, p.A, p.B);
    const minInput = Math.min(p.I1, p.I2, p.I3);
    const inputNorm = minInput > 0 ? [p.I1 / minInput, p.I2 / minInput, p.I3 / minInput] : [p.I1, p.I2, p.I3];
    document.getElementById('p09-net-input-ratio').textContent = inputNorm.map(v => v.toFixed(1)).join(' : ');

    const positiveEqVals = eqVals.filter(v => v > 0.001);
    const minEq = positiveEqVals.length > 0 ? Math.min(...positiveEqVals) : 0;
    if (minEq > 0) {
      const outNorm = eqVals.map(v => v / minEq);
      document.getElementById('p09-net-output-ratio').textContent = outNorm.map(v => v.toFixed(1)).join(' : ');
    } else {
      document.getElementById('p09-net-output-ratio').textContent = eqVals.map(v => v.toFixed(2)).join(' : ');
    }

    // --- Insight ---
    let insight = '';
    const maxEq = Math.max(...eqVals);
    const sumEq = eqVals.reduce((s, v) => s + v, 0);
    const domPct = sumEq > 0 ? (maxEq / sumEq) * 100 : 0;

    if (Itotal < 0.01) {
      insight = '입력이 없으면 모든 뉴런이 0으로 감쇠한다.';
    } else if (p.mag < 2) {
      insight = '<strong>낮은 입력</strong>: 모든 뉴런이 입력에 비례하여 활성화. ' +
        '경쟁이 약하므로 입력 비율 = 출력 비율 (비례 모드).';
    } else if (domPct > 70) {
      insight = '<strong style="color:#c06058">강한 경쟁!</strong> 가장 큰 입력(I\u2081)이 전체 활동의 ' +
        domPct.toFixed(0) + '%를 차지. ' +
        '입력 크기가 커질수록 <strong>승자 독식(winner-take-all)</strong>에 가까워진다.' +
        '<br>그러나 완전한 WTA는 아님 \u2014 션팅 모형에서 x\u1D62* = B\u00B7\u03B8\u1D62이므로 비율은 항상 보존된다.';
    } else {
      insight = '중간 경쟁: 강한 입력이 우세하지만 약한 입력도 여전히 활성. ' +
        'magnitude를 더 높여보세요.';
    }
    document.getElementById('p09-net-insight').innerHTML = insight;
  }

  // Start simulation from zero
  function netStart() {
    if (netRt.timer) clearInterval(netRt.timer);
    netRt.x = [0, 0, 0];
    netRt.ts = [0];
    netRt.xs = [[0], [0], [0]];
    netRt.t = 0;
    netRt.running = true;
    netRt.timer = setInterval(netStep, 80);
    netUpdateStatic();
  }

  // On slider change: keep current state, just update static charts
  function netOnSliderChange() {
    netUpdateStatic();
    // Extend sim time so animation keeps going from current state
    if (!netRt.running) {
      netRt.running = true;
      netRt.timer = setInterval(netStep, 80);
    }
  }

  ['p09-net-I1', 'p09-net-I2', 'p09-net-I3', 'p09-net-mag'].forEach(id => {
    document.getElementById(id).addEventListener('input', netOnSliderChange);
  });
  ['p09-slider-A', 'p09-slider-B'].forEach(id => {
    document.getElementById(id).addEventListener('input', netOnSliderChange);
  });

  netStart();

  setTimeout(() => { setupEqDragListener(); setupHoverSync(); initPage09rt(); }, 300);
}

let p09_showAdd = true, p09_showShunt = true;
let p09_sim = { ts: [], xAdd: [], xShunt: [], dxAdd: [], dxShunt: [] };
function toggleModel09(model) {
  if (model === 'add') {
    p09_showAdd = !p09_showAdd;
    document.getElementById('p09-toggle-add').classList.toggle('active', p09_showAdd);
  } else {
    p09_showShunt = !p09_showShunt;
    document.getElementById('p09-toggle-shunt').classList.toggle('active', p09_showShunt);
  }
  updatePage09();
}

function updatePage09() {
  const rawI = parseFloat(document.getElementById('p09-slider-I').value);
  const pI = Math.pow(10, (rawI / 1000) * 6 - 3);
  const pA = parseFloat(document.getElementById('p09-slider-A').value);
  const pB = parseFloat(document.getElementById('p09-slider-B').value);

  document.getElementById('p09-val-I').textContent = pI < 0.1 ? pI.toExponential(1) : pI < 10 ? pI.toFixed(2) : pI.toFixed(1);
  document.getElementById('p09-val-A').textContent = pA.toFixed(1);
  document.getElementById('p09-val-B').textContent = pB;

  // Time evolution (sub-stepping for numerical stability)
  const totalTime = 10, plotPoints = 200;
  const dtPlot = totalTime / plotPoints;
  const subSteps = Math.max(20, Math.ceil((pA + pI) * dtPlot * 5));
  const dtSub = dtPlot / subSteps;
  const ts = [], xAdd = [], xShunt = [], dxAdd = [], dxShunt = [];
  const compDecayA = [], compI_add = [], compDecayS = [], compBxI = [];
  let xa = 0, xs = 0;
  for (let s = 0; s <= plotPoints; s++) {
    ts.push(s * dtPlot);
    xAdd.push(xa);
    xShunt.push(xs);
    dxAdd.push(-pA * xa + pI);
    dxShunt.push(-pA * xs + (pB - xs) * pI);
    // Components
    compDecayA.push(-pA * xa);      // -Ax (additive decay)
    compI_add.push(pI);              // +I (additive input, constant)
    compDecayS.push(-pA * xs);       // -Ax (shunting decay)
    compBxI.push((pB - xs) * pI);    // (B-x)I (shunting input)
    for (let ss = 0; ss < subSteps; ss++) {
      xa += (-pA * xa + pI) * dtSub;
      xs += (-pA * xs + (pB - xs) * pI) * dtSub;
    }
  }

  p09_sim = { ts, xAdd, xShunt, dxAdd, dxShunt };

  const yMaxTime = Math.max(pI / pA * 1.1, pB * 1.3);
  const layoutTime = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
    yaxis: { title: 'x(t)', gridcolor: '#eae6e0', range: [0, yMaxTime], zeroline: false },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } },
    shapes: [
      { type: 'rect', x0: 0, x1: totalTime, y0: pB, y1: yMaxTime,
        fillcolor: 'rgba(160,160,160,0.10)', line: { width: 0 } },
      { type: 'line', x0: 0, x1: totalTime, y0: pB, y1: pB, line: { color: '#5a9a7244', width: 1.5, dash: 'dash' } },
    ],
    annotations: [
      { x: totalTime * 0.95, y: pB, text: 'B=' + pB, showarrow: false, font: { size: 10, color: '#5a9a72' }, yshift: 10 },
      { x: totalTime * 0.5, y: (pB + yMaxTime) / 2, text: 'x > B: physically impossible (Shunting)', showarrow: false, font: { size: 9, color: '#aaa' } }
    ]
  };

  const tracesTime = [];
  const lastT = ts[ts.length - 1];
  if (p09_showAdd) {
    tracesTime.push({ x: ts, y: xAdd, mode: 'lines', name: 'Additive', line: { color: '#c06058', width: 2.5 } });
    tracesTime.push({ x: [lastT], y: [xAdd[xAdd.length - 1]], mode: 'markers', name: 'Add eq', marker: { color: '#c06058', size: 8, symbol: 'circle' }, showlegend: false });
  }
  if (p09_showShunt) {
    tracesTime.push({ x: ts, y: xShunt, mode: 'lines', name: 'Shunting', line: { color: '#5a9a72', width: 2.5 } });
    tracesTime.push({ x: [lastT], y: [xShunt[xShunt.length - 1]], mode: 'markers', name: 'Shunt eq', marker: { color: '#5a9a72', size: 8, symbol: 'circle' }, showlegend: false });
  }
  // Hover: tangent lines (Add, Shunt) + dots — always added at end (indices -4 to -1)
  tracesTime.push({ x: [], y: [], mode: 'lines', name: 'tangent-add', line: { color: 'rgba(192,96,88,0.35)', width: 1.5 }, showlegend: false, hoverinfo: 'skip' });
  tracesTime.push({ x: [], y: [], mode: 'markers', name: 'dot-add', marker: { color: 'rgba(192,96,88,0.6)', size: 8, line: { color: '#fff', width: 1.5 } }, showlegend: false, hoverinfo: 'skip' });
  tracesTime.push({ x: [], y: [], mode: 'lines', name: 'tangent-shunt', line: { color: 'rgba(90,154,114,0.35)', width: 1.5 }, showlegend: false, hoverinfo: 'skip' });
  tracesTime.push({ x: [], y: [], mode: 'markers', name: 'dot-shunt', marker: { color: 'rgba(90,154,114,0.6)', size: 8, line: { color: '#fff', width: 1.5 } }, showlegend: false, hoverinfo: 'skip' });
  Plotly.react('p09-plot-time', tracesTime, layoutTime, { responsive: true, displayModeBar: false });

  // dx/dt chart
  const layoutDxdt = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
    yaxis: { title: 'dx/dt', gridcolor: '#eae6e0', zeroline: true, zerolinecolor: '#ccc', zerolinewidth: 1.5 },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } },
  };

  const tracesDxdt = [];
  if (p09_showAdd) {
    tracesDxdt.push({ x: ts, y: dxAdd, mode: 'lines', name: 'dx/dt Add', line: { color: '#c06058', width: 2.5 } });
    tracesDxdt.push({ x: ts, y: compDecayA, mode: 'lines', name: '-Ax (Add)', line: { color: '#c06058', width: 1, dash: 'dash' }, opacity: 0.4 });
    tracesDxdt.push({ x: ts, y: compI_add, mode: 'lines', name: '+I', line: { color: '#9b9590', width: 1, dash: 'dot' }, opacity: 0.4 });
  }
  if (p09_showShunt) {
    tracesDxdt.push({ x: ts, y: dxShunt, mode: 'lines', name: 'dx/dt Shunt', line: { color: '#5a9a72', width: 2.5 } });
    tracesDxdt.push({ x: ts, y: compDecayS, mode: 'lines', name: '-Ax (Shunt)', line: { color: '#5a9a72', width: 1, dash: 'dash' }, opacity: 0.4 });
    tracesDxdt.push({ x: ts, y: compBxI, mode: 'lines', name: '(B-x)I', line: { color: '#4a7fb5', width: 1, dash: 'dot' }, opacity: 0.5 });
  }
  // Hover: dots on dx/dt chart
  tracesDxdt.push({ x: [], y: [], mode: 'markers', name: 'hov-add', marker: { color: 'rgba(192,96,88,0.6)', size: 9, line: { color: '#fff', width: 1.5 } }, showlegend: false, hoverinfo: 'skip' });
  tracesDxdt.push({ x: [], y: [], mode: 'markers', name: 'hov-shunt', marker: { color: 'rgba(90,154,114,0.6)', size: 9, line: { color: '#fff', width: 1.5 } }, showlegend: false, hoverinfo: 'skip' });
  Plotly.react('p09-plot-dxdt', tracesDxdt, layoutDxdt, { responsive: true, displayModeBar: false });

  // Equilibrium vs I
  const Is = [];
  for (let e = -3; e <= 3; e += 0.03) Is.push(Math.pow(10, e));
  const eqAdd = Is.map(i => i / pA);
  const eqShunt = Is.map(i => (pB * i) / (pA + i));

  const eqYmax = Math.min(Math.max(pI / pA * 1.3, pB * 1.3), pB * 3);
  const eqAtI_add = pI / pA;
  const eqAtI_shunt = (pB * pI) / (pA + pI);

  const layoutEq = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Input I', type: 'log', gridcolor: '#eae6e0', range: [-3, 3], zeroline: false },
    yaxis: { title: 'x*', gridcolor: '#eae6e0', range: [0, eqYmax], zeroline: false },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } },
    dragmode: false,
    shapes: [
      { type: 'rect', x0: 0.001, x1: 1000, y0: pB, y1: eqYmax,
        fillcolor: 'rgba(160,160,160,0.10)', line: { width: 0 } },
      { type: 'line', x0: 0.001, x1: 1000, y0: pB, y1: pB, line: { color: '#5a9a7244', width: 1, dash: 'dash' } },
    ]
  };

  const tracesEq = [];
  // Vertical line as a trace (avoids log-axis shape coordinate issues)
  tracesEq.push({ x: [pI, pI], y: [0, eqYmax], mode: 'lines', name: 'I=' + pI.toFixed(1),
    line: { color: '#bf6a42aa', width: 2, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' });
  if (p09_showAdd) {
    // Split additive trace: solid below B, dashed above B
    const addBelowX = Is.filter((_, i) => eqAdd[i] <= pB);
    const addBelowY = eqAdd.filter(v => v <= pB);
    const addAboveX = Is.filter((_, i) => eqAdd[i] >= pB);
    const addAboveY = eqAdd.filter(v => v >= pB);
    tracesEq.push({ x: addBelowX, y: addBelowY, mode: 'lines', name: 'Additive: I/A', line: { color: '#c06058', width: 2.5 } });
    if (addAboveX.length > 0) tracesEq.push({ x: addAboveX, y: addAboveY, mode: 'lines', name: 'Additive > B', line: { color: '#c06058', width: 1.5, dash: 'dash' }, showlegend: false, opacity: 0.5 });
    tracesEq.push({ x: [pI], y: [eqAtI_add], mode: 'markers+text', name: 'Add@I',
      marker: { color: '#c06058', size: 9, symbol: 'circle', line: { color: '#fff', width: 1.5 } },
      text: [eqAtI_add.toFixed(1)], textposition: 'top right', textfont: { size: 10, color: '#c06058' },
      showlegend: false });
  }
  if (p09_showShunt) {
    tracesEq.push({ x: Is, y: eqShunt, mode: 'lines', name: 'Shunting: BI/(A+I)', line: { color: '#5a9a72', width: 2.5 } });
    tracesEq.push({ x: [pI], y: [eqAtI_shunt], mode: 'markers+text', name: 'Shunt@I',
      marker: { color: '#5a9a72', size: 9, symbol: 'circle', line: { color: '#fff', width: 1.5 } },
      text: [eqAtI_shunt.toFixed(1)], textposition: 'top left', textfont: { size: 10, color: '#5a9a72' },
      showlegend: false });
  }
  Plotly.react('p09-plot-eq', tracesEq, layoutEq, { responsive: true, displayModeBar: false });

  // Insight
  const eqA = pI / pA;
  const eqS = (pB * pI) / (pA + pI);
  document.getElementById('p09-insight').innerHTML =
    'Additive 평형: <strong>' + eqA.toFixed(1) + '</strong> (상한 없음) &nbsp;|&nbsp; ' +
    'Shunting 평형: <strong>' + eqS.toFixed(1) + '</strong> (상한 B=' + pB + ')' +
    (eqA > pB * 1.5 ? '<br>Additive가 B를 훨씬 초과했습니다! Shunting은 여전히 B 이내.' : '');
}

['p09-slider-I', 'p09-slider-A', 'p09-slider-B'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePage09);
});

// Drag on equilibrium chart → set I value
let p09_dragSetup = false;
function setupEqDragListener() {
  if (p09_dragSetup) return;
  const el = document.getElementById('p09-plot-eq');
  if (!el) return;

  let dragging = false;
  function getIFromMouse(e) {
    const xa = el._fullLayout.xaxis;
    const rect = el.querySelector('.plotarea,.nsewdrag');
    if (!rect) return null;
    const bb = rect.getBoundingClientRect();
    const frac = (e.clientX - bb.left) / bb.width;
    const logVal = xa.range[0] + frac * (xa.range[1] - xa.range[0]);
    return Math.pow(10, logVal);
  }
  function applyI(e) {
    const newI = getIFromMouse(e);
    if (!newI || newI <= 0) return;
    const clampedI = Math.max(0.001, Math.min(1000, newI));
    const sliderVal = ((Math.log10(clampedI) + 3) / 6) * 1000;
    document.getElementById('p09-slider-I').value = Math.round(sliderVal);
    updatePage09();
  }

  // Use the drag layer (.nsewdrag) for mouse events
  const dragLayer = el.querySelector('.nsewdrag');
  if (!dragLayer) return;

  dragLayer.addEventListener('mousedown', function(e) {
    dragging = true;
    applyI(e);
    e.preventDefault();
  });
  window.addEventListener('mousemove', function(e) {
    if (dragging) applyI(e);
  });
  window.addEventListener('mouseup', function() {
    dragging = false;
  });

  p09_dragSetup = true;
}

// Hover on x(t) → tangent line + dx/dt marker sync via restyle
let p09_hoverSetup = false;
function setupHoverSync() {
  if (p09_hoverSetup) return;
  const timePlot = document.getElementById('p09-plot-time');
  const dxdtPlot = document.getElementById('p09-plot-dxdt');
  if (!timePlot || !dxdtPlot) return;

  function findIdx(t) {
    const s = p09_sim;
    if (!s.ts.length) return 0;
    let best = 0;
    for (let i = 1; i < s.ts.length; i++) {
      if (Math.abs(s.ts[i] - t) < Math.abs(s.ts[best] - t)) best = i;
    }
    return best;
  }

  // Hover traces are the last 4 in timePlot, last 2 in dxdtPlot
  // timePlot: [...main traces..., tangent-add, dot-add, tangent-shunt, dot-shunt]
  // dxdtPlot: [...main traces..., hov-add, hov-shunt]
  function getTimePlotLen() { return (timePlot.data || []).length; }
  function getDxdtLen()     { return (dxdtPlot.data || []).length; }

  timePlot.on('plotly_hover', function(data) {
    if (!data || !data.points || !data.points[0]) return;
    // Only respond to hover on main curves (not our own hover traces)
    const pt = data.points[0];
    const t = pt.x;
    const idx = findIdx(t);
    const s = p09_sim;
    const nTime = getTimePlotLen();
    const nDxdt = getDxdtLen();
    const iTA = nTime - 4, iDA = nTime - 3, iTS = nTime - 2, iDS = nTime - 1;
    const iHA = nDxdt - 2, iHS = nDxdt - 1;

    // Normalize tangent to fixed length in axis-normalized space
    const fl = timePlot._fullLayout;
    const xRange = (fl && fl.xaxis && fl.xaxis.range) ? (fl.xaxis.range[1] - fl.xaxis.range[0]) : 10;
    const yRange = (fl && fl.yaxis && fl.yaxis.range) ? (fl.yaxis.range[1] - fl.yaxis.range[0]) : 25;
    const NORM_LEN = 0.54; // fraction of x-range for tangent half-width (normalized)
    function tangentPts(t, x, slope) {
      const slopeN = slope * (xRange / yRange); // slope in normalized coords
      const dt = NORM_LEN * xRange / Math.sqrt(1 + slopeN * slopeN);
      return [[t - dt, t + dt], [x - slope * dt, x + slope * dt]];
    }

    const xa = s.xAdd[idx]   || 0, da = s.dxAdd[idx]   || 0;
    const xs = s.xShunt[idx] || 0, ds = s.dxShunt[idx] || 0;

    if (p09_showAdd) {
      const [tx, ty] = tangentPts(t, xa, da);
      Plotly.restyle(timePlot, { x: [tx], y: [ty] }, [iTA]);
      Plotly.restyle(timePlot, { x: [[t]], y: [[xa]] }, [iDA]);
      Plotly.restyle(dxdtPlot, { x: [[t]], y: [[da]] }, [iHA]);
    }
    if (p09_showShunt) {
      const [tx, ty] = tangentPts(t, xs, ds);
      Plotly.restyle(timePlot, { x: [tx], y: [ty] }, [iTS]);
      Plotly.restyle(timePlot, { x: [[t]], y: [[xs]] }, [iDS]);
      Plotly.restyle(dxdtPlot, { x: [[t]], y: [[ds]] }, [iHS]);
    }
  });

  timePlot.on('plotly_unhover', function() {
    const nTime = getTimePlotLen();
    const nDxdt = getDxdtLen();
    for (let i = nTime - 4; i < nTime; i++) Plotly.restyle(timePlot, { x: [[]], y: [[]] }, [i]);
    for (let i = nDxdt - 2; i < nDxdt; i++) Plotly.restyle(dxdtPlot, { x: [[]], y: [[]] }, [i]);
  });

  p09_hoverSetup = true;
}

// =============================================
// PAGE: Fig 2.11 MTM & LTM
// =============================================
let p11_anim = null;
let p11_data = { ts: [], ys: [], zs: [], fs: [], hs: [], y: 1, z: 0, t: 0, pulsing: false, pulseOn: false, patSeq: false,
  zNet: [0, 0, 0], zsNet: [[], [], []], hsNet: [[], [], []] };
// 3-synapse network: each pattern provides a different input → different h vector
const p11_patterns = [
  { name: 'A', f: 5, h: [0.7, 0.2, 0.1], dur: 3, color: 'rgba(74,127,181,0.10)', label: 'I=(5,2,1)' },
  { name: 'B', f: 3, h: [0.1, 0.2, 0.7], dur: 3, color: 'rgba(191,106,66,0.10)', label: 'I=(1,2,5)' },
  { name: 'Rest', f: 0, h: [0, 0, 0], dur: 3, color: 'rgba(155,149,144,0.06)', label: 'f=0' },
];
const p11_synColors = ['#4a7fb5', '#5a9a72', '#bf6a42']; // z₁, z₂, z₃

function initPage11() {
  // MTM segmented equation
  katex.render(String.raw`d{\color{#4a7fb5}y}/dt = \;`, document.getElementById('eq-mtm-lhs'), { displayMode: false });
  katex.render(String.raw`H(K - {\color{#4a7fb5}y})`, document.getElementById('eq-mtm-prod'), { displayMode: false });
  katex.render(String.raw`\; - \; L\,f({\color{#5a9a72}x})\,{\color{#4a7fb5}y}`, document.getElementById('eq-mtm-dep'), { displayMode: false });

  // LTM segmented equation
  katex.render(String.raw`d{\color{#bf6a42}z}/dt = \;`, document.getElementById('eq-ltm-lhs'), { displayMode: false });
  katex.render(String.raw`M\,f({\color{#5a9a72}x})`, document.getElementById('eq-ltm-gate'), { displayMode: false });
  katex.render(String.raw`\big(h({\color{#5a9a72}x}) - {\color{#bf6a42}z}\big)`, document.getElementById('eq-ltm-err'), { displayMode: false });

  // Full equations with ji subscripts
  katex.render(String.raw`d{\color{#4a7fb5}y_{ji}}/dt = H(K - {\color{#4a7fb5}y_{ji}}) - L\,f_j({\color{#5a9a72}x_j})\,{\color{#4a7fb5}y_{ji}}`, document.getElementById('eq-mtm-full-ji'), { displayMode: false });
  katex.render(String.raw`d{\color{#bf6a42}z_{ji}}/dt = M\,f_j({\color{#5a9a72}x_j})\big(h_{ji}({\color{#5a9a72}\mathbf{x}}) - {\color{#bf6a42}z_{ji}}\big)`, document.getElementById('eq-ltm-full-ji'), { displayMode: false });

  // Variable labels
  katex.render(String.raw`H`, document.getElementById('var-H'), { displayMode: false });
  katex.render(String.raw`K`, document.getElementById('var-K'), { displayMode: false });
  katex.render(String.raw`L`, document.getElementById('var-L'), { displayMode: false });
  katex.render(String.raw`M`, document.getElementById('var-M'), { displayMode: false });

  // Shunting connection equation with colored y and z
  katex.render(String.raw`\frac{d}{dt}x_i = -A_i\,x_i + (B_i - C_i\,x_i)\Big[\sum_{j=1}^{n} f_j(x_j)\,D_{ji}\,{\color{#4a7fb5}y_{ji}}\,{\color{#bf6a42}z_{ji}} + I_i\Big] - (E_i\,X_i + F_i)\Big[\sum_{j=1}^{n} g_j(x_j)\,G_{ji}\,{\color{#4a7fb5}Y_{ji}}\,{\color{#bf6a42}Z_{ji}} + J_i\Big]`, document.getElementById('eq-p11-shunting'), { displayMode: true });

  // Derivation steps
  katex.render(String.raw`E = \frac{1}{2}\big(h(x) - z\big)^2`, document.getElementById('eq-deriv-step1'), { displayMode: true });
  katex.render(String.raw`-\frac{\partial E}{\partial z} = h(x) - z`, document.getElementById('eq-deriv-step2'), { displayMode: true });
  katex.render(String.raw`dz/dt = M\,f(x)\cdot\Big(-\frac{\partial E}{\partial z}\Big) = M\,f(x)\big(h(x) - z\big)`, document.getElementById('eq-deriv-step3'), { displayMode: true });
  katex.render(String.raw`\boxed{\;dz/dt = M\,f(x)\big(h(x) - z\big)\;}`, document.getElementById('eq-deriv-result'), { displayMode: true });

  // Derivation toggle
  document.getElementById('p11-deriv-toggle').addEventListener('click', () => {
    document.getElementById('p11-deriv-toggle').classList.toggle('open');
    document.getElementById('p11-deriv-body').classList.toggle('open');
    document.getElementById('p11-deriv-hint').textContent = document.getElementById('p11-deriv-toggle').classList.contains('open') ? '(접기)' : '(펼치기)';
  });

  // Rebind data-hl hover listeners for this page
  document.querySelectorAll('#page-fig2_11 [data-hl]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const t = document.getElementById(card.dataset.hl);
      if (t) t.classList.add(card.dataset.hlClass || 'eq-seg-hl-green');
    });
    card.addEventListener('mouseleave', () => {
      const t = document.getElementById(card.dataset.hl);
      if (t) t.classList.remove('eq-seg-hl-green', 'eq-seg-hl-purple', 'eq-seg-hl-red', 'eq-seg-hl-blue', 'eq-seg-hl-accent');
    });
  });

  // Pulse button
  document.getElementById('p11-btn-pulse').addEventListener('click', () => {
    p11_data.pulsing = !p11_data.pulsing;
    if (p11_data.pulsing) {
      p11_data.patSeq = false;
      document.getElementById('p11-btn-patseq').classList.remove('active');
      document.getElementById('p11-pat-indicator').textContent = '';
      // Reset sim for clean pulse start — z=0 so learning curve is visible
      const K = parseFloat(document.getElementById('p11-slider-K').value);
      p11_data.y = K; p11_data.z = 0; p11_data.t = 0;
      p11_data.ts = []; p11_data.ys = []; p11_data.zs = []; p11_data.fs = []; p11_data.hs = [];
      p11_data.zNet = [0,0,0]; p11_data.zsNet = [[],[],[]]; p11_data.hsNet = [[],[],[]];
    }
    document.getElementById('p11-btn-pulse').classList.toggle('active', p11_data.pulsing);
    updatePage11Analysis();
  });

  // Pattern Sequence button
  document.getElementById('p11-btn-patseq').addEventListener('click', () => {
    p11_data.patSeq = !p11_data.patSeq;
    if (p11_data.patSeq) {
      p11_data.pulsing = false;
      document.getElementById('p11-btn-pulse').classList.remove('active');
      // Reset real-time sim for clean pattern seq start
      const K = parseFloat(document.getElementById('p11-slider-K').value);
      p11_data.y = K; p11_data.z = 0; p11_data.t = 0;
      p11_data.ts = []; p11_data.ys = []; p11_data.zs = []; p11_data.fs = []; p11_data.hs = [];
      p11_data.zNet = [0,0,0]; p11_data.zsNet = [[],[],[]]; p11_data.hsNet = [[],[],[]];
    } else {
      document.getElementById('p11-pat-indicator').textContent = '';
    }
    document.getElementById('p11-btn-patseq').classList.toggle('active', p11_data.patSeq);
    updatePage11Analysis();
  });

  updatePage11Analysis();

  // === Pattern Learning Visualization ===
  const plPatA = [0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0];
  const plPatB = [0,0,0,0,0, 0,0,0,0,0, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0];
  const plPatterns = [
    { name: 'A "I"', f: 5, h: plPatA, dur: 3, color: '#4a7fb5' },
    { name: 'B "-"', f: 3, h: plPatB, dur: 3, color: '#bf6a42' },
    { name: 'Rest', f: 0, h: plPatA.map(() => 0), dur: 3, color: '#9b9590' },
  ];
  const plM = 0.05;
  const plCycles = 4;
  const plCycleLen = plPatterns.reduce((s, p) => s + p.dur, 0);
  const plTotalTime = plCycles * plCycleLen;
  const plDt = 0.05;
  const plSteps = Math.ceil(plTotalTime / plDt);

  // Compute theoretical weighted average
  const plZbar = plPatA.map((_, j) => {
    let num = 0, den = 0;
    for (const p of plPatterns) {
      if (p.f > 0) { num += p.f * p.h[j] * p.dur; den += p.f * p.dur; }
    }
    return den > 0 ? num / den : 0;
  });

  // Pre-compute all z snapshots via Euler integration
  function plSimulate() {
    const snapshots = [];
    const z = new Float64Array(25);
    for (let step = 0; step <= plSteps; step++) {
      const t = step * plDt;
      const tMod = t % plCycleLen;
      let acc = 0, pat = plPatterns[0];
      for (const p of plPatterns) { acc += p.dur; if (tMod < acc) { pat = p; break; } }
      if (step % 2 === 0) {
        snapshots.push({ t: t, z: Array.from(z), pat: pat.name, f: pat.f });
      }
      for (let j = 0; j < 25; j++) {
        z[j] += plM * pat.f * (pat.h[j] - z[j]) * plDt;
      }
    }
    return snapshots;
  }
  const plSnapshots = plSimulate();

  // value -> color: 0=#f0ece8, 1=#2a5f95
  function plColor(val) {
    const t = Math.min(Math.max(val, 0), 1);
    const r = Math.round(240 - t * 198);
    const g = Math.round(236 - t * 141);
    const b = Math.round(232 - t * 83);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function plColorDiff(val) {
    const t = Math.min(val / 0.05, 1);
    const r = Math.round(90 + t * 160);
    const g = Math.round(154 - t * 100);
    const b = Math.round(114 - t * 70);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function plRenderGrid(containerId, values, colorFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const fn = colorFn || plColor;
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'p11-cell';
      cell.style.backgroundColor = fn(values[i]);
      if (values[i] > 0.01) cell.textContent = values[i].toFixed(2);
      container.appendChild(cell);
    }
  }

  // Render static grids
  plRenderGrid('p11-grid-patA', plPatA);
  plRenderGrid('p11-grid-patB', plPatB);
  plRenderGrid('p11-grid-target', plZbar);
  plRenderGrid('p11-grid-target2', plZbar);
  plRenderGrid('p11-grid-live', new Array(25).fill(0));
  plRenderGrid('p11-grid-final', new Array(25).fill(0));
  plRenderGrid('p11-grid-diff', new Array(25).fill(0), plColorDiff);

  // Animation state
  let plFrame = 0, plPlaying = false, plAnimId = null;

  function plStep() {
    if (plFrame >= plSnapshots.length) {
      plPlaying = false;
      document.getElementById('p11-learn-play').textContent = '[>] Play';
      const finalZ = plSnapshots[plSnapshots.length - 1].z;
      plRenderGrid('p11-grid-final', finalZ);
      const diff = finalZ.map((v, j) => Math.abs(v - plZbar[j]));
      plRenderGrid('p11-grid-diff', diff, plColorDiff);
      const maxErr = Math.max.apply(null, diff);
      document.getElementById('p11-learn-insight').innerHTML =
        '<strong>학습 완료!</strong> 4사이클 후 z가 이론적 z&#772;에 수렴.' +
        ' 최대 오차: ' + maxErr.toFixed(4) +
        '<br>"ㅣ"(f=5)이 "ㅡ"(f=3)보다 <strong>더 강하게 각인</strong>됨 \u2014 f가 클수록 가중치가 높다.' +
        '<br>중심 셀은 양쪽 패턴 모두에 존재하므로 <strong>가장 밝다</strong>.' +
        ' 각 시냅스가 독립적으로 자신이 본 것의 가중 평균을 저장한다.' +
        '<br><br><strong style="color:#c44">Feedforward 네트워크의 한계:</strong> ' +
        '이 결과는 두 패턴의 <strong>혼합</strong>이지 <strong>구분</strong>이 아니다. ' +
        '단일 뉴런(또는 경쟁 없는 다수 뉴런)은 모든 입력 패턴의 평균만 저장할 수 있다. ' +
        '패턴을 구분하려면 뉴런 간 <strong>측면 억제(lateral inhibition)</strong>와 ' +
        '<strong>경쟁 학습(competitive learning)</strong>이 필요하다 \u2014 ' +
        'Grossberg의 이후 이론(ART, Adaptive Resonance Theory)에서 다룬다.';
      document.getElementById('p11-learn-status').textContent = 'Complete';
      return;
    }

    const snap = plSnapshots[plFrame];
    plRenderGrid('p11-grid-live', snap.z);
    plRenderGrid('p11-grid-final', snap.z);

    const progress = snap.t / plTotalTime * 100;
    const progbar = document.getElementById('p11-learn-progbar');
    const patColors = { 'A "I"': '#4a7fb5', 'B "-"': '#bf6a42', 'Rest': '#d5d0cb' };
    progbar.style.width = progress + '%';
    progbar.style.backgroundColor = patColors[snap.pat] || '#d5d0cb';
    document.getElementById('p11-learn-progtext').textContent =
      snap.pat + (snap.f > 0 ? ' (f=' + snap.f + ')' : '') + ' \u2014 ' + snap.t.toFixed(1) + 's';
    document.getElementById('p11-learn-cycle').textContent =
      Math.min(Math.floor(snap.t / plCycleLen) + 1, plCycles);
    document.getElementById('p11-learn-status').textContent = 'Playing: ' + snap.pat;

    plFrame++;
    if (plPlaying) plAnimId = requestAnimationFrame(plStep);
  }

  document.getElementById('p11-learn-play').addEventListener('click', function() {
    if (plPlaying) {
      plPlaying = false;
      this.textContent = '[>] Play';
      if (plAnimId) cancelAnimationFrame(plAnimId);
    } else {
      if (plFrame >= plSnapshots.length) plFrame = 0;
      plPlaying = true;
      this.textContent = '[||] Pause';
      plStep();
    }
  });

  document.getElementById('p11-learn-reset').addEventListener('click', function() {
    plPlaying = false;
    plFrame = 0;
    if (plAnimId) cancelAnimationFrame(plAnimId);
    document.getElementById('p11-learn-play').textContent = '[>] Play';
    plRenderGrid('p11-grid-live', new Array(25).fill(0));
    plRenderGrid('p11-grid-final', new Array(25).fill(0));
    plRenderGrid('p11-grid-diff', new Array(25).fill(0), plColorDiff);
    document.getElementById('p11-learn-progbar').style.width = '0%';
    document.getElementById('p11-learn-progtext').textContent = '';
    document.getElementById('p11-learn-cycle').textContent = '0';
    document.getElementById('p11-learn-status').textContent = 'Ready';
    document.getElementById('p11-learn-insight').innerHTML = '[>] Play를 눌러 학습 과정을 관찰하세요. \u2014 단일 뉴런이 두 패턴을 번갈아 보면 어떤 z가 형성될까?';
  });

  // === Template Matching Test ===
  // Use the theoretical z-bar as the "learned z"
  const tmZ = plZbar.slice();
  const tmMaxResponse = tmZ.reduce((s, v) => s + v * v, 0);

  // Current test input
  let tmInput = new Array(25).fill(0);

  // Presets
  const tmPresets = {
    vertical:   [0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0],
    horizontal: [0,0,0,0,0, 0,0,0,0,0, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0],
    cross:      [0,0,1,0,0, 0,0,1,0,0, 1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0],
    diagonal:   [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0, 0,0,0,0,1],
    block:      [0,0,0,0,0, 0,1,1,1,0, 0,1,1,1,0, 0,1,1,1,0, 0,0,0,0,0],
    clear:      new Array(25).fill(0),
  };

  // Render the learned z grid (static)
  plRenderGrid('p11-test-z', tmZ);
  document.getElementById('p11-test-maxresponse').textContent = tmMaxResponse.toFixed(2);

  // Render interactive input grid
  function tmRenderInput() {
    const container = document.getElementById('p11-test-input');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'p11-cell';
      cell.style.backgroundColor = tmInput[i] > 0.5 ? '#4a7fb5' : '#f0ece8';
      cell.style.cursor = 'pointer';
      cell.style.border = '1px solid #e0dcd8';
      cell.dataset.idx = i;
      cell.addEventListener('click', () => {
        tmInput[i] = tmInput[i] > 0.5 ? 0 : 1;
        tmUpdateAll();
      });
      container.appendChild(cell);
    }
  }

  // Compute and update response
  function tmUpdateAll() {
    tmRenderInput();

    // Compute dot product
    let response = 0;
    for (let j = 0; j < 25; j++) response += tmInput[j] * tmZ[j];

    const pct = tmMaxResponse > 0 ? (response / tmMaxResponse) * 100 : 0;

    document.getElementById('p11-test-response').textContent = response.toFixed(2);
    document.getElementById('p11-test-bar').style.width = Math.min(pct, 100) + '%';

    // Color the response number based on strength
    const respEl = document.getElementById('p11-test-response');
    if (pct > 80) respEl.style.color = '#5a9a72';
    else if (pct > 40) respEl.style.color = '#bf6a42';
    else respEl.style.color = '#c44';

    // Comparison with presets
    const presetResults = [];
    for (const [name, pat] of Object.entries(tmPresets)) {
      if (!pat || name === 'clear') continue;
      let r = 0;
      for (let j = 0; j < 25; j++) r += pat[j] * tmZ[j];
      const label = { vertical: '|', horizontal: '-', cross: '+', diagonal: '\\', block: '[#]' }[name] || name;
      presetResults.push({ label, response: r, pct: tmMaxResponse > 0 ? r / tmMaxResponse * 100 : 0 });
    }
    presetResults.sort((a, b) => b.response - a.response);

    let compHtml = '<div style="font-weight:600;margin-bottom:4px">프리셋 비교:</div>';
    for (const p of presetResults) {
      const barColor = p.pct > 80 ? '#5a9a72' : p.pct > 40 ? '#bf6a42' : '#c44';
      compHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
        '<span style="width:24px;text-align:center">' + p.label + '</span>' +
        '<div style="flex:1;height:12px;background:#f0ece8;border-radius:3px;overflow:hidden">' +
        '<div style="height:100%;width:' + p.pct.toFixed(0) + '%;background:' + barColor + ';border-radius:3px"></div></div>' +
        '<span style="width:40px;text-align:right">' + p.response.toFixed(2) + '</span></div>';
    }
    document.getElementById('p11-test-comparison').innerHTML = compHtml;

    // Insight
    const inputSum = tmInput.reduce((s, v) => s + v, 0);
    let insightText = '';
    if (inputSum === 0) {
      insightText = '입력이 없으면 출력도 0 -- 뉴런이 반응하지 않는다.';
    } else if (pct > 90) {
      insightText = '<strong style="color:#5a9a72">강한 반응!</strong> 입력이 학습된 z와 거의 일치한다. 이 뉴런은 이 패턴에 "전문화"되어 있다.';
    } else if (pct > 60) {
      insightText = '<strong style="color:#bf6a42">중간 반응.</strong> 입력이 z와 부분적으로 겹친다. 공유 영역만큼만 반응한다.';
    } else {
      insightText = '<strong style="color:#c44">약한 반응.</strong> 입력이 z와 거의 겹치지 않는다. 이 뉴런은 이 패턴에 관심이 없다.';
    }
    document.getElementById('p11-test-insight').innerHTML = insightText;
  }

  // Preset buttons
  document.querySelectorAll('.p11-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset === 'random') {
        tmInput = Array.from({length: 25}, () => Math.random() > 0.5 ? 1 : 0);
      } else if (tmPresets[preset]) {
        tmInput = tmPresets[preset].slice();
      }
      tmUpdateAll();
    });
  });

  // Initial render
  tmRenderInput();
  tmUpdateAll();

  p11_anim = setInterval(stepPage11, 50);
}

function stepPage11() {
  const d = p11_data;
  const H = parseFloat(document.getElementById('p11-slider-H').value);
  const K = parseFloat(document.getElementById('p11-slider-K').value);
  const L = parseFloat(document.getElementById('p11-slider-L').value);
  const M = parseFloat(document.getElementById('p11-slider-M').value);
  let fx = parseFloat(document.getElementById('p11-slider-fx').value);
  const hx = parseFloat(document.getElementById('p11-slider-hx').value);

  // Auto pulse
  if (d.pulsing && !d.patSeq) {
    if (Math.floor(d.t / 3) % 2 === 0) { fx = 5; d.pulseOn = true; }
    else { fx = 0; d.pulseOn = false; }
    document.getElementById('p11-slider-fx').value = fx;
    document.getElementById('p11-val-fx').textContent = fx.toFixed(1);
  }

  // Pattern sequence mode
  let curHx = hx;
  if (d.patSeq) {
    const pat = p11_getPatternAt(d.t);
    fx = pat.f; curHx = pat.h[0] || 0;
    document.getElementById('p11-slider-fx').value = fx;
    document.getElementById('p11-val-fx').textContent = fx.toFixed(1);
    document.getElementById('p11-pat-indicator').textContent = '▶ Pattern ' + pat.name + ' ' + pat.label;
  }

  const dt = 0.1;
  for (let i = 0; i < 3; i++) {
    d.y += (H * (K - d.y) - L * fx * d.y) * dt;
    if (d.patSeq) {
      const pat = p11_getPatternAt(d.t);
      for (let j = 0; j < 3; j++) {
        d.zNet[j] += (M * pat.f * (pat.h[j] - d.zNet[j])) * dt;
      }
    }
    d.z += (M * fx * (curHx - d.z)) * dt;
    d.t += dt;
  }

  d.ts.push(d.t);
  d.ys.push(d.y);
  d.zs.push(d.z);
  d.fs.push(fx);
  d.hs.push(curHx);
  if (d.patSeq) {
    for (let j = 0; j < 3; j++) { d.zsNet[j].push(d.zNet[j]); }
  }

  // Keep last 400 points (longer for pattern seq)
  const maxPts = d.patSeq ? 400 : 300;
  if (d.ts.length > maxPts) {
    d.ts.shift(); d.ys.shift(); d.zs.shift(); d.fs.shift(); d.hs.shift();
    if (d.patSeq) { for (let j = 0; j < 3; j++) d.zsNet[j].shift(); }
  }

  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false,
      range: [Math.max(0, d.t - 30), Math.max(d.t, 30)] },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } }
  };

  Plotly.react('p11-plot-mtm', [
    { x: d.ts, y: d.ys, mode: 'lines', name: 'y (transmitter)', line: { color: '#4a7fb5', width: 2.5 } },
    { x: d.ts, y: d.fs.map(f => f / 10), mode: 'lines', name: 'f(x)/10', line: { color: '#9b9590', width: 1, dash: 'dot' } },
  ], { ...layoutBase, yaxis: { title: 'y', gridcolor: '#eae6e0', range: [0, K * 1.1], zeroline: false } },
  { responsive: true, displayModeBar: false });

  if (d.patSeq && d.zsNet[0].length > 0) {
    // 3-synapse real-time LTM chart
    const labels = ['z₁', 'z₂', 'z₃'];
    const ltmTraces = [];
    for (let j = 0; j < 3; j++) {
      ltmTraces.push({ x: d.ts.slice(-d.zsNet[j].length), y: d.zsNet[j], mode: 'lines',
        name: labels[j], line: { color: p11_synColors[j], width: 2.5 } });
    }
    // Weighted average lines
    let den = 0;
    for (const p of p11_patterns) { if (p.f > 0) den += M * p.f * p.dur; }
    for (let j = 0; j < 3; j++) {
      let num = 0;
      for (const p of p11_patterns) { if (p.f > 0) num += M * p.f * p.h[j] * p.dur; }
      const zb = den > 0 ? num / den : 0;
      const tRange = d.ts.length > 1 ? [d.ts[0], d.ts[d.ts.length - 1]] : [0, 1];
      ltmTraces.push({ x: tRange, y: [zb, zb], mode: 'lines', name: 'z̄' + (j+1),
        line: { color: p11_synColors[j], width: 1, dash: 'dashdot' }, opacity: 0.5, showlegend: false });
    }
    Plotly.react('p11-plot-ltm', ltmTraces,
    { ...layoutBase, yaxis: { title: 'z (LTM weights)', gridcolor: '#eae6e0', range: [0, 1], zeroline: false } },
    { responsive: true, displayModeBar: false });
  } else {
    // Single-synapse real-time LTM chart
    // NOTE: must use .slice() to avoid sharing array references with MTM chart — Plotly.react skips updates on same ref
    const tsC = d.ts.slice(), zsC = d.zs.slice();
    const hTrace = d.hs.length === d.ts.length ? d.hs.slice() : d.ts.map(() => curHx);
    Plotly.react('p11-plot-ltm', [
      { x: tsC, y: zsC, mode: 'lines', name: 'z (weight)', line: { color: '#bf6a42', width: 2.5 } },
      { x: tsC, y: hTrace, mode: 'lines', name: 'h(x) target', line: { color: '#c49a3c', width: 1, dash: 'dash' } },
    ], { ...layoutBase, yaxis: { title: 'z', gridcolor: '#eae6e0', range: [0, Math.max(curHx * 1.2, 6)], zeroline: false } },
    { responsive: true, displayModeBar: false });
  }
}

function p11_getPatternAt(t) {
  const cycle = p11_patterns.reduce((s, p) => s + p.dur, 0);
  const tMod = t % cycle;
  let acc = 0;
  for (const p of p11_patterns) {
    acc += p.dur;
    if (tMod < acc) return p;
  }
  return p11_patterns[0];
}

function updatePage11Analysis() {
  const H = parseFloat(document.getElementById('p11-slider-H').value);
  const K = parseFloat(document.getElementById('p11-slider-K').value);
  const L = parseFloat(document.getElementById('p11-slider-L').value);
  const M = parseFloat(document.getElementById('p11-slider-M').value);
  const sliderFx = parseFloat(document.getElementById('p11-slider-fx').value);
  const sliderHx = parseFloat(document.getElementById('p11-slider-hx').value);
  const usePatSeq = p11_data.patSeq;

  const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } }
  };

  if (usePatSeq) {
    // ===== 3-SYNAPSE NETWORK MODE =====
    const nSyn = 3;
    const totalTime = 36, plotPoints = 360;
    const dtPlot = totalTime / plotPoints;
    const subSteps = 20, dtSub = dtPlot / subSteps;

    // Build pattern region shapes
    const cycle = p11_patterns.reduce((s, p) => s + p.dur, 0);
    const patShapes = [];
    for (let c = 0; c * cycle < totalTime; c++) {
      let t0 = c * cycle;
      for (const p of p11_patterns) {
        if (t0 >= totalTime) break;
        const t1 = Math.min(t0 + p.dur, totalTime);
        patShapes.push({ type: 'rect', x0: t0, x1: t1, y0: 0, y1: 1, yref: 'paper',
          fillcolor: p.color, line: { width: 0 }, layer: 'below' });
        t0 = t1;
      }
    }

    // Simulate z₁, z₂, z₃ + single y (MTM)
    const ts = [];
    const zArrs = Array.from({length: nSyn}, () => []);
    const hArrs = Array.from({length: nSyn}, () => []);
    const yArr = [], fxArr = [];
    let y = K;
    const z = [0, 0, 0];
    for (let s = 0; s <= plotPoints; s++) {
      const t = s * dtPlot;
      const pat = p11_getPatternAt(t);
      const fx = pat.f;
      ts.push(t);
      yArr.push(y);
      fxArr.push(fx / 10);
      for (let j = 0; j < nSyn; j++) {
        zArrs[j].push(z[j]);
        hArrs[j].push(pat.h[j]);
      }
      for (let ss = 0; ss < subSteps; ss++) {
        y += (H * (K - y) - L * fx * y) * dtSub;
        for (let j = 0; j < nSyn; j++) {
          z[j] += (M * fx * (pat.h[j] - z[j])) * dtSub;
        }
      }
    }

    // Compute theoretical weighted average for each z_j
    const zBars = [];
    let den = 0;
    for (const p of p11_patterns) { if (p.f > 0) den += M * p.f * p.dur; }
    for (let j = 0; j < nSyn; j++) {
      let num = 0;
      for (const p of p11_patterns) { if (p.f > 0) num += M * p.f * p.h[j] * p.dur; }
      zBars.push(den > 0 ? num / den : 0);
    }

    // --- Chart 1: z₁, z₂, z₃ learning curves ---
    const labels = ['z₁ (synapse 1)', 'z₂ (synapse 2)', 'z₃ (synapse 3)'];
    const ch1Traces = [];
    for (let j = 0; j < nSyn; j++) {
      ch1Traces.push({ x: ts, y: zArrs[j], mode: 'lines', name: labels[j],
        line: { color: p11_synColors[j], width: 2.5 } });
      ch1Traces.push({ x: ts, y: hArrs[j], mode: 'lines', name: 'h' + (j+1),
        line: { color: p11_synColors[j], width: 1, dash: 'dot' }, opacity: 0.35, showlegend: false });
    }
    Plotly.react('p11-plot-deriv', ch1Traces, {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'z (LTM weights)', gridcolor: '#eae6e0', range: [0, 1], zeroline: false },
      shapes: patShapes,
    }, { responsive: true, displayModeBar: false });

    // --- Chart Gate: f(x) gate signal + dz/dt per synapse ---
    // Build gate signal and dz/dt arrays from the simulation
    const gateSignal = [], dzdt_arr = Array.from({length: nSyn}, () => []);
    let yG = K;
    const zG = [0, 0, 0];
    for (let s = 0; s <= plotPoints; s++) {
      const t = s * dtPlot;
      const pat = p11_getPatternAt(t);
      const fxG = pat.f;
      gateSignal.push(fxG);
      for (let j = 0; j < nSyn; j++) {
        dzdt_arr[j].push(M * fxG * (pat.h[j] - zG[j]));
      }
      for (let ss = 0; ss < subSteps; ss++) {
        yG += (H * (K - yG) - L * fxG * yG) * dtSub;
        for (let j = 0; j < nSyn; j++) {
          zG[j] += (M * fxG * (pat.h[j] - zG[j])) * dtSub;
        }
      }
    }
    // Gate open/closed shapes
    const gateShapes = [];
    for (let c = 0; c * cycle < totalTime; c++) {
      let t0g = c * cycle;
      for (const p of p11_patterns) {
        if (t0g >= totalTime) break;
        const t1g = Math.min(t0g + p.dur, totalTime);
        if (p.f > 0) {
          gateShapes.push({ type: 'rect', x0: t0g, x1: t1g, y0: 0, y1: 1, yref: 'paper',
            fillcolor: p.color.replace('0.10', '0.08'), line: { width: 0 }, layer: 'below' });
        }
        t0g = t1g;
      }
    }
    const gateTraces = [
      { x: ts, y: gateSignal, mode: 'lines', name: 'f(x) gate', line: { color: '#9b9590', width: 2.5 },
        fill: 'tozeroy', fillcolor: 'rgba(155,149,144,0.12)' },
    ];
    for (let j = 0; j < nSyn; j++) {
      gateTraces.push({ x: ts, y: dzdt_arr[j], mode: 'lines', name: 'dz' + (j+1) + '/dt',
        line: { color: p11_synColors[j], width: 2 }, yaxis: 'y2' });
    }
    Plotly.react('p11-plot-gate', gateTraces, {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'f(x) gate', gridcolor: '#eae6e0', range: [0, Math.max(...gateSignal) * 1.3], zeroline: true,
        zerolinecolor: '#ccc', zerolinewidth: 1 },
      yaxis2: { title: 'dz/dt', overlaying: 'y', side: 'right', gridcolor: 'transparent', zeroline: true,
        zerolinecolor: '#bf6a4244', zerolinewidth: 1, showgrid: false },
      shapes: gateShapes,
      legend: { x: 0.02, y: 0.98, font: { size: 9 } },
    }, { responsive: true, displayModeBar: false });

    // --- Chart 2: y(t) MTM + f(x) + pattern context ---
    const ch2Shapes = [...patShapes.map(s => ({...s})),
      { type: 'line', x0: 0, x1: totalTime, y0: K, y1: K, line: { color: '#4a7fb544', width: 1.5, dash: 'dash' } },
    ];
    Plotly.react('p11-plot-time', [
      { x: ts, y: yArr, mode: 'lines', name: 'y (MTM)', line: { color: '#4a7fb5', width: 2.5 } },
      { x: ts, y: fxArr, mode: 'lines', name: 'f(x)/10', line: { color: '#9b9590', width: 1, dash: 'dot' } },
    ], {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'y (MTM)', gridcolor: '#eae6e0', range: [0, K * 1.2], zeroline: false },
      shapes: ch2Shapes,
      annotations: [{ x: totalTime * 0.95, y: K, text: 'K=' + K, showarrow: false, font: { size: 10, color: '#4a7fb5' }, yshift: 10 }],
    }, { responsive: true, displayModeBar: false });

    // --- Chart 3: z vector bar chart — learned vs theoretical ---
    const synLabels = ['z₁', 'z₂', 'z₃'];
    const finalZ = z.map(v => v);
    Plotly.react('p11-plot-eq', [
      { x: synLabels, y: finalZ, type: 'bar', name: '학습된 z', marker: { color: p11_synColors.map(c => c + 'cc') },
        text: finalZ.map(v => v.toFixed(3)), textposition: 'outside', textfont: { size: 11 } },
      { x: synLabels, y: zBars, type: 'bar', name: '이론적 z̄', marker: { color: p11_synColors.map(c => c + '44'),
        line: { color: p11_synColors, width: 2 } },
        text: zBars.map(v => v.toFixed(3)), textposition: 'outside', textfont: { size: 11 } },
      { x: synLabels, y: p11_patterns[0].h, type: 'scatter', mode: 'markers', name: 'h(A)',
        marker: { color: p11_patterns[0].color.replace('0.10', '0.8'), size: 10, symbol: 'diamond' } },
      { x: synLabels, y: p11_patterns[1].h, type: 'scatter', mode: 'markers', name: 'h(B)',
        marker: { color: p11_patterns[1].color.replace('0.10', '0.8'), size: 10, symbol: 'diamond' } },
    ], {
      ...layoutBase, barmode: 'group',
      xaxis: { title: 'Synapse', gridcolor: '#eae6e0' },
      yaxis: { title: 'Weight', gridcolor: '#eae6e0', range: [0, 1] },
    }, { responsive: true, displayModeBar: false });

    // --- Insight ---
    const patAStr = 'A: h=[' + p11_patterns[0].h.join(', ') + ']';
    const patBStr = 'B: h=[' + p11_patterns[1].h.join(', ') + ']';
    document.getElementById('p11-insight').innerHTML =
      '<strong>3-시냅스 네트워크 학습</strong> — 패턴 ' + patAStr + ', ' + patBStr + ', Rest(f=0)' +
      '<br>이론적 z̄ = [' + zBars.map(v => v.toFixed(3)).join(', ') + ']' +
      ' &nbsp;|&nbsp; 시뮬레이션 최종 z = [' + finalZ.map(v => v.toFixed(3)).join(', ') + ']' +
      '<br>z 벡터는 게이트가 열린 구간에서 본 <strong>입력 패턴들의 가중 시간 평균</strong>을 저장한다.' +
      ' 각 시냅스가 독립적으로 자신의 목표를 추적 — 이것이 <strong>분산 패턴 학습</strong>(Grossberg, 1960s).';
    // τ display for pattern seq
    const tauParts = p11_patterns.filter(p => p.f > 0).map(p =>
      p.name + ': τ = 1/(M·f) = 1/(' + M + '·' + p.f + ') = <strong>' + (1/(M*p.f)).toFixed(1) + 's</strong>');
    document.getElementById('p11-tau-display').innerHTML =
      '현재 시간상수 — ' + tauParts.join(' &nbsp;|&nbsp; ') +
      ' &nbsp;|&nbsp; Rest: <strong>τ = ∞</strong> (게이트 닫힘, 학습 정지)';
  } else {
    // ===== SINGLE-SYNAPSE MODE (sliders) =====
    const totalTime = 30, plotPoints = 300;
    const dtPlot = totalTime / plotPoints;
    const subSteps = 20, dtSub = dtPlot / subSteps;
    const ts = [], yArr = [], zArr = [], fxArr = [], hxArr = [];
    const dydt_total = [], dydt_prod = [], dydt_dep = [];
    const dzdt_total = [], dzdt_gate = [], dzdt_err = [];
    let y = K, z = 0;
    const fx = sliderFx, hx = sliderHx;
    for (let s = 0; s <= plotPoints; s++) {
      ts.push(s * dtPlot);
      yArr.push(y); zArr.push(z);
      fxArr.push(fx / 10); hxArr.push(hx);
      const prod = H * (K - y), dep = -L * fx * y;
      dydt_total.push(prod + dep); dydt_prod.push(prod); dydt_dep.push(dep);
      const gate = M * fx, err = hx - z;
      dzdt_total.push(gate * err); dzdt_gate.push(gate); dzdt_err.push(err);
      for (let ss = 0; ss < subSteps; ss++) {
        y += (H * (K - y) - L * fx * y) * dtSub;
        z += (M * fx * (hx - z)) * dtSub;
      }
    }

    Plotly.react('p11-plot-deriv', [
      { x: ts, y: dydt_total, mode: 'lines', name: 'dy/dt', line: { color: '#4a7fb5', width: 2.5 } },
      { x: ts, y: dydt_prod, mode: 'lines', name: 'H(K-y)', line: { color: '#4a7fb5', width: 1, dash: 'dash' }, opacity: 0.4 },
      { x: ts, y: dydt_dep, mode: 'lines', name: '-Lf(x)y', line: { color: '#4a7fb5', width: 1, dash: 'dot' }, opacity: 0.4 },
      { x: ts, y: dzdt_total, mode: 'lines', name: 'dz/dt', line: { color: '#bf6a42', width: 2.5 } },
      { x: ts, y: dzdt_gate.map(g => g > 0 ? g : null), mode: 'lines', name: 'Mf(x)', line: { color: '#bf6a42', width: 1, dash: 'dash' }, opacity: 0.4 },
      { x: ts, y: dzdt_err, mode: 'lines', name: 'h-z', line: { color: '#bf6a42', width: 1, dash: 'dot' }, opacity: 0.4 },
    ], {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'Rate', gridcolor: '#eae6e0', zeroline: true, zerolinecolor: '#ccc', zerolinewidth: 1.5 },
    }, { responsive: true, displayModeBar: false });

    // --- Gate chart (single synapse) ---
    const gateVal = M * fx;
    const gateArr = ts.map(() => fx);
    const gateLearning = dzdt_total; // already computed: M*fx*(hx-z)
    Plotly.react('p11-plot-gate', [
      { x: ts, y: gateArr, mode: 'lines', name: 'f(x) gate', line: { color: '#9b9590', width: 2.5 },
        fill: 'tozeroy', fillcolor: fx > 0 ? 'rgba(155,149,144,0.12)' : 'transparent' },
      { x: ts, y: gateLearning, mode: 'lines', name: 'dz/dt = Mf(h-z)', line: { color: '#bf6a42', width: 2.5 }, yaxis: 'y2' },
      { x: ts, y: ts.map(() => 0), mode: 'lines', line: { color: '#bf6a4244', width: 1 }, yaxis: 'y2', showlegend: false },
    ], {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'f(x) gate', gridcolor: '#eae6e0', range: [0, Math.max(fx * 1.3, 1)], zeroline: false },
      yaxis2: { title: 'dz/dt', overlaying: 'y', side: 'right', gridcolor: 'transparent', zeroline: false, showgrid: false },
      annotations: [
        { x: totalTime * 0.5, y: fx * 0.5, text: fx > 0 ? 'Gate OPEN (f=' + fx.toFixed(1) + ')' : 'Gate CLOSED (f=0)',
          showarrow: false, font: { size: 12, color: fx > 0 ? '#5a9a72' : '#c44', weight: 'bold' } },
        { x: totalTime * 0.5, y: 0, yref: 'y2', text: 'Mf(x) = ' + gateVal.toFixed(3),
          showarrow: false, font: { size: 10, color: '#bf6a42' }, yshift: -15 },
      ],
    }, { responsive: true, displayModeBar: false });

    const yMaxTime = Math.max(K * 1.2, hx * 1.2, 2);
    Plotly.react('p11-plot-time', [
      { x: ts, y: yArr, mode: 'lines', name: 'y (MTM)', line: { color: '#4a7fb5', width: 2.5 } },
      { x: ts, y: zArr, mode: 'lines', name: 'z (LTM)', line: { color: '#bf6a42', width: 2.5 } },
      { x: ts, y: fxArr, mode: 'lines', name: 'f(x)/10', line: { color: '#9b9590', width: 1, dash: 'dot' } },
      { x: ts, y: hxArr, mode: 'lines', name: 'h(x) target', line: { color: '#c49a3c', width: 1, dash: 'dash' } },
    ], {
      ...layoutBase,
      xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [0, totalTime], fixedrange: true },
      yaxis: { title: 'Value', gridcolor: '#eae6e0', range: [0, yMaxTime], zeroline: false },
      shapes: [
        { type: 'rect', x0: 0, x1: totalTime, y0: K, y1: yMaxTime, fillcolor: 'rgba(74,127,181,0.06)', line: { width: 0 } },
        { type: 'line', x0: 0, x1: totalTime, y0: K, y1: K, line: { color: '#4a7fb544', width: 1.5, dash: 'dash' } },
      ],
      annotations: [{ x: totalTime * 0.95, y: K, text: 'K=' + K, showarrow: false, font: { size: 10, color: '#4a7fb5' }, yshift: 10 }],
    }, { responsive: true, displayModeBar: false });

    const fxRange = [];
    for (let f = 0; f <= 10; f += 0.1) fxRange.push(f);
    const eqY = fxRange.map(f => H * K / (H + L * f));
    const eqZ_x = fxRange.filter(f => f > 0);
    const eqZ_y = eqZ_x.map(() => hx);
    const yStarNow = H * K / (H + L * fx);
    const eqYmax = Math.max(K * 1.3, hx * 1.3, 2);
    const tracesEq = [
      { x: [fx, fx], y: [0, eqYmax], mode: 'lines', line: { color: '#9b959088', width: 2, dash: 'dot' }, showlegend: false, hoverinfo: 'skip' },
      { x: fxRange, y: eqY, mode: 'lines', name: 'y* = HK/(H+Lf)', line: { color: '#4a7fb5', width: 2.5 } },
      { x: eqZ_x, y: eqZ_y, mode: 'lines', name: 'z* = h(x)', line: { color: '#bf6a42', width: 2.5 } },
      { x: [fx], y: [yStarNow], mode: 'markers+text', name: 'y*',
        marker: { color: '#4a7fb5', size: 9, symbol: 'circle', line: { color: '#fff', width: 1.5 } },
        text: [yStarNow.toFixed(2)], textposition: 'top right', textfont: { size: 10, color: '#4a7fb5' }, showlegend: false },
    ];
    if (fx > 0) {
      tracesEq.push({ x: [fx], y: [hx], mode: 'markers+text', name: 'z*',
        marker: { color: '#bf6a42', size: 9, symbol: 'circle', line: { color: '#fff', width: 1.5 } },
        text: [hx.toFixed(2)], textposition: 'bottom right', textfont: { size: 10, color: '#bf6a42' }, showlegend: false });
    }
    Plotly.react('p11-plot-eq', tracesEq, {
      ...layoutBase,
      xaxis: { title: 'f(x)', gridcolor: '#eae6e0', zeroline: false, range: [0, 10], fixedrange: true },
      yaxis: { title: 'Equilibrium', gridcolor: '#eae6e0', range: [0, eqYmax], zeroline: false },
      dragmode: false,
    }, { responsive: true, displayModeBar: false });

    const zStarText = fx > 0 ? hx.toFixed(2) : '보존 (f=0)';
    const signal = fx > 0 ? yStarNow * hx : 0;
    document.getElementById('p11-insight').innerHTML =
      'MTM 평형: <strong>y* = ' + yStarNow.toFixed(2) + '</strong> (K=' + K + ') &nbsp;|&nbsp; ' +
      'LTM 평형: <strong>z* = ' + zStarText + '</strong> &nbsp;|&nbsp; ' +
      '시냅스 출력: <strong>y*·z* = ' + signal.toFixed(2) + '</strong>' +
      (fx === 0 ? '<br>f(x)=0: MTM이 K로 회복, LTM 학습 정지 — 기억 보존 상태' : '') +
      (yStarNow < K * 0.3 ? '<br>MTM이 크게 소진됨! 높은 f(x)로 인한 habituation 효과' : '');
    // τ display for single synapse
    const tauNow = fx > 0 ? (1/(M*fx)) : Infinity;
    document.getElementById('p11-tau-display').innerHTML = fx > 0
      ? '현재 시간상수: <strong>τ = 1/(M·f) = 1/(' + M + '·' + fx.toFixed(1) + ') = ' + tauNow.toFixed(1) + 's</strong> — 최근 ~' + tauNow.toFixed(0) + '초의 입력을 지수적으로 가중'
      : '현재 시간상수: <strong>τ = ∞</strong> (f=0, 게이트 닫힘) — 학습 정지, 기억 완벽 보존';
  }
}

['p11-slider-fx', 'p11-slider-hx'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById('p11-val-fx').textContent = parseFloat(document.getElementById('p11-slider-fx').value).toFixed(1);
    document.getElementById('p11-val-hx').textContent = parseFloat(document.getElementById('p11-slider-hx').value).toFixed(1);
    updatePage11Analysis();
  });
});

['p11-slider-H', 'p11-slider-K', 'p11-slider-L', 'p11-slider-M'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById('p11-val-H').textContent = parseFloat(document.getElementById('p11-slider-H').value).toFixed(2);
    document.getElementById('p11-val-K').textContent = parseFloat(document.getElementById('p11-slider-K').value).toFixed(1);
    document.getElementById('p11-val-L').textContent = parseFloat(document.getElementById('p11-slider-L').value).toFixed(2);
    document.getElementById('p11-val-M').textContent = parseFloat(document.getElementById('p11-slider-M').value).toFixed(2);
    updatePage11Analysis();
  });
  document.getElementById(id).addEventListener('change', () => {
    const K = parseFloat(document.getElementById('p11-slider-K').value);
    p11_data.y = K;
    p11_data.z = 0;
    p11_data.t = 0;
    p11_data.ts = []; p11_data.ys = []; p11_data.zs = []; p11_data.fs = []; p11_data.hs = [];
  });
});

// =============================================
// Real-time dynamics (bottom of fig2_09)
// =============================================
let p09rt_anim = null;
let p09rt_running = false;
let p09rt_input_stopped = false;
let p09rt_state = { xa: 0, xs: 0, t: 0, tsArr: [], xaArr: [], xsArr: [] };
let p09rt_pulse = { active: false, endT: 0, peakI: 0 };

function p09rt_getParams() {
  const raw = parseFloat(document.getElementById('p09rt-slider-I').value);
  const pI = Math.pow(10, (raw / 1000) * 6 - 3);
  const pA = parseFloat(document.getElementById('p09-slider-A').value);
  const pB = parseFloat(document.getElementById('p09-slider-B').value);
  return { pI, pA, pB };
}

function p09rt_reset() {
  const { pI } = p09rt_getParams();
  p09rt_state = { xa: 0, xs: 0, t: 0, tsArr: [0], xaArr: [0], xsArr: [0] };
  const disp = pI < 0.1 ? pI.toExponential(1) : pI < 10 ? pI.toFixed(2) : pI.toFixed(1);
  document.getElementById('p09rt-val-I').textContent = disp;
  p09rt_renderNumbers({ xa: 0, xs: 0, dxa: 0, dxs: 0, pI, pA: p09rt_getParams().pA, pB: p09rt_getParams().pB });
}

function p09rt_renderNumbers({ xa, xs, dxa, dxs, pI, pA, pB }) {
  const fmt = v => (v >= 0 ? '+' : '') + v.toFixed(3);
  document.getElementById('p09rt-xa').textContent = xa.toFixed(3);
  document.getElementById('p09rt-dxa').textContent = fmt(dxa);
  document.getElementById('p09rt-xs').textContent = xs.toFixed(3);
  document.getElementById('p09rt-dxs').textContent = fmt(dxs);
  document.getElementById('p09rt-decay-a').textContent = fmt(-pA * xa);
  document.getElementById('p09rt-input-a').textContent = fmt(pI);
  // Show live I in slider label during pulse
  if (p09rt_pulse.active) {
    const disp = pI < 0.1 ? pI.toExponential(1) : pI < 10 ? pI.toFixed(2) : pI.toFixed(1);
    document.getElementById('p09rt-val-I').textContent = disp;
  }
  document.getElementById('p09rt-decay-s').textContent = fmt(-pA * xs);
  document.getElementById('p09rt-bxi').textContent = fmt((pB - xs) * pI);
}

function p09rt_getSpeed() {
  const v = parseFloat(document.getElementById('p09rt-slider-speed').value);
  // Map 1-100 → 0.02x - 5x (log scale)
  const speed = Math.pow(10, (v / 100) * 2.7 - 1.7); // 0.02 to ~5
  document.getElementById('p09rt-val-speed').textContent = speed < 1 ? speed.toFixed(2) + 'x' : speed.toFixed(1) + 'x';
  return speed;
}

function p09rt_step() {
  if (!p09rt_running) return;
  const { pA, pB } = p09rt_getParams();
  const s = p09rt_state;
  const speed = p09rt_getSpeed();
  const dt = 0.05 * speed;

  // Pulse logic: use peakI during pulse, then exponential decay
  let pI;
  if (p09rt_pulse.active) {
    if (s.t < p09rt_pulse.endT) {
      pI = p09rt_pulse.peakI;
    } else {
      // Decay phase: exponential decay toward 0
      const elapsed = s.t - p09rt_pulse.endT;
      pI = p09rt_pulse.peakI * Math.exp(-elapsed * 1.5);
      if (pI < 0.001) { pI = 0; p09rt_pulse.active = false; const pb = document.getElementById('p09rt-btn-pulse'); pb.textContent = '[~] Pulse'; pb.classList.remove('p09rt-pulse-btn'); }
    }
  } else {
    pI = p09rt_input_stopped ? 0 : p09rt_getParams().pI;
  }
  const subSteps = Math.max(10, Math.ceil((pA + pI) * dt * 5));
  const dtSub = dt / subSteps;
  for (let i = 0; i < subSteps; i++) {
    s.xa += (-pA * s.xa + pI) * dtSub;
    s.xs += (-pA * s.xs + (pB - s.xs) * pI) * dtSub;
  }
  s.t += dt;

  const dxa = -pA * s.xa + pI;
  const dxs = -pA * s.xs + (pB - s.xs) * pI;

  s.tsArr.push(s.t);
  s.xaArr.push(s.xa);
  s.xsArr.push(s.xs);

  // Keep 600 points max
  if (s.tsArr.length > 600) { s.tsArr.shift(); s.xaArr.shift(); s.xsArr.shift(); }

  const yMax = pB * 1.5;
  const WINDOW = Math.max(10, 30 * speed); // scale window with speed
  const xMin = Math.max(0, s.t - WINDOW);
  const xMax = Math.max(xMin + WINDOW, s.t + 0.5);
  const traces = [];
  if (p09_showAdd) traces.push({ x: s.tsArr.slice(), y: s.xaArr.slice(), mode: 'lines', name: 'Additive', line: { color: '#c06058', width: 2 } });
  if (p09_showShunt) traces.push({ x: s.tsArr.slice(), y: s.xsArr.slice(), mode: 'lines', name: 'Shunting', line: { color: '#5a9a72', width: 2 } });

  Plotly.react('p09rt-plot', traces, {
    paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { l: 48, r: 16, t: 8, b: 40 },
    xaxis: { title: 'Time', gridcolor: '#eae6e0', zeroline: false, range: [xMin, xMax], fixedrange: true },
    yaxis: { title: 'x(t)', gridcolor: '#eae6e0', range: [0, yMax], zeroline: false, fixedrange: true },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, font: { size: 10 } },
    shapes: [
      { type: 'rect', x0: xMin, x1: xMax, y0: pB, y1: yMax,
        fillcolor: 'rgba(160,160,160,0.12)', line: { width: 0 } },
      { type: 'line', x0: xMin, x1: xMax, y0: pB, y1: pB,
        line: { color: '#5a9a7266', width: 1.5, dash: 'dash' } }
    ],
    annotations: [
      { x: xMin + (xMax - xMin) * 0.5, y: pB * 1.5, text: 'x > B : physically impossible', showarrow: false,
        font: { size: 10, color: '#aaa' }, bgcolor: 'rgba(0,0,0,0)' },
      { x: xMin + (xMax - xMin) * 0.97, y: pB, text: 'B=' + pB, showarrow: false,
        font: { size: 10, color: '#5a9a72' }, yshift: 10, xanchor: 'right' }
    ]
  }, { responsive: true, displayModeBar: false });

  p09rt_renderNumbers({ xa: s.xa, xs: s.xs, dxa, dxs, pI, pA, pB });
}

function initPage09rt() {
  p09rt_reset();
  p09rt_anim = setInterval(p09rt_step, 50);

  document.getElementById('p09rt-slider-I').addEventListener('input', () => {
    const { pI } = p09rt_getParams();
    const disp = pI < 0.1 ? pI.toExponential(1) : pI < 10 ? pI.toFixed(2) : pI.toFixed(1);
    document.getElementById('p09rt-val-I').textContent = disp;
  });
  document.getElementById('p09rt-slider-speed').addEventListener('input', p09rt_getSpeed);
  document.getElementById('p09rt-btn-pulse').addEventListener('click', function() {
    const { pI } = p09rt_getParams();
    const pulseDuration = 2; // sim-time units
    p09rt_pulse = { active: true, endT: p09rt_state.t + pulseDuration, peakI: pI };
    this.textContent = '[~] Pulsing...';
    this.classList.add('p09rt-pulse-btn');
  });
  document.getElementById('p09rt-btn-reset').addEventListener('click', p09rt_reset);
  document.getElementById('p09rt-btn-pause').addEventListener('click', function() {
    if (!p09rt_running) {
      // First click: start simulation
      p09rt_running = true;
      p09rt_input_stopped = false;
      this.classList.remove('p09rt-start-blink');
      this.style.border = '1px solid var(--border)';
      this.style.color = 'var(--text)';
      this.textContent = '[||] Input Off';
    } else {
      p09rt_input_stopped = !p09rt_input_stopped;
      if (p09rt_input_stopped) {
        p09rt_pulse.active = false;
        const pb2 = document.getElementById('p09rt-btn-pulse'); pb2.textContent = '[~] Pulse'; pb2.classList.remove('p09rt-pulse-btn');
      }
      this.textContent = p09rt_input_stopped ? '[>] Input On' : '[||] Input Off';
    }
  });
}

// Restore last visited page + scroll position
(function() {
  let startPage = 'fig2_09';
  try {
    const saved = localStorage.getItem('grossberg_page');
    if (saved && document.getElementById('page-' + saved)) startPage = saved;
  } catch(e) {}
  switchPage(startPage);
  try {
    const savedY = localStorage.getItem('grossberg_scrollY');
    if (savedY) requestAnimationFrame(() => window.scrollTo(0, parseInt(savedY, 10)));
  } catch(e) {}
})();

window.addEventListener('scroll', function() {
  try { localStorage.setItem('grossberg_scrollY', window.scrollY); } catch(e) {}
}, { passive: true });

// Equation segment hover highlighting
document.querySelectorAll('[data-hl]').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const t = document.getElementById(card.dataset.hl);
    if (t) t.classList.add(card.dataset.hlClass || 'eq-seg-hl-green');
  });
  card.addEventListener('mouseleave', () => {
    const t = document.getElementById(card.dataset.hl);
    if (t) t.classList.remove('eq-seg-hl-green', 'eq-seg-hl-purple', 'eq-seg-hl-red', 'eq-seg-hl-blue', 'eq-seg-hl-accent');
  });
});
</script>
</body>
</html>
