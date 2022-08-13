let upper = null;
let lower = null;
let op = null;
let answer = null;

let oneComplete = null;
let setComplete = null;

let progress = null;
let countToday = 0;
const goal = 10;

function celebrate() {
  countToday++;
  progress.style.backgroundSize = `${Math.min(100, Math.floor(100 * countToday / goal))}%`;

  // if(countToday > (2 * goal)) {
  //   progress.style.backgroundImage = "linear-gradient(90deg, #fc9272, #ef3b2c);";
  // } else if (countToday > goal) {
  //   progress.style.backgroundColor = "#41ab5d";
  //   progress.style.backgroundImage = "linear-gradient(90deg, #fee6ce, #fd8d3c);";
  // }

  if (countToday === goal) {
    setComplete.load();
    setComplete.play();
  } else {
    oneComplete.load();
    oneComplete.play();
  }
}

function nextProblem() {
  upper.innerText = Math.floor(Math.random() * 12);
  lower.innerText = Math.floor(Math.random() * 12);
  answer.value = "";
}

function checkAnswer() {
  let u = +(upper.innerText);
  let l = +(lower.innerText);
  let a = +(answer.value);

  let o = op.value;

  if (a === (u + l)) {
    celebrate();
    setTimeout(nextProblem, 500);
  }
}

window.onload = async function () {
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");

  oneComplete = new Audio("mlg-air-horn.mp3");
  setComplete = new Audio("applause-sound-effect.mp3");
  progress = document.getElementById("progress");

  nextProblem();
  answer.focus();
  answer.addEventListener("input", checkAnswer);

  //   const storage = window.localStorage;
};