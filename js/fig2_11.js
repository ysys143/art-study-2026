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

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  initPage11();
});

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
