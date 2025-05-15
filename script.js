const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const bgMusic = new Audio('sounds/bg_music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

const hitSound = new Audio('sounds/hit.mp3');
const flashSound = new Audio('sounds/flashbang.mp3');
const winSound = new Audio('sounds/win.mp3');

const paddleWidth = 10, paddleHeight = 100;
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
let player2Y = canvas.height / 2 - paddleHeight / 2;

const paddleSpeed = 6;
const ballSize = 10;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;

let playerScore = 0;
let aiScore = 0;

let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;

let gameRunning = false;
let mode = "single";
let ballTrail = [];
let ballColor = 'white';

let flashActive = false;
let flashTimer = 0;
let shakeOffsetX = 0;
let shakeOffsetY = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
  if (e.key === 'w') wPressed = true;
  if (e.key === 's') sPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
  if (e.key === 'w') wPressed = false;
  if (e.key === 's') sPressed = false;
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color, alpha = 1.0) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawText(text, x, y) {
  ctx.fillStyle = 'cyan';
  ctx.font = '32px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function triggerFlashbang() {
  flashActive = true;
  flashTimer = 30;
  flashSound.play();
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballColor = randomColor();
  ballTrail = [];
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  playerY = canvas.height / 2 - paddleHeight / 2;
  aiY = canvas.height / 2 - paddleHeight / 2;
  player2Y = canvas.height / 2 - paddleHeight / 2;
  resetBall();
  document.getElementById("gameOver").classList.add("hidden");
  gameRunning = true;
  bgMusic.play();
  requestAnimationFrame(gameLoop);
}

function startGame(selectedMode) {
  mode = selectedMode;
  document.getElementById("menu").classList.add("hidden");
  canvas.classList.remove("hidden");
  resetGame();
}

function randomColor() {
  const colors = ['cyan', 'magenta', 'yellow', 'lime', 'white'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function update() {
  if (!gameRunning) return;

  if (wPressed) playerY -= paddleSpeed;
  if (sPressed) playerY += paddleSpeed;
  playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

  if (mode === "multi") {
    if (upPressed) player2Y -= paddleSpeed;
    if (downPressed) player2Y += paddleSpeed;
    player2Y = Math.max(0, Math.min(canvas.height - paddleHeight, player2Y));
  } else {
    const aiCenter = aiY + paddleHeight / 2;
    if (aiCenter < ballY - 35) aiY += paddleSpeed;
    else if (aiCenter > ballY + 35) aiY -= paddleSpeed;
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (Math.random() < 0.02) {
    ballSpeedY += (Math.random() - 0.5) * 2;
  }

  if (ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
    hitSound.play();
  }

  const opponentY = mode === 'multi' ? player2Y : aiY;

  if (ballX < 20 && ballY > playerY && ballY < playerY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballSpeedY *= 1.05;
    ballColor = randomColor();
    hitSound.play();
  }

  if (ballX > canvas.width - 20 && ballY > opponentY && ballY < opponentY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballSpeedY *= 1.05;
    ballColor = randomColor();
    hitSound.play();
  }

  if (ballX < 0) {
    aiScore++;
    resetBall();
    triggerFlashbang();
  }

  if (ballX > canvas.width) {
    playerScore++;
    resetBall();
    triggerFlashbang();
  }

  // Verifica fim de jogo
  if (playerScore === 5 || aiScore === 5) {
    gameRunning = false;
    document.getElementById("gameOver").classList.remove("hidden");
    winSound.play();
    bgMusic.pause();
  }

  if (flashActive) {
    flashTimer--;
    if (flashTimer <= 0) {
      flashActive = false;
    } else {
      shakeOffsetX = Math.random() * 20 - 10;
      shakeOffsetY = Math.random() * 20 - 10;
    }
  } else {
    shakeOffsetX = 0;
    shakeOffsetY = 0;
  }

  ballTrail.push({ x: ballX, y: ballY, color: ballColor });
  if (ballTrail.length > 15) ballTrail.shift();
}

function draw() {
  ctx.save();
  ctx.translate(shakeOffsetX, shakeOffsetY);

  if (flashActive) {
    drawRect(0, 0, canvas.width, canvas.height, 'cyan');
    ctx.restore();
    return;
  }

  drawRect(0, 0, canvas.width, canvas.height, '#0b0b2e');

  for (let i = 0; i < ballTrail.length; i++) {
    const trail = ballTrail[i];
    drawCircle(trail.x, trail.y, ballSize, trail.color, i / ballTrail.length / 2);
  }

  drawRect(10, playerY, paddleWidth, paddleHeight, 'lime');

  if (mode === "multi") {
    drawRect(canvas.width - 20, player2Y, paddleWidth, paddleHeight, 'yellow');
  } else {
    drawRect(canvas.width - 20, aiY, paddleWidth, paddleHeight, 'magenta');
  }

  drawCircle(ballX, ballY, ballSize, ballColor);
  drawText(`${playerScore}   |   ${aiScore}`, canvas.width / 2, 40);

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(gameLoop);
}

function backToMenu() {
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("pongCanvas").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  gameRunning = false;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}
