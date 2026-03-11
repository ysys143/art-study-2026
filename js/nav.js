/**
 * nav.js — 공통 사이드바 네비게이션 자동 생성
 * 새 시뮬레이션 추가 시 NAV_ITEMS 배열만 수정하면 됩니다.
 */

const NAV_ITEMS = [
  { fig: '2.2',  label: 'Three N\'s',            file: 'three-ns.html',            active: true  },
  { fig: '2.9',  label: 'Additive vs Shunting',   file: 'fig2_09.html',             active: true  },
  { fig: '2.11', label: 'MTM & LTM Dynamics',     file: 'fig2_11.html',             active: true  },
  { fig: '2.19', label: 'Noise-Saturation Dilemma', file: 'fig2_19.html',           active: true  },
  { fig: '2.23', label: 'Feedforward vs Recurrent', file: 'fig2_23.html', active: true },
  { fig: '2.24', label: 'Membrane Equation',      file: 'fig2_24.html',             active: true  },
  { fig: '2.25', label: 'Weber Law & Shift',      file: 'fig2_25.html',           active: true  },
  { fig: '2.27', label: 'Mudpuppy Retina',        file: 'fig2_27.html',           active: true  },
  { fig: '2.28', label: 'Adaptation Level',       file: 'fig2_28.html',  active: true },
  { fig: '2.30', label: 'Noise Suppression',      file: 'fig2_30.html',  active: true },
  { fig: '2.31', label: 'Pattern Matching',       file: 'fig2_31.html',  active: true },
  { fig: '2.33', label: 'Opposites Attract',      file: 'fig2_33.html',  active: true },
  { fig: '2.34', label: 'DOG/SOG Contours',       file: 'fig2_34.html',  active: true },
  { fig: '2.37', label: 'Modeling Methodology',   file: 'fig2_37.html',  active: true },
];

(function injectNav() {
  const container = document.getElementById('sidebar-list');

  // 현재 파일명 추출 (index.html은 빈 문자열)
  const parts   = window.location.pathname.split('/');
  const current = parts[parts.length - 1] || 'index.html';
  const isRoot  = current === 'index.html' || current === '';
  const prefix  = isRoot ? 'pages/' : '';

  // 이미지 경로 헬퍼 — 어느 페이지에서든 window.IMG('fig2_02.jpeg') 형태로 사용
  window.IMG = (filename) => (isRoot ? '' : '../') + 'images/' + filename;

  if (!container) return;

  let html = '<div class="nav-section">Simulations</div>';

  NAV_ITEMS.forEach(item => {
    const isCurrent = item.file && (current === item.file);
    if (item.file && item.active) {
      html += `
        <a href="${prefix}${item.file}" class="nav-item${isCurrent ? ' active' : ''}">
          <span class="nav-fig">${item.fig}</span>
          <span class="nav-label">${item.label}</span>
        </a>`;
    } else {
      html += `
        <div class="nav-item disabled">
          <span class="nav-fig">${item.fig}</span>
          <span class="nav-label">${item.label}</span>
        </div>`;
    }
  });

  container.innerHTML = html;
})();
