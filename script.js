let levelIndex = 0;
let levels = [];
let coins = 0;
let timerInterval;
let seconds = 0;

window.onload = async () => {
  // Load levels.json
  let res = await fetch("levels.json");
  let data = await res.json();
  levels = data.levels;

  // Load saved coins
  coins = parseInt(localStorage.getItem("coins")) || 0;
  document.getElementById("coins").innerText = "💰 " + coins;

  loadLevel();
};

// 🎯 Load Level
function loadLevel() {
  stopTimer();
  startTimer();

  document.getElementById("level").innerText = "Level " + (levelIndex + 1);

  let puzzleDiv = document.getElementById("puzzle");
  puzzleDiv.style.opacity = 0;
  puzzleDiv.innerHTML = "";

  let grid = levels[levelIndex].grid;
  let answersCopy = [...levels[levelIndex].answers]; // copy answers

  grid.forEach(row => {
    let rowDiv = document.createElement("div");
    rowDiv.className = "row";
    row.forEach(cell => {
      let div = document.createElement("div");
      div.className = "cell";

      if (cell === "") {
        div.classList.add("empty");
        let answer = answersCopy.shift();
        div.dataset.answer = answer;
        div.ondragover = ev => ev.preventDefault();
        div.ondrop = ev => drop(ev, div);
      } else {
        div.innerText = cell;
      }

      rowDiv.appendChild(div);
    });
    puzzleDiv.appendChild(rowDiv);
  });

  // Numbers to drag
  let numsDiv = document.getElementById("numbers");
  numsDiv.innerHTML = "";
  levels[levelIndex].answers.forEach(num => {
    let span = document.createElement("span");
    span.className = "number";
    span.innerText = num;
    span.draggable = true;
    span.ondragstart = ev => ev.dataTransfer.setData("text", num);
    numsDiv.appendChild(span);
  });

  setTimeout(() => (puzzleDiv.style.opacity = 1), 300);
}

// 🎯 Drop Handler
function drop(ev, cell) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");

  if (cell.dataset.answer === data) {
    cell.innerText = data;
    cell.classList.add("correct");
    ev.target.ondrop = null;
    checkWin();
  } else {
    cell.classList.add("wrong");
    setTimeout(() => cell.classList.remove("wrong"), 500);
  }
}

// 🎯 Check Win
function checkWin() {
  let emptyCells = document.querySelectorAll(".cell.empty");
  let allFilled = true;
  emptyCells.forEach(cell => {
    if (cell.innerText === "") allFilled = false;
  });

  if (allFilled) {
    stopTimer();
    addCoins(5); // base reward
    if (seconds < 30) addCoins(10); // speed bonus 🎯

    // 🎉 Confetti animation
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    document.getElementById("message").innerHTML =
      "<h3>🎉 You Win!</h3><button onclick='nextLevel()'>Next Level</button>";
  }
}

// 🎯 Next Level
function nextLevel() {
  document.getElementById("message").innerHTML = "";
  levelIndex++;
  if (levelIndex >= levels.length) {
    document.getElementById("message").innerHTML =
      "<h3>🏆 You finished all 80 levels!</h3>";
    return;
  }
  loadLevel();
}

// 🎯 Coins
function addCoins(amount) {
  coins += amount;
  document.getElementById("coins").innerText = "💰 " + coins;
  localStorage.setItem("coins", coins);
}

// 🎯 Timer
function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    let min = String(Math.floor(seconds / 60)).padStart(2, "0");
    let sec = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").innerText = `⏱️ ${min}:${sec}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}
