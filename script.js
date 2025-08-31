(() => {
  'use strict';

  const boardEl = document.getElementById('board');
  const nInput = document.getElementById('nInput');
  const newBoardBtn = document.getElementById('newBoardBtn');
  const resetBtn = document.getElementById('resetBtn');
  const checkBtn = document.getElementById('checkBtn');
  const hintBtn = document.getElementById('hintBtn');
  const solveOneBtn = document.getElementById('solveOneBtn');
  const findAllBtn = document.getElementById('findAllBtn');
  const statusEl = document.getElementById('status');

  const statN = document.getElementById('statN');
  const statN2 = document.getElementById('statN2');
  const statPlaced = document.getElementById('statPlaced');
  const statConflicts = document.getElementById('statConflicts');
  const statSolutions = document.getElementById('statSolutions');
  const statCapped = document.getElementById('statCapped');

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const applyBtn = document.getElementById('applyBtn');

  const githubLink = document.getElementById('githubLink');
  githubLink.href = "https://github.com/pezzaliapp/N-Queens";

  let N = 8;
  let board = new Array(N).fill(-1);
  let highlightConflicts = true;

  let foundSolutions = [];
  let capped = false;
  let currentSolutionIndex = -1;
  const MAX_SOL_STORE = 256;

  // PWA install prompt
  let deferredPrompt = null;
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  function setN(newN) {
    N = Math.max(4, Math.min(14, newN|0));
    nInput.value = N;
    board = new Array(N).fill(-1);
    foundSolutions = [];
    currentSolutionIndex = -1;
    capped = false;
    render();
    updateStats();
    setStatus(`Nuova scacchiera ${N}×${N} pronta.`);
  }

  function render() {
    boardEl.style.setProperty('--n', N);
    boardEl.innerHTML = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell' + (((r + c) % 2 === 1) ? ' dark' : '');
        const isQueen = board[r] === c;
        if (isQueen) cell.classList.add('queen');
        if (highlightConflicts && isQueen && hasConflict(r, c, board)) {
          cell.classList.add('conflict');
        }
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `riga ${r+1}, colonna ${c+1}`);
        cell.addEventListener('click', () => onCellClick(r, c));
        boardEl.appendChild(cell);
      }
    }
    prevBtn.disabled = nextBtn.disabled = applyBtn.disabled = (foundSolutions.length === 0);
  }

  function onCellClick(r, c) {
    if (board[r] === c) board[r] = -1;
    else board[r] = c;
    foundSolutions = [];
    currentSolutionIndex = -1;
    capped = false;
    render();
    updateStats();
  }

  function updateStats() {
    statN.textContent = String(N);
    statN2.textContent = String(N);
    const placed = board.filter(x => x !== -1).length;
    statPlaced.textContent = String(placed);
    statConflicts.textContent = String(totalConflicts(board));
    statSolutions.textContent = String(foundSolutions.length);
    statCapped.textContent = capped ? '(limite raggiunto)' : '';
  }

  function setStatus(msg) { statusEl.textContent = msg; }

  function hasConflict(r, c, brd) {
    for (let rr = 0; rr < N; rr++) {
      if (rr === r) continue;
      const cc = brd[rr];
      if (cc === -1) continue;
      if (cc === c) return true;
      if (Math.abs(rr - r) === Math.abs(cc - c)) return true;
    }
    return false;
  }

  function totalConflicts(brd) {
    let count = 0;
    for (let r1 = 0; r1 < N; r1++) {
      const c1 = brd[r1];
      if (c1 === -1) continue;
      for (let r2 = r1 + 1; r2 < N; r2++) {
        const c2 = brd[r2];
        if (c2 === -1) continue;
        if (c1 === c2) count++;
        else if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) count++;
      }
    }
    return count;
  }

  function isSafeRow(r, brd) {
    const c = brd[r];
    if (c === -1) return true;
    for (let rr = 0; rr < r; rr++) {
      const cc = brd[rr];
      if (cc === -1) continue;
      if (cc === c) return false;
      if (Math.abs(rr - r) === Math.abs(cc - c)) return false;
    }
    return true;
  }

  // Backtracking: find one solution compatible with current board
  function solveOneFromPartial() {
    const b = board.slice();

    function nextRow(start) {
      for (let i = start; i < N; i++) {
        if (b[i] === -1) return i;
        if (!isSafeRow(i, b)) return -2;
      }
      return N;
    }

    function backtrack(rowStart) {
      const r0 = nextRow(rowStart);
      if (r0 === -2) return false;
      if (r0 === N) return true;
      for (let c = 0; c < N; c++) {
        b[r0] = c;
        if (isSafeRow(r0, b)) {
          if (backtrack(r0 + 1)) return true;
        }
      }
      b[r0] = -1;
      return false;
    }

    if (backtrack(0)) return b;
    return null;
  }

  // Backtracking: collect up to MAX_SOL_STORE solutions from scratch
  function findAllSolutions(limit=MAX_SOL_STORE) {
    const sol = [];
    const b = new Array(N).fill(-1);

    function backtrack(r) {
      if (sol.length >= limit) return;
      if (r === N) { sol.push(b.slice()); return; }
      for (let c = 0; c < N; c++) {
        let ok = true;
        for (let rr = 0; rr < r; rr++) {
          const cc = b[rr];
          if (cc === c || Math.abs(rr - r) === Math.abs(cc - c)) { ok = false; break; }
        }
        if (!ok) continue;
        b[r] = c;
        backtrack(r + 1);
      }
      b[r] = -1;
    }

    backtrack(0);
    return {solutions: sol, capped: (sol.length >= limit)};
  }

  newBoardBtn.addEventListener('click', () => setN(nInput.valueAsNumber || 8));
  nInput.addEventListener('change', () => setN(nInput.valueAsNumber || 8));

  resetBtn.addEventListener('click', () => {
    board = new Array(N).fill(-1);
    foundSolutions = []; currentSolutionIndex = -1; capped = false;
    render(); updateStats();
    setStatus("Scacchiera svuotata.");
  });

  checkBtn.addEventListener('click', () => {
    render();
    const placed = board.filter(x => x !== -1).length;
    const conflicts = totalConflicts(board);
    if (placed === N && conflicts === 0) setStatus("✅ Perfetto! Nessun conflitto: è una soluzione valida.");
    else if (conflicts === 0) setStatus("Nessun conflitto finora. Continua a piazzare regine.");
    else setStatus(`⚠️ Ci sono ${conflicts} conflitti. Prova a spostare alcune regine.`);
  });

  hintBtn.addEventListener('click', () => {
    const sol = solveOneFromPartial();
    if (!sol) { setStatus("Nessuna soluzione compatibile con le regine già piazzate."); return; }
    let hinted = false;
    for (let r = 0; r < N; r++) {
      if (board[r] === -1) { board[r] = sol[r]; hinted = true; break; }
    }
    if (!hinted) setStatus("Hai già piazzato tutte le regine — prova 'Controlla' o 'Risolvi'.");
    else {
      render(); updateStats();
      setStatus("Mossa suggerita applicata (backtracking).");
    }
  });

  solveOneBtn.addEventListener('click', () => {
    const sol = solveOneFromPartial();
    if (!sol) { setStatus("Nessuna soluzione trovata con questa configurazione iniziale."); return; }
    board = sol.slice();
    render(); updateStats();
    setStatus("Soluzione trovata e applicata.");
  });

  findAllBtn.addEventListener('click', () => {
    setStatus("Calcolo delle soluzioni in corso…");
    setTimeout(() => {
      const {solutions, capped} = findAllSolutions();
      window._foundSolutions = solutions;
      window._capped = capped;
      if (solutions.length === 0) { setStatus(`Nessuna soluzione per N = ${N}.`); return; }
      let idx = 0;
      function preview(i) {
        boardEl.style.setProperty('--n', N);
        boardEl.innerHTML = '';
        const sol = solutions[i];
        for (let r = 0; r < N; r++) {
          for (let c = 0; c < N; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell' + (((r + c) % 2 === 1) ? ' dark' : '');
            if (sol[r] === c) cell.classList.add('queen');
            boardEl.appendChild(cell);
          }
        }
      }
      preview(0);
      prevBtn.disabled = nextBtn.disabled = applyBtn.disabled = false;
      setStatus(`Trovate ${solutions.length} soluzioni${capped ? " (limite raggiunto)" : ""}. Anteprima 1 / ${solutions.length}.`);
      prevBtn.onclick = () => { idx = (idx - 1 + solutions.length) % solutions.length; preview(idx); setStatus(`Anteprima ${idx+1} / ${solutions.length}.`); };
      nextBtn.onclick = () => { idx = (idx + 1) % solutions.length; preview(idx); setStatus(`Anteprima ${idx+1} / ${solutions.length}.`); };
      applyBtn.onclick = () => { board = solutions[idx].slice(); render(); setStatus("Soluzione applicata."); };
    }, 20);
  });

  // init
  setN(8);
})();