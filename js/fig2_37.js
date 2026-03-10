// fig2_37.js — Modeling Method and Cycle
// Grossberg Ch.2, Figure 2.37 / 2.38
// Interactive SVG cycle diagram with hover highlights and step animation.

// ── Node metadata ─────────────────────────────────────────────────────────────
const NODE_INFO = {
  dp: {
    title: 'Design Principles (설계 원리) — 파란색',
    desc: '행동 데이터와 신경 데이터에서 추출한 핵심 제약들. 적절한 추상화 수준에서 포착된 생물학적 원리가 모델의 골격을 이룬다. "Art of Modeling"은 이 추출 과정 자체다.',
    color: '#4a7fb5',
  },
  model: {
    title: 'Mathematical Model & Analysis (수학적 모델) — 초록색',
    desc: '설계 원리를 수학적으로 구현한 방정식들. 분석(stability, equilibrium, dynamics)을 통해 내재된 예측을 도출한다. 이것이 사이클의 "심장"이다.',
    color: '#5a9a72',
  },
  bdata: {
    title: 'Behavioral Data (행동 데이터) — 빨간색',
    desc: '심리학 실험, 지각 현상, 학습 곡선 등 행동 수준의 관측 데이터. 모델의 설계 원리를 이끌어내는 출발점이며, 행동 예측을 검증하는 기준점이다.',
    color: '#c06058',
  },
  ndata: {
    title: 'Neural Data (신경 데이터) — 파란색',
    desc: '전기생리학, 해부학, 신경영상 등 신경 수준의 관측 데이터. 회로 구조와 세포 메커니즘이 설계 원리를 생물학적으로 제약한다.',
    color: '#4a7fb5',
  },
  bpred: {
    title: 'Behavioral Predictions (행동 예측) — 보라색',
    desc: '수학적 모델에서 도출된 행동 수준 예측. 이 예측이 새로운 행동 실험을 설계하고, 결과를 통해 모델을 검증하거나 수정한다. 사이클을 닫는 고리.',
    color: '#8c6db5',
  },
  brpred: {
    title: 'Brain Predictions (신경 예측) — 보라색',
    desc: '수학적 모델에서 도출된 신경 수준 예측. 특정 뉴런 유형, 시냅스 연결, 발화 패턴 등을 예측하여 신경과학 실험을 이끈다. 사이클을 닫는 또 다른 고리.',
    color: '#8c6db5',
  },
  tech: {
    title: 'Technological Applications (기술 응용) — 금색 (Fig 2.38 추가)',
    desc: '모든 단계에서 자율 지능 시스템 설계에 기여한다. 수학적 모델의 원리를 컴퓨터 비전, 로보틱스, 적응 시스템 등에 직접 적용. 예측 검증을 기다릴 필요 없이 즉시 파생된다.',
    color: '#c49a3c',
  },
};

// ── Arrow-to-node connections map ─────────────────────────────────────────────
// Each entry: which nodes are connected by this arrow
const ARROW_CONNECTIONS = {
  'arrow-bdata-dp':    ['bdata', 'dp'],
  'arrow-ndata-dp':    ['ndata', 'dp'],
  'arrow-dp-model':    ['dp',    'model'],
  'arrow-model-bdata': ['model', 'bdata'],
  'arrow-model-ndata': ['model', 'ndata'],
  'arrow-model-bpred': ['model', 'bpred'],
  'arrow-model-brpred':['model', 'brpred'],
  'arrow-bpred-bdata': ['bpred', 'bdata'],
  'arrow-brpred-ndata':['brpred','ndata'],
  'arrow-model-tech':  ['model', 'tech'],
};

// ── Animation sequence (node IDs in cycle order) ──────────────────────────────
const ANIM_STEPS = [
  { node: 'bdata',  label: '① 행동 데이터 수집' },
  { node: 'ndata',  label: '② 신경 데이터 수집' },
  { node: 'dp',     label: '③ 설계 원리 추출 (Art of Modeling)' },
  { node: 'model',  label: '④ 수학적 모델 구축 및 분석' },
  { node: 'bpred',  label: '⑤ 행동 예측 도출' },
  { node: 'brpred', label: '⑥ 신경 예측 도출' },
  { node: 'tech',   label: '⑦ 기술 응용 파생 (all stages)' },
  { node: 'bdata',  label: '⑧ 예측 검증 → 사이클 반복 ↺' },
];

// ── State ─────────────────────────────────────────────────────────────────────
let animTimer = null;
let animStep = 0;

// ── Helper: get all arrow IDs connected to a node ────────────────────────────
function getConnectedArrows(nodeId) {
  return Object.entries(ARROW_CONNECTIONS)
    .filter(([, nodes]) => nodes.includes(nodeId))
    .map(([arrowId]) => arrowId);
}

// ── Highlight a node and its connected arrows ─────────────────────────────────
function highlightNode(nodeId) {
  const allNodes  = document.querySelectorAll('.cycle-node');
  const allArrows = document.querySelectorAll('.cycle-arrow');
  const connected = getConnectedArrows(nodeId);

  allNodes.forEach(n => {
    const id = n.id.replace('node-', '');
    n.classList.remove('highlighted', 'dimmed');
    if (id === nodeId) {
      n.classList.add('highlighted');
    } else {
      n.classList.add('dimmed');
    }
  });

  allArrows.forEach(a => {
    a.classList.remove('highlighted', 'dimmed');
    if (connected.includes(a.id)) {
      a.classList.add('highlighted');
    } else {
      a.classList.add('dimmed');
    }
  });

  // Update info panel
  const info = NODE_INFO[nodeId];
  if (info) {
    const titleEl = document.getElementById('node-info-title');
    const descEl  = document.getElementById('node-info-desc');
    if (titleEl) {
      titleEl.textContent = info.title;
      titleEl.style.color = info.color;
    }
    if (descEl) descEl.textContent = info.desc;
  }
}

// ── Reset all highlights ──────────────────────────────────────────────────────
function resetHighlights() {
  document.querySelectorAll('.cycle-node').forEach(n => {
    n.classList.remove('highlighted', 'dimmed');
  });
  document.querySelectorAll('.cycle-arrow').forEach(a => {
    a.classList.remove('highlighted', 'dimmed');
  });

  const titleEl = document.getElementById('node-info-title');
  const descEl  = document.getElementById('node-info-desc');
  if (titleEl) {
    titleEl.textContent = '노드를 hover하면 설명이 여기에 표시됩니다.';
    titleEl.style.color = '';
  }
  if (descEl) descEl.textContent = '각 노드의 역할과 사이클 내 위치를 확인하세요.';
}

// ── Animation: step through cycle ─────────────────────────────────────────────
function animTick() {
  const step = ANIM_STEPS[animStep % ANIM_STEPS.length];
  highlightNode(step.node);
  const label = document.getElementById('anim-step-label');
  if (label) label.textContent = step.label;
  animStep++;
}

function startAnimation() {
  if (animTimer) return;
  animStep = 0;
  animTick();
  animTimer = setInterval(animTick, 1400);

  const btnStart = document.getElementById('btn-anim-start');
  const btnStop  = document.getElementById('btn-anim-stop');
  if (btnStart) btnStart.style.display = 'none';
  if (btnStop)  btnStop.style.display  = '';
  const stopBtn = document.getElementById('btn-anim-stop');
  if (stopBtn) stopBtn.classList.add('active');
}

function stopAnimation() {
  if (animTimer) {
    clearInterval(animTimer);
    animTimer = null;
  }
  animStep = 0;
  resetHighlights();

  const btnStart = document.getElementById('btn-anim-start');
  const btnStop  = document.getElementById('btn-anim-stop');
  if (btnStart) btnStart.style.display = '';
  if (btnStop)  btnStop.style.display  = 'none';
  if (btnStop)  btnStop.classList.remove('active');

  const label = document.getElementById('anim-step-label');
  if (label) label.textContent = '';
}

// ── Chapter summary table row hover ───────────────────────────────────────────
function setupTableHover() {
  const rows = document.querySelectorAll('#ch-summary-table tbody tr');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      rows.forEach(r => { if (r !== row && !r.classList.contains('active-row')) r.style.background = ''; });
    });
  });
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Node hover / click
  document.querySelectorAll('.cycle-node').forEach(nodeEl => {
    const nodeId = nodeEl.getAttribute('data-node');

    nodeEl.addEventListener('mouseenter', () => {
      if (!animTimer) highlightNode(nodeId);
    });
    nodeEl.addEventListener('mouseleave', () => {
      if (!animTimer) resetHighlights();
    });
    nodeEl.addEventListener('click', () => {
      if (animTimer) stopAnimation();
      highlightNode(nodeId);
    });
  });

  // Animation buttons
  const btnStart = document.getElementById('btn-anim-start');
  const btnStop  = document.getElementById('btn-anim-stop');
  if (btnStart) btnStart.addEventListener('click', startAnimation);
  if (btnStop)  btnStop.addEventListener('click',  stopAnimation);

  // Table hover
  setupTableHover();
});
