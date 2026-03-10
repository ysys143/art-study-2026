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

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  initPage09();
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
