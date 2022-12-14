// Cached Elements ÷
let upper = null;
let lower = null;
let op = null;
let answer = null;
let progress = null;
let progressOuter = null;
let correctCheck = null;

// Sound Effects
let oneSound = null;
let goalSound = null;
const sounds = ["none", "air-horn", "aooga", "applause", "ding-ding", "ding", "drama", "happy-tones", "mario-coin", "minecraft-eating", "success", "tada", "xylophone"];

// State
let currentProblem = null; // { answer: null, startTime: null, wasEverIncorrect: null };

let settings = { goal: 40, op: '+', facts: '', pauseMs: 500, volume: 0.25, showTelemetryDays: 60, oneSound: sounds.indexOf("ding"), goalSound: sounds.indexOf("tada") };
let today = null;
let history = {};
let shareText = null;

let cantSaveWarningShown = false;
const cantSaveWarningText = "Can't save progress or settings with cookies disabled.";

// ---- Date Functions ----
// Return this moment as a Date
function now() {
  return new Date();
}

// Return an ISO 8601 string for the given date in the local timezone (not UTC) (ex: '2022-08-31')
function dateString(date) {
  // "sv" locale (Sweden) uses ISO 8601 date formatting
  return date.toLocaleDateString("sv");
}

// Compute the date 'days' after 'date'
function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Return the date of Sunday in the same week as 'date'
function startOfWeek(date) {
  return addDays(date, -date.getDay());
}

// ---- Basics: Load Settings and Progress, Choose Math Problems, Check Answers ----

// Return the next problem to retry, if it's time and there are any
function nextToRedo() {
  const countToGoal = settings.goal - (today.count % settings.goal);
  if (today.redo?.length >= countToGoal) {
    return today.redo.shift();
  } else {
    return null;
  }
}

// Choose a value between min and max.
//  Don't re-choose last value if there are at least three options.
function randomish(min, max, last) {
  let options = (max - min) + 1;
  let avoidLast = (options >= 3 && last >= min && last <= max);

  if (options <= 1) { return max; }
  if (avoidLast) { options--; }

  let result = min + Math.floor(Math.random() * options);
  if (result === last && avoidLast) { result = max; }

  return result;
}

// Randomly choose the next math problem
let uMin = 0, uMax = 20, lMin = 0, lMax = 20;

function nextProblem() {
  let o = settings.op;
  let u = parseInt(upper.innerText);
  let l = parseInt(lower.innerText);
  let a = null;
  let redo = nextToRedo();

  // Choose new problem (or a redo) to do next
  if (redo) {
    u = parseInt(redo[0]);
    o = redo[1];
    l = parseInt(redo[2]);
    if (o === '÷') { a = u / l; }
  } else if (o === '+') {
    u = randomish(Math.max(0, uMin), Math.min(12, uMax), u);
    l = randomish(Math.max(0, lMin), Math.min(12, lMax), l);
  } else if (o === '-') {
    u = randomish(Math.max(0, lMin, uMin), Math.min(20, uMax), u);
    l = randomish(Math.max(0, lMin), Math.min(u, lMax), l);
  } else if (o === 'x') {
    u = randomish(Math.max(0, uMin), Math.min(12, uMax), u);
    l = randomish(Math.max(0, lMin), Math.min(12, lMax), l);
  } else { // (o === '÷')
    // Choose *factors* and compute product; no zero.
    a = randomish(Math.max(1, uMin), Math.min(12, uMax), a);
    l = randomish(Math.max(1, lMin), Math.min(12, lMax), l);
  }

  // Compute correct answer
  if (o === '+') {
    a = u + l;
  } else if (o === '-') {
    a = u - l;
  } else if (o === 'x') {
    a = u * l;
  } else { // (o === '÷')
    u = a * l;
  }

  // Update current problem state
  currentProblem = { answer: a, wasEverIncorrect: false };
  resetProblemTimer();

  // Update UI (check animation, problem text boxes, answer)
  correctCheck.classList.remove("correct");
  correctCheck.classList.remove("correct-instant");

  upper.innerText = u;
  op.innerText = o;
  lower.innerText = l;

  answer.value = "";
  answer.focus();
}

// Reset the timer for solving the current problem (if any)
function resetProblemTimer() {
  if (currentProblem) { currentProblem.startTime = now(); }
}

// Check the answer
function checkAnswer() {
  const newNow = now();
  const a = parseInt(answer.value);

  // Stop if we are pending the next problem, or if no text is entered
  if (currentProblem === null || answer.value === "") { return; }

  // If correct, track progress, celebrate, and pick the next one
  if (a === currentProblem.answer) {
    // If it's a new day, push old data to history and swap to a new 'today'
    if (dateString(newNow) !== today.date) {
      loadState();
    }

    // Add just solved problem to telemetry
    const msToAnswer = (newNow - currentProblem.startTime);
    today.count++;

    if (msToAnswer < 60 * 1000) {
      const entry = [upper.innerText, op.innerText, lower.innerText, msToAnswer, currentProblem.wasEverIncorrect];
      today.telemetry ??= [];
      today.telemetry.push(entry);

      if (currentProblem.wasEverIncorrect || msToAnswer >= 6000) {
        today.redo ??= [];
        today.redo.push(entry);
      }

      // Save new telemetry
      try {
        window.localStorage.setItem('today', JSON.stringify(today));
      } catch {
        if (!cantSaveWarningShown) {
          cantSaveWarningShown = true;
          showMessage(cantSaveWarningText);
        }
      }
    }

    // Update UI    
    correctCheck.classList.add((settings.pauseMs >= 500 ? "correct" : "correct-instant"));
    currentProblem = null;
    showProgress();

    // Play sound
    if (today.count > 0 && (today.count % settings.goal) === 0) {
      showMessage("Yay!");
      play(goalSound);
    } else {
      play(oneSound);
    }

    // Show next problem (after brief delay)
    setTimeout(nextProblem, settings.pauseMs ?? 500);
  } else {
    // If incorrect, and at least right length, mark wasEverIncorrect
    if (a.toString().length >= currentProblem.answer.toString().length) {
      currentProblem.wasEverIncorrect = true;
    }
  }
}

// Render progress on top bar
function showProgress() {
  if (today.count < settings.goal) {
    progress.className = "bronze";
    progressOuter.className = '';
  } else if (today.count < 2 * settings.goal) {
    progress.className = "silver";
    progressOuter.className = "bronze";
  } else if (today.count < 3 * settings.goal) {
    progress.className = "gold";
    progressOuter.className = "silver";
  } else {
    progress.className = "gold";
    progressOuter.className = "gold";
  }

  const portionDone = (today.count % settings.goal) / settings.goal;
  progress.style.backgroundSize = `${Math.floor(100 * portionDone)}% 100%`;
}

// Check to see if the day has rolled over
function checkForTomorrow() {
  // Reload state on a new day
  if (dateString(now()) !== today.date) {
    showMessage("Welcome Back!");
    loadState();
  }

  // Check hourly
  window.setTimeout(checkForTomorrow, 60 * 60 * 1000);
}

// Load stored settings, progress today, and historical progress.
function loadState() {
  const currentToday = dateString(now());

  try {
    const storage = window.localStorage;
    settings = { ...settings, ...JSON.parse(storage.getItem('settings')) };
    history = JSON.parse(storage.getItem('history')) ?? history;

    const lastToday = JSON.parse(storage.getItem('today'));
    if (lastToday) {
      if (lastToday.date === currentToday) {
        // Reload 'today' data if it's still the same day
        today = lastToday;
      } else {
        // Otherwise, add most recent day to history
        history[lastToday.date] = lastToday;
        storage.setItem("history", JSON.stringify(history));

        // TODO: Delete very old data?

        // And start fresh
        today = null;
      }
    }
  }
  catch { }

  // Read set URL params
  const params = new URLSearchParams(location.search);

  const pGoal = parseInt(params.get("g"));
  if (pGoal) { settings.goal = pGoal; }

  const pOp = params.get("o");
  if (pOp === '+' || pOp === '-' || pOp === 'x' || pOp === '÷') { settings.op = pOp; }

  const pVol = parseInt(params.get("v"));
  if (pVol >= 0 && pVol <= 100) { settings.volume = (pVol / 100); }

  loadFactRanges();

  // Reset 'today' data
  if (today == null) {
    today = { date: currentToday, count: 0, telemetry: [] };
  }

  // Reflect loaded state in UI
  op.innerText = settings.op;
  showProgress();

  // Load sounds (asynchronously)
  window.setTimeout(loadSounds, 50);
}

// Identify the next math operation in a fixed order
function nextOperation(op) {
  const ops = ['+', '-', 'x', '÷'];
  return ops[(ops.indexOf(op) + 1) % ops.length];
}

// Toggle the current math operation (when the operator is clicked)
function toggleOperation() {
  op.innerText = settings.op = nextOperation(settings.op);
  saveSettings();
  nextProblem();
}

// Set ranges for operands
function loadFactRanges() {
  const params = new URLSearchParams(location.search);
  const facts = parseNumberOrRange(settings.facts);
  const rLower = parseNumberOrRange(params.get("l"));
  const rUpper = parseNumberOrRange(params.get("u"));

  // Upper uses URL parameter or stays in fact range, if specified
  uMin = parseInt(params.get("u0") ?? rUpper.lo ?? rUpper.single ?? facts.lo ?? 0);
  uMax = parseInt(params.get("u1") ?? rUpper.hi ?? rUpper.single ?? facts.hi ?? 20);

  // Lower uses URL parameter, single fact setting, or fact range
  lMin = parseInt(params.get("l0") ?? rLower.lo ?? rLower.single ?? facts.lo ?? facts.single ?? 0);
  lMax = parseInt(params.get("l1") ?? rLower.hi ?? rLower.single ?? facts.hi ?? facts.single ?? 20);
}

// Parse a number ("4") or range ("1-5")
function parseNumberOrRange(value) {
  const dash = value?.indexOf("-");
  const hasDash = (dash >= 0);

  return {
    lo: (hasDash ? value?.slice(0, dash) : null),
    hi: (hasDash ? value?.slice(dash + 1) : null),
    hasDash: hasDash,
    single: (hasDash || value?.length < 1 ? null : value)
  };
}

// ---- Sound Effects ----

// Load select sound effects
async function loadSounds() {
  oneSound = await loadSound(settings.oneSound ?? sounds.indexOf("ding"), oneSound);
  goalSound = await loadSound(settings.goalSound ?? sounds.indexOf("tada"), goalSound);
}

// Load a single sound (if 'None' not selected)
async function loadSound(index, currentAudio) {
  currentAudio?.pause();
  const name = sounds[(index || 0) % sounds.length];
  const url = `./audio/${name}.mp3`;

  if (name === "none" || settings.volume === 0) {
    return null;
  } else if (currentAudio?.url === url) {
    return currentAudio;
  } else if (currentAudio == null) {
    currentAudio = new Audio();
  }

  // Craziness: Download and cache sound effects as Data URLs to get
  // Safari to play them reliably without redownloading every time.
  await loadSoundEx(url, currentAudio);
  currentAudio.url = url;

  // Otherwise, should be just this:
  //currentAudio.src = url;
  //currentAudio.url = url;
  //currentAudio.load();

  return currentAudio;
}

// Play a Sound Effect
function play(audio, volume) {
  if (audio == null || settings.volume <= 0) { return; }

  // Call pause and load for clean Safari playback.
  // Sounds are downloaded and Audio.src is a Data URL to prevent actual repeat downloading.
  audio.pause();
  audio.load();
  audio.volume = (volume ?? settings.volume ?? 1);

  const promise = audio.play();
  if (promise) {
    // Gracefully handle audio not allowed (ex: Safari for select.input event)
    promise.catch(error => { });
  }
}

// ---- Control Bar ----

// Show a Modal Box
function show(id) {
  let closeBox = document.createElement("template");
  closeBox.innerHTML = `<svg class="close-button" title="Close"><use href="#close"></use></svg>`;

  const container = document.getElementById(id);
  container.children?.[0]?.prepend(closeBox.content);
  container.classList.remove("hidden");

  document.querySelectorAll(".close-button").forEach((o) => o.addEventListener("click", hide));
}

// Hide a Modal Box
function hide() {
  document.querySelectorAll(".overlay").forEach((o) => o.classList.add("hidden"));
  resetProblemTimer();
  answer.focus();
}

// Don't hide a modal box (when clicking on box itself)
function suppressHide(args) {
  args.stopPropagation();
}

// Briefly show a message to the user
function showMessage(message) {
  const box = document.getElementById("temp-message");
  box.innerHTML = message;
  box.classList.remove("hidden");
  box.classList.remove("show-message");
  window.setTimeout(() => box.classList.add("show-message"), 10);
}

// ---- Telemetry Tracking ----

// Compute telemetry summary for today and last 60 days of history
function computeTelemetry(historyDayCount) {
  historyDayCount ??= 60;

  let telemetry = { count: 0, accuracy: {}, speed: {}, rollup: { accuracy: {}, speed: {} } };

  for (const entry of today.telemetry) {
    addTelemetryEntry(entry, telemetry);
  }

  const cutoff = dateString(addDays(now(), -1 * Math.abs(historyDayCount)));
  for (let date in history) {
    if (date >= cutoff) {
      let dayTelemetry = history[date].telemetry;
      if (dayTelemetry) {
        for (const entry of dayTelemetry) {
          addTelemetryEntry(entry, telemetry);
        }
      }
    }
  }

  return telemetry;
}

// Add telemetry for a single problem entry
function addTelemetryEntry(entry, telemetry) {
  const accuracy = telemetry.accuracy;
  const speed = telemetry.speed;

  const rAccuracy = telemetry.rollup.accuracy;
  const rSpeed = telemetry.rollup.speed;

  const u = entry[0];
  const o = entry[1];
  const l = entry[2];
  const timeInMs = entry[3];
  const wasEverIncorrect = entry[4];

  // accuracy["2"]["+"]["3"] = [20, 22]  (means "2 + 3" asked 22 times, correct on first try 20/22 times.)
  accuracy[o] ??= {};
  accuracy[o][u] ??= {};
  accuracy[o][u][l] ??= [0, 0];
  accuracy[o][u][l][0] += (wasEverIncorrect ? 0 : 1);
  accuracy[o][u][l][1] += 1;

  rAccuracy[o] ??= {};
  if (op === '+' || op === 'x') {
    rAccuracy[o][u] ??= [0, 0];
    rAccuracy[o][u][0] += (wasEverIncorrect ? 0 : 1);
    rAccuracy[o][u][1] += 1;
  }
  rAccuracy[o][l] ??= [0, 0];
  rAccuracy[o][l][0] += (wasEverIncorrect ? 0 : 1);
  rAccuracy[o][l][1] += 1;

  // speed["2"]["x"]["4"] = [1640, 2160, 850]  (means "2 x 4" asked three times and correct answer recieved in 1.64s, 2.16s, and 850 ms)
  speed[o] ??= {};
  speed[o][u] ??= {};
  speed[o][u][l] ??= [];
  speed[o][u][l].push(timeInMs);

  rSpeed[o] ??= {};
  if (op === '+' || op === 'x') {
    rSpeed[o][u] ??= [];
    rSpeed[o][u].push(timeInMs);
  }
  rSpeed[o][l] ??= [];
  rSpeed[o][l].push(timeInMs);

  telemetry.count++;
}

// ---- Speed and Accuracy Reports ----

function getSpeedCell(column, operation, row, telemetry) {
  // For subtraction, only create cells for non-negative results
  if (operation === '-' && column - row < 0) { return null; }

  // Look up telemetry for problem
  const u = (operation === '÷' ? (column * row) : column);
  const current = telemetry.speed?.[operation]?.[`${u}`]?.[`${row}`];

  const td = document.createElement("td");
  td.title = `${u} ${operation} ${row}`;

  if (current) {
    current.sort((l, r) => l - r);
    const medianMs = current[Math.floor(current.length / 2)];
    const medianS = medianMs / 1000;
    td.innerText = medianS.toLocaleString("en-US", { minimumFractionDigits: (medianS < 9.5 ? 1 : 0), maximumFractionDigits: 1 });
    td.title = recentMedianValues(current);
    td.className = speedClass(medianMs);
  }

  return td;
}

function recentMedianValues(current) {
  // Take the middle 20 values from the array
  const trim = Math.floor((current?.length - 20) / 2);
  if (trim > 0) { 
    current = current.slice(trim, (current.length - trim)); 
  }

  // Convert to a comma-delimited string
  return current?.map((v) => (v / 1000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })).join(", ") ?? null;
}

function getAccuracyCell(column, operation, row, telemetry) {
  // For subtraction, only create cells for non-negative results
  if (operation === '-' && column - row < 0) { return null; }

  // Look up telemetry for problem
  const u = (operation === '÷' ? (column * row) : column);
  const current = telemetry.accuracy?.[operation]?.[`${u}`]?.[`${row}`];

  const td = document.createElement("td");
  td.title = `${u} ${operation} ${row}`;

  if (current) {
    const accuracyPct = 100 * (current[0] / current[1]);
    td.innerText = `${accuracyPct.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    td.title = `${current[0]} / ${current[1]}`;
    td.className = accuracyClass(accuracyPct);
  }

  return td;
}

function showTelemetryTable(operation, getTableCell) {
  const telemetry = computeTelemetry(settings.showTelemetryDays ?? 60);

  // Create a date range selector dropdown
  const daysSelect = document.createElement("select");
  daysSelect.id = "days-select";
  daysSelect.innerHTML = `
    <option value="0">Today</option>
    <option value="7">Last 7 days</option>
    <option value="14">Last 14 days</option>
    <option value="28">Last 28 days</option>
    <option value="60">Last 60 days</option>
  `;
  daysSelect.addEventListener("input", (args) => {
    settings.showTelemetryDays = args.target.value;
    saveSettings();
    showTelemetryTable(operation, getTableCell);
  });
  daysSelect.value = settings.showTelemetryDays ?? 60;

  // Render the telemetry table
  operation ??= '+';

  let colHeadings = null;
  let rowHeadings = null;

  if (operation === '-') {
    colHeadings = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    rowHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  } else if (operation === '÷') {
    colHeadings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    rowHeadings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  } else {
    colHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    rowHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  const table = createTable(operation, colHeadings, rowHeadings, getTableCell, telemetry);

  // Add to the modal container
  const container = document.getElementById("contents");
  container.innerHTML = "";
  container.appendChild(daysSelect);
  container.appendChild(table);
  show("box");
}

function createTable(operation, colHeadings, rowHeadings, getTableCell, telemetry) {
  const table = document.createElement("table");
  table.classList.add("stats");
  if (operation === '-') { table.classList.add("subtraction"); }

  let tr = null;
  let td = null;

  tr = document.createElement("tr");

  // Corner Cell
  td = document.createElement("th");
  td.innerText = operation;
  td.addEventListener('click', () => showTelemetryTable(nextOperation(operation), getTableCell));
  tr.appendChild(td);

  // First Row (column headings)
  for (let x = 0; x < colHeadings.length; ++x) {
    td = document.createElement("th");
    td.innerText = colHeadings[x];
    tr.appendChild(td);
  }

  table.appendChild(tr);

  for (let y = 0; y < rowHeadings.length; ++y) {
    tr = document.createElement("tr");

    td = document.createElement("td");
    td.innerText = rowHeadings[y];
    tr.appendChild(td);

    for (let x = 0; x < colHeadings.length; ++x) {
      const td = getTableCell(colHeadings[x], operation, rowHeadings[y], telemetry);
      if (td) { tr.appendChild(td); }
    }

    table.appendChild(tr);
  }

  return table;
}

function speedClass(timeMs) {
  if (timeMs == null) {
    return "unknown";
  } else if (timeMs < 2000) {
    return "great";
  } else if (timeMs < 3000) {
    return "good";
  } else if (timeMs < 6000) {
    return "ok";
  } else {
    return "bad";
  }
}

function accuracyClass(accuracyPct) {
  if (accuracyPct == null) {
    return "unknown";
  } else if (accuracyPct >= 95) {
    return "great";
  } else if (accuracyPct >= 90) {
    return "good";
  } else if (accuracyPct >= 75) {
    return "ok";
  } else {
    return "bad";
  }
}

// ---- Consistency Calendar ----

function showCalendar() {
  const table = document.createElement("table");
  table.className = "calendar";

  let tr = null;
  let td = null;

  // Header Row (day names)
  const colHeadings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  tr = document.createElement("tr");
  for (let x = 0; x < colHeadings.length; ++x) {
    td = document.createElement("th");
    td.innerText = colHeadings[x];
    tr.appendChild(td);
  }
  table.appendChild(tr);

  const end = now();
  const startDate = addDays(startOfWeek(end), -21);
  let current = startDate;

  while (current <= end) {
    tr = document.createElement("tr");

    for (let x = 0; x < 7; ++x) {
      const td = document.createElement("td");
      const date = dateString(current);
      const historyDay = (date === today.date ? today : history[date]);
      const color = starColor(historyDay);
      const showMonth = (current === startDate || current.getDate() === 1);

      let contents = `<div class="date">${(showMonth ? current.toLocaleString('en-US', { month: "short" }) : "")} ${current.toLocaleString('en-US', { day: "numeric" })}</div>`;
      if (color) {
        contents += `<svg class="fill-${color}"><use href="#star"></use</svg>`;
      }

      td.innerHTML = contents;
      tr.appendChild(td);
      current = addDays(current, 1);
      if (current > end) { break; }
    }

    table.appendChild(tr);
  }

  const container = document.getElementById("contents");
  container.innerHTML = "";
  container.appendChild(table);
  show("box");
}

function starColor(historyDay) {
  if (historyDay == null) { return null; }

  const count = historyDay.count;
  if (count >= 3 * settings.goal) {
    return "gold";
  } else if (count >= 2 * settings.goal) {
    return "silver";
  } else if (count >= settings.goal) {
    return "bronze";
  } else {
    return null;
  }
}

// ---- Settings ----

function addSounds(control) {
  if (control.options.length === 0) {
    for (let i = 0; i < sounds.length; ++i) {
      const so = document.createElement("option");
      so.text = sounds[i];
      control.add(so, i);
    }
  }
}

let settingsLoaded = false;

function showSettings() {
  if (!settingsLoaded) {
    const goal = document.getElementById("setting-goal");
    goal.value = settings.goal;
    goal.addEventListener("input", () => {
      settings.goal = parseInt(goal.value);
      saveSettings();
      showProgress();
    });
    if (goal.value === "") { goal.value = 40; }

    const oper = document.getElementById("setting-op");
    oper.value = op.innerText;
    oper.addEventListener("input", () => {
      const newOp = oper.value;
      op.innerText = newOp;
      settings.op = newOp;
      saveSettings();
      nextProblem();
    });

    const facts = document.getElementById("setting-facts");
    facts.value = settings.facts;
    facts.addEventListener("input", () => {
      settings.facts = facts.value;
      saveSettings();
      loadFactRanges();
      nextProblem();
    });

    const delay = document.getElementById("setting-delay");
    delay.value = parseInt(settings.pauseMs);
    delay.addEventListener("input", () => {
      settings.pauseMs = parseInt(delay.value);
      saveSettings();
    });

    const volume = document.getElementById("setting-volume");
    volume.value = parseFloat(settings.volume);
    volume.addEventListener("input", async () => {
      settings.volume = parseFloat(volume.value);
      saveSettings();
      await loadSounds();
      play(oneSound || goalSound);
    });

    const eachSound = document.getElementById("setting-each-sound");
    addSounds(eachSound);
    eachSound.selectedIndex = settings.oneSound;
    eachSound.addEventListener("input", async () => {
      settings.oneSound = eachSound.selectedIndex % sounds.length;
      saveSettings();
      oneSound = await loadSound(settings.oneSound ?? 1, oneSound);
      play(oneSound);
    });

    const setSound = document.getElementById("setting-goal-sound");
    addSounds(setSound);
    setSound.selectedIndex = settings.goalSound;
    setSound.addEventListener("input", async () => {
      settings.goalSound = setSound.selectedIndex % sounds.length;
      saveSettings();
      goalSound = await loadSound(settings.goalSound ?? 3, goalSound);
      play(goalSound);
    });
  }

  settingsLoaded = true;
  show("settings-box");
}

function saveSettings() {
  try {
    window.localStorage.setItem('settings', JSON.stringify(settings));
  } catch {
    if (!cantSaveWarningShown) {
      cantSaveWarningShown = true;
      showMessage(cantSaveWarningText);
    }
  }
}

// ---- Share ----  🟧 🟪 🟫 ⬜ 😕
const emoji = {
  "unknown": '⬛',
  "great": '🟦',
  "good": '🟩',
  "ok": '🟨',
  "bad": '🟥',

  "gold": '🟨',
  "silver": '⬜',
  "bronze": '🟧'
};

const worstFirst = [null, "unknown", "bad", "ok", "good", "great"];
function worst(class1, class2) {
  return worstFirst[Math.min(worstFirst.indexOf(class1), worstFirst.indexOf(class2))];
}

// ---- Share Text ---- 
function showShare() {
  const end = now();
  let text = `${dateString(end)} | ${settings.goal} | ${settings.op}\n\n`;

  let current = addDays(startOfWeek(end), -7);
  text += `📅\n`;
  while (current <= end) {
    const date = dateString(current);
    const historyDay = (date === today.date ? today : history[date]);
    text += emoji[starColor(historyDay) ?? "unknown"];
    if (current.getDay() === 6) { text += '\n'; }
    current = addDays(current, 1);
  }
  text += '\n\n';
  text += emojiTelemetrySummary(settings.op);

  const container = document.getElementById("share-text");
  container.innerHTML = text;
  shareText = text;

  let link = `mailto:?subject=Math Facts Summary&body=${encodeURIComponent(text)}`;
  document.getElementById("share-mail").href = link;

  show("share-box");
}

function emojiTelemetrySummary(o) {
  let sText = '⚡ ';
  let aText = '🎯 ';

  const telemetry = computeTelemetry(14);
  const speed = telemetry?.rollup?.speed[o];
  const accuracy = telemetry?.rollup?.accuracy[o];
  const start = (o === '÷' ? 1 : 0);
  const end = (o === '-' ? 20 : 12);

  for (let i = start; i <= end; ++i) {
    const current = speed?.[i];
    current?.sort((l, r) => l - r);
    const timeMs = current?.[Math.floor(current?.length * 0.75)] ?? null;
    const accuracyPct = 100 * (accuracy?.[i]?.[0] / accuracy?.[i]?.[1]);

    sText += emoji[speedClass(timeMs)];
    aText += emoji[accuracyClass(accuracyPct)];
  }

  return aText + '\n' + sText;
}

function copyShareToClipboard() {
  navigator.clipboard.writeText(shareText);
  showMessage("Copied to Clipboard!");
}

// ---- Lame Hacks ----

// Safari: Audio locked until first sound played in user action event handler.
// 'input' event doesn't count, but 'click' does, so play on first body click to unlock audio.
// On iOS, each Audio instance seems to require separate unlocking, so play both and reuse the instances
// when sound effects are changed.
let audioUnlocked = false;
function unlockAudio() {
  if (!audioUnlocked) {
    audioUnlocked = true;
    oneSound?.play();
    oneSound?.pause();
    goalSound?.play();
    goalSound?.pause();
  }
}

// Safari: Audio won't repeatedly play a sound from the beginning unless load is called,
// which downloads it again every time. To avoid this, download into a Data URL and make
// *that* the Audio.src.
async function loadSoundEx(url, target) {
  const response = await fetch(url);
  const blob = await response.blob();
  const content = await readBlob(blob);
  target.setAttribute("src", content);

  function readBlob(b) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };

      reader.readAsDataURL(b);
    });
  }
}

// Safari + iPhone: On screen keyboard scrolls to input and doesn't reduce viewport height,
// so we need to ensure the whole problem is visible.
function onscreenKeyboardCheck() {
  if (window.innerHeight !== window.visualViewport.height) {
    document.getElementById("control-bar").scrollIntoView();
  }
}

// ---------------------------------

window.onload = async function () {
  // Cache controls from DOM we'll be manipulating
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");
  progress = document.getElementById("progress");
  progressOuter = document.getElementById("progress-outer");
  correctCheck = document.getElementById("correct-check");

  // Load localStorage state (Settings, work per day, ...)
  loadState();

  // Hook up to check answer
  answer.addEventListener("input", checkAnswer);

  // On op clicked, toggle op
  op.addEventListener("click", toggleOperation);

  // Hook up hiding modal popups
  document.querySelectorAll(".overlay").forEach((o) => o.addEventListener("click", hide));
  document.querySelectorAll(".contents").forEach((o) => o.addEventListener("click", suppressHide));

  // Hook up bar icons
  document.getElementById("calendar-button").addEventListener("click", showCalendar);
  document.getElementById("speed-button").addEventListener("click", () => showTelemetryTable(op.innerText, getSpeedCell));
  document.getElementById("accuracy-button").addEventListener("click", () => showTelemetryTable(op.innerText, getAccuracyCell));

  document.getElementById("share-button").addEventListener("click", showShare);
  document.getElementById("help-button").addEventListener("click", () => show("help-box"));
  document.getElementById("settings-button").addEventListener("click", showSettings);
  document.getElementById("share-clipboard").addEventListener("click", copyShareToClipboard);

  // Hook up hacks (unlock audio, ensure problem visible with iOS onscreen keyboard
  document.body.addEventListener("click", unlockAudio);
  window.visualViewport?.addEventListener("resize", onscreenKeyboardCheck);

  // Check hourly for the day to roll over
  window.setTimeout(checkForTomorrow, 60 * 60 * 1000);

  // Reset problem start when browser loses and regains focus
  window.addEventListener("focus", resetProblemTimer);

  // Choose the first problem
  nextProblem();
};