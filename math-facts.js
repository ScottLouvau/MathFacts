// Cached Elements
let upper = null;
let lower = null;
let op = null;
let answer = null;
let progress = null;
let progressOuter = null;

// Sound Effects
let oneComplete = null;
let setComplete = null;

// State
let correctAnswer = null;
let countToday = 0;
const goal = 5;

function nextProblem() {
  let o = op.innerText;

  let u = Math.floor(Math.random() * 12);
  let l = Math.floor(Math.random() * 12);

  if (o === '+') {
    correctAnswer = u + l;
  } else if (o === '-') {
    u = Math.floor(Math.random() * 20);
    l = Math.floor(Math.random() * u);
    correctAnswer = u - l;
  } else if (o === 'x' || o === '*') {
    correctAnswer = u * l;
  } else { // (o === '/' || o === '÷')
    correctAnswer = u;
    u = u * l;
  }

  upper.innerText = u;
  lower.innerText = l;
  answer.value = "";
}

function nextOperation() {
  let o = op.innerText;

  if (o === '+') {
    op.innerText = '-';
  } else if (o === '-') {
    op.innerText = 'x';
  } else if (o === 'x' || o === '*') {
    op.innerText = '÷';
  } else { // (o === '/' || o === '÷')
    op.innerText = '+';
  }

  nextProblem();
}

function checkAnswer() {
  let a = +(answer.value);

  if (a === correctAnswer) {
    countToday++;
    setProgress();
    setTimeout(nextProblem, 500);

    if (countToday > 0 && (countToday % goal) === 0) {
      setComplete.load();
      setComplete.play();
    } else {
      oneComplete.load();
      //oneComplete.play();
    }
  }
}

function setProgress() {
  // const first =  "linear-gradient(90deg, #c7e9c0, #41ab5d)";
  // const second = "linear-gradient(90deg, #fee6ce, #fd8d3c)";
  // const third = "linear-gradient(90deg, #fc9272, #ef3b2c)";

  // https://cssgradient.io/
  const first = "linear-gradient(to right, #ca7345, #732100)";
  const second = "linear-gradient(to right, #dedede, #949494)";
  const third = "linear-gradient(to right, #eecd3f, #99771f)";

  if (countToday < goal) {
    progress.style.backgroundImage = first;
    progressOuter.style.backgroundImage = '';
  } else if (countToday < 2 * goal) {
    progress.style.backgroundImage = second;
    progressOuter.style.backgroundImage = first;
  } else if (countToday < 3 * goal) {
    progress.style.backgroundImage = third;
    progressOuter.style.backgroundImage = second;
  } else {
    progress.style.backgroundImage = '';
    progressOuter.style.backgroundImage = third;
  }

  const portionDone = (countToday % goal) / goal;
  progress.style.backgroundSize = `${Math.floor(100 * portionDone)}%`;
}

window.onload = async function () {
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");

  progress = document.getElementById("progress");
  progressOuter = document.getElementById("progress-outer");

  oneComplete = new Audio("mlg-air-horn.mp3");
  setComplete = new Audio("applause-sound-effect.mp3");

  // Hook up to check answer
  answer.focus();
  answer.addEventListener("input", checkAnswer);

  // Hook up to toggle operation
  op.addEventListener("click", nextOperation);

  nextProblem();

  // TODO: Reload progress for today (verify it's from today)
  // Track progress for past days within window
  // UX to show calendar with progress for last four weeks

  //   const storage = window.localStorage;
};