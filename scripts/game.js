const font = new FontFaceObserver("PixelFont");
const canvas = document.getElementById("gameCanvas");
canvas.height = window.innerHeight - 1;
canvas.width = canvas.height;
const ctx = canvas.getContext("2d");
const rows = 40;
const cols = 40;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;
const SNAKE_SPEED = 5;
let lastRenderTime = 0;
let food = { x: 0, y: 0 };
let currentDirection = { x: 0, y: -1 };
const snake = [
  { x: Math.floor(rows / 2), y: Math.floor(cols / 2) },
  { x: Math.floor(rows / 2), y: Math.floor(cols / 2) + 1 },
  { x: Math.floor(rows / 2), y: Math.floor(cols / 2) + 2 },
];
let gameRunning = false;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

let animationFrameId;

function main(currentTime) {
  animationFrameId = window.requestAnimationFrame(main);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

  lastRenderTime = currentTime;
  moveSnake();
  draw();
}

function gameOver() {
  window.cancelAnimationFrame(animationFrameId);
  gameRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "50px PixelFont";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = "30px PixelFont";
  ctx.fillText(
    `Score: ${snake.length - 3}`,
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillText(
    "Press Enter to Restart",
    canvas.width / 2,
    canvas.height / 2 + 50
  );
  resetGame();
}

function resetGame() {
  snake.length = 0;
  snake.push({ x: Math.floor(rows / 2), y: Math.floor(cols / 2) });
  snake.push({ x: Math.floor(rows / 2), y: Math.floor(cols / 2) + 1 });
  snake.push({ x: Math.floor(rows / 2), y: Math.floor(cols / 2) + 2 });
  currentDirection = { x: 0, y: -1 };
  generateFood();
}

function moveSnake() {
  const head = { ...snake[0] };
  head.x += currentDirection.x;
  head.y += currentDirection.y;

  if (checkCollision(head)) {
    const audio = new Audio("../sounds/impact.mp3");
    audio.play();
    gameOver();
  } else {
    snake.unshift(head);
    if (head.x !== food.x || head.y !== food.y) {
      snake.pop();
    } else {
      const audio = new Audio("../sounds/food.mp3");
      audio.play();
      checkWin();
      generateFood();
    }
  }
}

function checkCollision(newHead) {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
      return true; // Collided with self
    }
  }

  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= cols ||
    newHead.y >= rows
  ) {
    return true;
  }

  return false;
}

function checkWin() {
  if (snake.length === rows * cols) {
    window.cancelAnimationFrame(animationFrameId);
    gameRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "50px PixelFont";
    ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = "30px PixelFont";
    ctx.fillText("Press Enter to Restart", canvas.width / 2, canvas.height / 2);
    resetGame();
  }
}

function draw() {
  if (!gameRunning) return;
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawSnake();
  drawScore();
}

function drawSnake() {
  for (const { x, y } of snake) {
    ctx.fillStyle = "#020";
    ctx.shadowColor = "#020";

    ctx.fillRect(
      x * cellWidth + 2,
      y * cellHeight + 2,
      cellWidth - 2,
      cellHeight - 2
    );
  }
}

function drawFood() {
  ctx.fillStyle = "white";
  ctx.shadowColor = "white";

  ctx.fillRect(
    food.x * cellWidth + 2,
    food.y * cellHeight + 2,
    cellWidth - 2,
    cellHeight - 2
  );
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px PixelFont";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${snake.length - 3}`, 10, 20);
}

function generateFood() {
  let x = Math.floor(Math.random() * cols);
  let y = Math.floor(Math.random() * rows);

  for (const { x: cellX, y: cellY } of snake) {
    if (cellX === x && cellY === y) {
      return generateFood();
    }
  }

  food = { x, y };
}

window.addEventListener("keydown", (e) => {
  const newDirection = directions[e.key];
  if (
    newDirection &&
    !(
      snake.length > 1 &&
      newDirection.x === -currentDirection.x &&
      newDirection.y === -currentDirection.y
    ) &&
    gameRunning
  ) {
    currentDirection = newDirection;
  } else if (e.key === "Enter" && !gameRunning) {
    init();
  }
});

function drawStartScreen() {
  ctx.fillStyle = "white";
  ctx.font = "50px PixelFont";
  ctx.textAlign = "center";
  ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2);
}

font
  .load()
  .then(() => {
    drawStartScreen();
  })
  .catch((error) => {
    console.error("Font loading failed:", error);
  });

function init() {
  generateFood();
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  animationFrameId = window.requestAnimationFrame(main);
  gameRunning = true;
}
