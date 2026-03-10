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
