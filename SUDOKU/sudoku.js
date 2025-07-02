let puzzles = [
 [
  [5,3,0,0,7,0,0,0,0],
 [6,0,0,1,9,5,0,0,0],
 [0,9,8,0,0,0,0,6,0],
 [8,0,0,0,6,0,0,0,3],
 [4,0,0,8,0,3,0,0,1],
 [7,0,0,0,2,0,0,0,6],
 [0,6,0,0,0,0,2,8,0],
 [0,0,0,4,1,9,0,0,5],
 [0,0,0,0,8,0,0,7,9]
 ]
];

let current = 0;
let initBoard, moves, solvedBoard;
const board = document.getElementById("board");
const msg = document.getElementById("message");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const nextBtn = document.getElementById("nextBtn");
const hintBtn = document.getElementById("hintBtn");
const pad = document.getElementById("numpad");

function makeBoard(idx) {
  initBoard = JSON.parse(JSON.stringify(puzzles[idx]));
  moves = [];
  solvedBoard = solveSudoku(initBoard);
  msg.textContent = "";
  nextBtn.style.display = "none";
  board.innerHTML = "";

  for (let r=0; r<9; r++) {
    for (let c=0; c<9; c++) {
      let cell = document.createElement("input");
      cell.className = "cell";
      cell.type = "text";
      cell.maxLength = 1;
      cell.dataset.r = r;
      cell.dataset.c = c;
      if (initBoard[r][c]) {
        cell.value = initBoard[r][c];
        cell.readOnly = true;
      }
      cell.addEventListener("input", putNum);
      board.appendChild(cell);
    }
  }
  drawPad();
}

function drawPad() {
  pad.innerHTML = "";
  for (let n=1; n<=9; n++) {
    let btn = document.createElement("button");
    btn.textContent = n;
    btn.className = "num-btn";
    btn.addEventListener("click", () => markSame(n));
    pad.appendChild(btn);
  }
}

function updatePad() {
  let used = {};
  let cells = document.querySelectorAll(".cell");
  cells.forEach(c => {
    let v = parseInt(c.value);
    if (v >= 1 && v <= 9) used[v] = (used[v] || 0) + 1;
  });
  pad.querySelectorAll(".num-btn").forEach(btn => {
    if (used[btn.textContent] === 9) btn.classList.add("used");
    else btn.classList.remove("used");
  });
}

function markSame(n) {
  document.querySelectorAll(".cell").forEach(c => {
    c.classList.remove("highlight");
    if (c.value == n) c.classList.add("highlight");
  });
}

function putNum(e) {
  let cell = e.target;
  let r = +cell.dataset.r, c = +cell.dataset.c;
  let val = cell.value;
  if (!/^[1-9]$/.test(val)) {
    cell.value = "";
    return;
  }
  moves.push({r, c});
  checkErrors();
  checkComplete(r, c);
  updatePad();
  checkWin();
}

function checkErrors() {
  let g = getGrid();
  let errs = new Set();
  for (let i=0; i<9; i++) {
    let row = {}, col = {};
    for (let j=0; j<9; j++) {
      let rv = g[i][j], cv = g[j][i];
      if (rv && row[rv]) { errs.add(i+'-'+j); errs.add(i+'-'+row[rv]); }
      else row[rv] = j;
      if (cv && col[cv]) { errs.add(j+'-'+i); errs.add(col[cv]+'-'+i); }
      else col[cv] = j;
    }
  }
  for (let br=0; br<3; br++) {
    for (let bc=0; bc<3; bc++) {
      let box = {};
      for (let r=0; r<3; r++) {
        for (let c=0; c<3; c++) {
          let i = br*3 + r, j = bc*3 + c;
          let v = g[i][j];
          if (v && box[v]) {
            errs.add(i+'-'+j); errs.add(box[v]);
          } else box[v] = i+'-'+j;
        }
      }
    }
  }
  document.querySelectorAll(".cell").forEach(c => {
    let k = c.dataset.r + '-' + c.dataset.c;
    c.classList.remove("error");
    if (errs.has(k)) c.classList.add("error");
  });
}

function checkComplete(r, c) {
  let g = getGrid();
  let full = true;
  for (let i=0; i<9; i++) {
    if (!g[r][i]) full = false;
  }
  if (full) highlightRow(r);
  full = true;
  for (let i=0; i<9; i++) {
    if (!g[i][c]) full = false;
  }
  if (full) highlightCol(c);
  full = true;
  let sr = Math.floor(r/3)*3, sc = Math.floor(c/3)*3;
  for (let i=0; i<3; i++) for (let j=0; j<3; j++) {
    if (!g[sr+i][sc+j]) full = false;
  }
  if (full) highlightBox(sr, sc);
}

function highlightRow(r) {
  for (let i=0; i<9; i++) getCell(r,i).classList.add("highlight");
}

function highlightCol(c) {
  for (let i=0; i<9; i++) getCell(i,c).classList.add("highlight");
}

function highlightBox(sr, sc) {
  for (let i=0; i<3; i++) for (let j=0; j<3; j++)
    getCell(sr+i, sc+j).classList.add("highlight");
}

function getGrid() {
  let g = Array.from({length:9}, () => Array(9).fill(0));
  document.querySelectorAll(".cell").forEach((c,i) => {
    let r = +c.dataset.r, v = +c.value;
    if (v >= 1 && v <= 9) g[r][+c.dataset.c] = v;
  });
  return g;
}

function getCell(r,c) {
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function checkWin() {
  if (!document.querySelector(".error") && isFilled()) {
    msg.textContent = "🎉 Congratulations! You solved the puzzle!";
    nextBtn.style.display = "inline-block";
  } else {
    msg.textContent = "";
  }
}

function isFilled() {
  let full = true;
  document.querySelectorAll(".cell").forEach(c => {
    if (!c.value) full = false;
  });
  return full;
}

undoBtn.onclick = () => {
  if (!moves.length) return;
  let {r,c} = moves.pop();
  getCell(r,c).value = "";
  checkErrors();
  updatePad();
};

clearBtn.onclick = () => {
  document.querySelectorAll(".cell").forEach(c => {
    if (!c.readOnly) c.value = "";
  });
  moves = [];
  checkErrors();
  updatePad();
};

nextBtn.onclick = () => {
  current = (current+1) % puzzles.length;
  makeBoard(current);
};

hintBtn.onclick = () => {
  let g = getGrid();
  for (let r=0; r<9; r++) {
    for (let c=0; c<9; c++) {
      if (!g[r][c]) {
        getCell(r,c).value = solvedBoard[r][c];
        moves.push({r,c});
        checkErrors();
        checkComplete(r,c);
        updatePad();
        checkWin();
        return;
      }
    }
  }
};

function solveSudoku(board) {
  let g = JSON.parse(JSON.stringify(board));
  const isSafe = (r,c,n) => {
    for (let i=0;i<9;i++)
      if (g[r][i]===n || g[i][c]===n || g[3*Math.floor(r/3)+Math.floor(i/3)][3*Math.floor(c/3)+i%3]===n)
        return false;
    return true;
  };
  const solve = () => {
    for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
      if (!g[r][c]) {
        for (let n=1;n<=9;n++) {
          if (isSafe(r,c,n)) {
            g[r][c]=n;
            if (solve()) return true;
            g[r][c]=0;
          }
        }
        return false;
      }
    }
    return true;
  };
 solve();
  return g;
}

makeBoard(current);
