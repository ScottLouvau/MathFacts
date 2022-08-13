// NOTE: Sounds are from https://mixkit.co/free-sound-effects/ and are royalty-free.
// 
let upper = null;
let lower = null;
let op = null;
let answer = null;

let ding = null;

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
    ding.load();
    ding.play();
    setTimeout(nextProblem, 500);
  }
}

window.onload = async function () {
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");

  ding = document.getElementById("ding"); // new Audio("mixkit-cowbell-sharp-hit-1743.wav");

  nextProblem();
  answer.focus();
  answer.addEventListener("input", checkAnswer);

  //   const storage = window.localStorage;
};