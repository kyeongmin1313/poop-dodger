
let player;
let poops = [];
let spawnRate = 15;
let poopSpeed = 4;
let score = 0;
let health = 3;
let shake = 0;
let gameOverFlag = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let restartBtn = createButton("다시 하기");
  restartBtn.position(20, 60);
  restartBtn.mousePressed(restart);
  restartBtn.id("restartBtn");

  player = new Player();
  textFont('Arial');
  loadRanking();
}

function draw() {
  if (shake > 0) {
    translate(random(-10, 10), random(-10, 10));
    shake--;
  }

  background(255);
  player.update();
  player.show();

  if (frameCount % spawnRate === 0 && !gameOverFlag) {
    for (let i = 0; i < 10; i++) {
      poops.push(new Poop());
    }
  }

  for (let i = poops.length - 1; i >= 0; i--) {
    poops[i].update();
    poops[i].show();

    if (poops[i].hits(player)) {
      poops.splice(i, 1);
      health--;
      shake = 10;
    } else if (poops[i].offscreen()) {
      poops.splice(i, 1);
    }
  }

  if (!gameOverFlag) score += 0.1;
  if (int(score) % 30 === 0 && frameCount % 60 === 0 && !gameOverFlag) {
    spawnRate = max(5, spawnRate - 3);
    poopSpeed += 0.5;
  }

  drawUI();

  if (health <= 0 && !gameOverFlag) {
    gameOver();
  }
}

function restart() {
  score = 0;
  health = 3;
  poops = [];
  spawnRate = 15;
  poopSpeed = 4;
  shake = 0;
  gameOverFlag = false;
  loop();
}

function drawUI() {
  fill(0);
  textSize(24);
  text(`점수: ${int(score)}`, 20, 30);
  for (let i = 0; i < health; i++) {
    fill(255, 0, 0);
    rect(width - 30 * (i + 1), 10, 20, 20);
  }

  fill(100);
  textSize(16);
  text("made by. 문경민", width - 180, height - 20);
}

function gameOver() {
  gameOverFlag = true;
  textSize(48);
  fill(255, 0, 0);
  textAlign(CENTER);
  text("💩 맞았다! 게임 오버", width / 2, height / 2 - 60);
  textSize(24);
  fill(0);
  text(`최종 점수: ${int(score)}`, width / 2, height / 2 - 20);
  noLoop();

  const highScores = JSON.parse(localStorage.getItem("ranking") || "[]");
  const topScore = highScores.length > 0 ? highScores[0].score : 0;
  if (int(score) > topScore || highScores.length < 5) {
    let name = prompt("최고 점수 갱신! 이름을 입력하세요:");
    if (name) {
      highScores.push({ name: name, score: int(score) });
      highScores.sort((a, b) => b.score - a.score);
      if (highScores.length > 5) highScores.pop();
      localStorage.setItem("ranking", JSON.stringify(highScores));
    }
  }
  loadRanking();
}

function loadRanking() {
  const highScores = JSON.parse(localStorage.getItem("ranking") || "[]");
  let y = 100;
  textAlign(LEFT);
  textSize(20);
  fill(0);
  text("🏆 친구 랭킹", 20, y);
  for (let i = 0; i < highScores.length; i++) {
    y += 30;
    text(`${i + 1}. ${highScores[i].name} - ${highScores[i].score}`, 20, y);
  }
}

class Player {
  constructor() {
    this.r = 20;
    this.x = width / 2;
    this.y = height / 2;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.x -= 5;
    if (keyIsDown(RIGHT_ARROW)) this.x += 5;
    if (keyIsDown(UP_ARROW)) this.y -= 5;
    if (keyIsDown(DOWN_ARROW)) this.y += 5;
    this.x = constrain(this.x, this.r, width - this.r);
    this.y = constrain(this.y, this.r, height - this.r);
  }

  show() {
    fill(0, 100, 255);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }
}

class Poop {
  constructor() {
    let angle = random(TWO_PI);
    this.r = 12;
    this.x = width / 2 + cos(angle) * 400;
    this.y = height / 2 + sin(angle) * 400;
    let dx = player.x - this.x + random(-30, 30);
    let dy = player.y - this.y + random(-30, 30);
    let mag = sqrt(dx * dx + dy * dy);
    this.vx = dx / mag * poopSpeed;
    this.vy = dy / mag * poopSpeed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  show() {
    fill(139, 69, 19);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);
  }

  hits(p) {
    let d = dist(this.x, this.y, p.x, p.y);
    return d < this.r + p.r;
  }

  offscreen() {
    return (this.x < -this.r || this.x > width + this.r ||
      this.y < -this.r || this.y > height + this.r);
  }
}
