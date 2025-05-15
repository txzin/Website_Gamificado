const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 100;
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
const paddleSpeed = 6;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;
const ballSize = 10;

let playerScore = 0;
let aiScore = 0;

let upPressed = false;
let downPressed = false;
let gameRunning = true;

let ballColor = 'white';
let particles = [];

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = 'cyan';
  ctx.font = '32px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function randomColor() {
  const colors = ['cyan', 'magenta', 'yellow', 'lime', 'white'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballColor = 'white';
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  playerY = canvas.height / 2 - paddleHeight / 2;
  aiY = canvas.height / 2 - paddleHeight / 2;
  resetBall();
  document.getElementById("gameOver").classList.add("hidden");
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function createParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      life: 30,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 30;
    drawCircle(p.x, p.y, 3, p.color);
  });
  ctx.globalAlpha = 1.0;
}

function update() {
  if (!gameRunning) return;

  if (upPressed) playerY -= paddleSpeed;
  if (downPressed) playerY += paddleSpeed;

  playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
    createParticles(ballX, ballY, ballColor);
  }

  const aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 35) aiY += paddleSpeed;
  else if (aiCenter > ballY + 35) aiY -= paddleSpeed;

  // Colisão com jogador
  if (ballX < 20 && ballY > playerY && ballY < playerY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.1;
    ballSpeedY *= 1.1;
    ballColor = randomColor();
    createParticles(ballX, ballY, ballColor);
  }

  // Colisão com IA
  if (ballX > canvas.width - 20 && ballY > aiY && ballY < aiY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.1;
    ballSpeedY *= 1.1;
    ballColor = randomColor();
    createParticles(ballX, ballY, ballColor);
  }

  if (ballX < 0) {
    aiScore++;
    resetBall();
  }

  if (ballX > canvas.width) {
    playerScore++;
    resetBall();
  }

  if (playerScore === 5 || aiScore === 5) {
    gameRunning = false;
    document.getElementById("gameOver").classList.remove("hidden");
  }

  updateParticles();
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#0b0b2e');
  drawRect(10, playerY, paddleWidth, paddleHeight, 'lime');
  drawRect(canvas.width - 20, aiY, paddleWidth, paddleHeight, 'magenta');
  drawCircle(ballX, ballY, ballSize, ballColor);
  drawParticles();
  drawText(`${playerScore}   |   ${aiScore}`, canvas.width / 2, 40);
}

function gameLoop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(gameLoop);
}
gameLoop();
