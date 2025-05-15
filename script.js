const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 100;
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
const paddleSpeed = 5;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;
const ballSize = 10;

let playerScore = 0;
let aiScore = 0;

let upPressed = false;
let downPressed = false;

let gameOver = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
});

canvas.addEventListener('click', () => {
  if (gameOver) {
    playerScore = 0;
    aiScore = 0;
    playerY = canvas.height / 2 - paddleHeight / 2;
    aiY = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    gameOver = false;
  }
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = 'white';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  if (gameOver) return;

  if (upPressed) playerY -= paddleSpeed;
  if (downPressed) playerY += paddleSpeed;

  if (playerY < 0) playerY = 0;
  if (playerY + paddleHeight > canvas.height) playerY = canvas.height - paddleHeight;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY < 0 || ballY > canvas.height) ballSpeedY = -ballSpeedY;

  const aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 35) aiY += paddleSpeed;
  else if (aiCenter > ballY + 35) aiY -= paddleSpeed;

  if (
    ballX < 20 &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballSpeedY *= 1.05;
  }

  if (
    ballX > canvas.width - 20 &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballSpeedY *= 1.05;
  }

  if (ballX < 0) {
    aiScore++;
    resetBall();
  }

  if (ballX > canvas.width) {
    playerScore++;
    resetBall();
  }

  if (playerScore >= 5 || aiScore >= 5) {
    gameOver = true;
  }
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#000');

  if (gameOver) {
    drawText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
    drawText("Clique para jogar novamente", canvas.width / 2, canvas.height / 2 + 20);
    return;
  }

  drawRect(10, playerY, paddleWidth, paddleHeight, 'red');
  drawRect(canvas.width - 20, aiY, paddleWidth, paddleHeight, 'white');

  drawCircle(ballX, ballY, ballSize, 'white');

  drawText(`${playerScore}   |   ${aiScore}`, canvas.width / 2, 40);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
