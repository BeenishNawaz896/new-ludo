// In-memory user store
const users = {};
let currentUser = null;

function signup() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (users[u]) {
    document.getElementById('loginStatus').innerText = "User already exists.";
    return;
  }
  users[u] = p;
  document.getElementById('loginStatus').innerText = "Signup successful!";
}

function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (users[u] && users[u] === p) {
    currentUser = u;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('gameSection').classList.remove('hidden');
    initGame();
  } else {
    document.getElementById('loginStatus').innerText = "Invalid login.";
  }
}

const boardSize = 11;
const trackCells = generateCrossTrack();
const homePosition = trackCells.length;

const players = [
  { id: 'user', name: 'You', tokens: [-1, -1, -1, -1], color: 'user' },
  { id: 'bot1', name: 'Bot 1', tokens: [-1, -1, -1, -1], color: 'bot1' },
  { id: 'bot2', name: 'Bot 2', tokens: [-1, -1, -1, -1], color: 'bot2' },
  { id: 'bot3', name: 'Bot 3', tokens: [-1, -1, -1, -1], color: 'bot3' }
];

let currentPlayerIndex = 0;

function initGame() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  // Create 11x11 grid
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.xy = `${x}-${y}`;
      // Highlight simple home areas
      if (y < 4 && x < 4) cell.classList.add('home','bot1');
      if (y < 4 && x > 6) cell.classList.add('home','bot2');
      if (y > 6 && x < 4) cell.classList.add('home','bot3');
      if (y > 6 && x > 6) cell.classList.add('home','user');
      board.appendChild(cell);
    }
  }
  updateBoard();
  document.getElementById('status').innerText = `${players[currentPlayerIndex].name}'s turn.`;
}

function generateCrossTrack() {
  // Simplified: a straight path around the edges (placeholder logic)
  const cells = [];
  // Top row left to right
  for (let x = 0; x < boardSize; x++) cells.push(`${x}-0`);
  // Right column down
  for (let y = 1; y < boardSize; y++) cells.push(`${boardSize -1}-${y}`);
  // Bottom row right to left
  for (let x = boardSize -2; x >=0; x--) cells.push(`${x}-${boardSize -1}`);
  // Left column up
  for (let y = boardSize -2; y>0; y--) cells.push(`0-${y}`);
  return cells;
}

function updateBoard() {
  document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = '');
  players.forEach(player => {
    player.tokens.forEach((pos, idx) => {
      if (pos >=0 && pos < trackCells.length) {
        const coords = trackCells[pos].split('-');
        const selector = `.cell[data-xy="${coords[0]}-${coords[1]}"]`;
        const cell = document.querySelector(selector);
        if (cell) {
          const token = document.createElement('div');
          token.className = 'token ' + player.color;
          token.innerText = idx +1;
          cell.appendChild(token);
        }
      }
    });
  });
}

function rollDice() {
  const diceEl = document.getElementById('dice');
  diceEl.classList.add('roll');
  setTimeout(() => diceEl.classList.remove('roll'),500);

  const player = players[currentPlayerIndex];
  const dice = Math.floor(Math.random()*6)+1;
  diceEl.innerText = dice;
  document.getElementById('status').innerText = `${player.name} rolled a ${dice}.`;

  setTimeout(() => {
    if (player.id === 'user') {
      userMove(player,dice);
    } else {
      botMove(player,dice);
    }
  },500);
}

function userMove(player,dice) {
  let moved = false;
  for (let i=0;i<player.tokens.length;i++) {
    if (player.tokens[i]===-1 && dice===6) {
      animateMove(player,i,0);
      moved=true;
      break;
    }
  }
  if (!moved) {
    for (let i=0;i<player.tokens.length;i++) {
      if (player.tokens[i]>=0 && player.tokens[i]+dice<homePosition) {
        animateMove(player,i,player.tokens[i]+dice);
        moved=true;
        break;
      }
    }
  }
  if (!moved) {
    document.getElementById('status').innerText += " No move possible.";
    nextTurn(dice);
  }
}

function botMove(player,dice) {
  let moved = false;
  for (let i=0;i<player.tokens.length;i++) {
    if (player.tokens[i]===-1 && dice===6) {
      animateMove(player,i,0);
      moved=true;
      break;
    }
  }
  if (!moved) {
    for (let i=0;i<player.tokens.length;i++) {
      if (player.tokens[i]>=0 && player.tokens[i]+dice<homePosition) {
        animateMove(player,i,player.tokens[i]+dice);
        moved=true;
        break;
      }
    }
  }
  if (!moved) {
    setTimeout(() => nextTurn(dice),500);
  }
}

function animateMove(player,tokenIndex,target) {
  const current=player.tokens[tokenIndex];
  let step=current+1;
  const interval=setInterval(()=>{
    if(step>target){
      clearInterval(interval);
      if(checkWin(player))return;
      nextTurn();
    }else{
      player.tokens[tokenIndex]=step;
      updateBoard();
      step++;
    }
  },300);
}

function nextTurn(dice) {
  if (dice===6) {
    document.getElementById('status').innerText = `${players[currentPlayerIndex].name} rolled 6 and gets another turn.`;
    if(players[currentPlayerIndex].id!=='user'){
      setTimeout(rollDice,1000);
    }
    return;
  }
  currentPlayerIndex=(currentPlayerIndex+1)%players.length;
  const player=players[currentPlayerIndex];
  document.getElementById('status').innerText=`${player.name}'s turn.`;
  if(player.id!=='user'){
    setTimeout(rollDice,1000);
  }
}

function checkWin(player) {
  const allHome=player.tokens.every(pos=>pos>=trackCells.length-1);
  if(allHome){
    document.getElementById('status').innerText=`${player.name} wins!`;
    document.getElementById('rollButton').disabled=true;
    return true;
  }
  return false;
}
