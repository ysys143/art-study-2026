function initThreeNs() {

  /* ── KaTeX helpers ── */
  const tex = (id, f, d=true) => { const el = document.getElementById(id); if (el) katex.render(f, el, { throwOnError: false, displayMode: d }); };

  // N1 equations
  tex('eq-linear', String.raw`R_{\text{lin}}(c) = r \cdot c`);
  tex('eq-norm',   String.raw`R_{\text{norm}}(c) = \dfrac{r \cdot c}{c} = r`);
  tex('eq-add',    String.raw`\frac{dx_i}{dt} = -A x_i + I_i`);
  tex('eq-shunt',  String.raw`\frac{dx_i}{dt} = -A x_i + (B - x_i)\,I_i`);
  // N2 equations
  tex('eq-local',    String.raw`y_i = I_i`);
  tex('eq-nonlocal', String.raw`y_i = \dfrac{I_i}{\sigma + k\,\displaystyle\sum_j I_j}`);
  // N3 equations
  tex('eq-stat',   String.raw`\dfrac{dz}{dt} = 0 \quad (z = \mathrm{const})`);
  tex('eq-nonstat',String.raw`\dfrac{dz}{dt} = \varepsilon\bigl(-z + x(t)\bigr)`);

  /* ── Plotly base layout (라이트 테마) ── */
  const BL = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  '#faf8f5',
    font: { color: '#9b9590', size: 11, family: 'system-ui' },
    margin: { t: 16, r: 20, b: 44, l: 52 },
    xaxis: { gridcolor: '#eae6e0', zerolinecolor: '#eae6e0', linecolor: '#eae6e0' },
    yaxis: { gridcolor: '#eae6e0', zerolinecolor: '#eae6e0', linecolor: '#eae6e0' },
    legend: { bgcolor: 'rgba(0,0,0,0)', font: { size: 11 } }
  };

  /* ══════════════════════════════
     N1 — Discount the illuminant
  ══════════════════════════════ */
  function buildN1() {
    const c  = +document.getElementById('n1-c').value;
    const r  = +document.getElementById('n1-r').value;
    const cv = Array.from({ length: 100 }, (_, i) => 0.05 + i * 0.05);

    Plotly.react('plot-n1', [
      {
        x: cv, y: cv.map(v => r * v),
        name: '선형  R = r·c',
        line: { color: '#c06058', width: 2 }
      },
      {
        x: cv, y: cv.map(() => r),
        name: '비선형  R = r  (광원 할인)',
        line: { color: '#5a9a72', width: 2.5, dash: 'dot' }
      },
      {
        x: [c], y: [r * c],
        mode: 'markers', showlegend: false,
        marker: { color: '#c06058', size: 10, symbol: 'circle' }
      },
      {
        x: [c], y: [r],
        mode: 'markers', showlegend: false,
        marker: { color: '#5a9a72', size: 10, symbol: 'circle' }
      }
    ], {
      ...BL,
      xaxis: { ...BL.xaxis, title: '조명 강도 c' },
      yaxis: { ...BL.yaxis, title: '지각된 응답', range: [0, Math.max(r * 5.2, 1.2)] }
    }, { responsive: true });
  }

  document.getElementById('n1-c').addEventListener('input', function () {
    document.getElementById('n1-c-val').textContent = (+this.value).toFixed(2);
    buildN1();
  });
  document.getElementById('n1-r').addEventListener('input', function () {
    document.getElementById('n1-r-val').textContent = (+this.value).toFixed(2);
    buildN1();
  });

  buildN1();

  /* ══════════════════════════════
     N2 — Lateral inhibition
  ══════════════════════════════ */
  function buildN2() {
    const k    = +document.getElementById('n2-k').value;
    const peak = +document.getElementById('n2-peak').value;
    const n    = 9;
    const raw  = Array.from({ length: n }, (_, i) =>
      0.25 + 0.75 * Math.exp(-Math.pow(i - peak, 2) / 2.5)
    );
    const total = raw.reduce((a, b) => a + b, 0);
    const nl    = raw.map(v => v / (0.5 + k * total));
    const xs    = Array.from({ length: n }, (_, i) => i + 1);

    Plotly.react('plot-n2', [
      {
        x: xs, y: raw,
        name: '국소적 반응 (억제 없음)', type: 'bar',
        marker: { color: 'rgba(192,96,88,0.45)', line: { color: '#c06058', width: 1.5 } }
      },
      {
        x: xs, y: nl,
        name: '비국소적 반응 (측면 억제)', type: 'bar',
        marker: { color: 'rgba(74,127,181,0.55)', line: { color: '#4a7fb5', width: 1.5 } }
      }
    ], {
      ...BL,
      barmode: 'group',
      xaxis: { ...BL.xaxis, title: '세포 번호', tickvals: xs },
      yaxis: { ...BL.yaxis, title: '활동 수준', range: [0, 1.25] }
    }, { responsive: true });
  }

  document.getElementById('n2-k').addEventListener('input', function () {
    document.getElementById('n2-k-val').textContent = (+this.value).toFixed(2);
    buildN2();
  });
  document.getElementById('n2-peak').addEventListener('input', function () {
    document.getElementById('n2-peak-val').textContent = this.value;
    buildN2();
  });

  buildN2();

  /* ══════════════════════════════
     N3 — Nonstationary LTM
  ══════════════════════════════ */
  const BREAKS = [0, 60, 120, 190, 250];
  const LEVELS = [0.2, 0.8, 0.35, 0.9, 0.5];
  const T3 = 300;

  function envAt(t) {
    let v = LEVELS[0];
    for (let i = 0; i < BREAKS.length; i++) if (t >= BREAKS[i]) v = LEVELS[i];
    return v;
  }

  function buildN3() {
    const eps = +document.getElementById('n3-eps').value;
    const ts  = Array.from({ length: T3 }, (_, i) => i);
    const env = ts.map(envAt);
    const z0  = LEVELS[0];
    const zs  = [z0];
    for (let t = 1; t < T3; t++) zs.push(zs[t - 1] + eps * (-zs[t - 1] + env[t]));

    Plotly.react('plot-n3', [
      {
        x: ts, y: env,
        name: '환경 x(t) — 단계 변화',
        line: { color: '#c49a3c', width: 2, dash: 'dash' }
      },
      {
        x: ts, y: ts.map(() => z0),
        name: '정상적 가중치 z = z₀ (고정)',
        line: { color: '#c06058', width: 2, dash: 'dot' }
      },
      {
        x: ts, y: zs,
        name: 'LTM z(t) — 비정상적, 환경 추적',
        line: { color: '#5a9a72', width: 2.5 }
      }
    ], {
      ...BL,
      xaxis: { ...BL.xaxis, title: '시간 (스텝)' },
      yaxis: { ...BL.yaxis, title: '값', range: [-0.05, 1.1] }
    }, { responsive: true });
  }

  document.getElementById('n3-eps').addEventListener('input', function () {
    document.getElementById('n3-eps-val').textContent = (+this.value).toFixed(3);
    buildN3();
  });

  buildN3();
}

document.addEventListener('DOMContentLoaded', () => {
  initThreeNs();
});
