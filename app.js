// API
const API_KEY = "PuhRt1H8bU65uZ7WXD6mYQ==VZv77IpbCLBdtFXD";
const API_URL = "https://api.api-ninjas.com/v1/quotes";

// Select elements
const $ = document;
const selectBox = $.querySelector(".box");
const pipe = $.querySelector(".pipe");
const loader = $.querySelector(".loader");
const section = $.querySelector(".section");
const timeBox = $.querySelector(".time");
const speedElem = $.querySelector(".speed");
const btnNext = $.querySelector(".btn_next");
const btnRest = $.querySelector(".btn_rest");
const resultBox = $.querySelector(".result");

// Game state
let activeGame = false;
let statusTimer = false;
let statusPipeWink = true;
let counter = 0;
let minute = 0;
let second = 0;
let timeStart;
let timeSave;
let wordListTypeing;
let letterList;
let letterElems;
let intervalTimer;
let speed;

const formatTime = (min, sec) =>
  `${String(min).padStart(2, "0")} : ${String(sec).padStart(2, "0")}`;

const UpdateElementValue = (element, value) => {
  element.textContent = value;
};

const disableButton = (button, isDisabled) => {
  button.disabled = isDisabled;
};

const ElementDisplay = (element, useDisplay) => {
  element.style.display = useDisplay;
};

const showRezalt = () => {
  resultBox.style.display = "block";
  UpdateElementValue(
    $.querySelector(".result-time"),
    `time = ${formatTime(minute, second)} `
  );

  UpdateElementValue(
    $.querySelector(".result-word"),
    `word = ${letterList.join("").split(" ").length}`
  );
  UpdateElementValue($.querySelector(".result-speed"), `speed = ${speed}`);
};

// Pipe
const movePipe = (count) => {
  pipe.style.left = `${letterElems[count].offsetLeft - 2}px`;
  pipe.style.top = `${letterElems[count].offsetTop + 5}px`;

  const time = Date.now();
  timeSave = time;

  // pipe wink
  setTimeout(() => {
    if (time === timeSave) {
      pipeWink(true);
    }
  }, 1500);
};

const pipeWink = (status) => {
  // add or remove class
  pipe.classList.toggle("pipeWink", status);
  statusPipeWink = status;
};

// Timer
const timer = () => {
  intervalTimer = setInterval(() => {
    if (second >= 60) {
      second = 0;
      minute++;
    }
    second++;
    UpdateElementValue(timeBox, formatTime(minute, second));
    typingSpeed();
  }, 1000);
};

// Speed
const typingSpeed = () => {
  if (counter < 3) return;
  const waitTime = (Date.now() - timeStart) / 60000;
  if (waitTime > 0) {
    speed = Math.floor(letterList.join("").split(" ").length / waitTime);
    UpdateElementValue(speedElem, speed);
  }
};

const handleCorrectKey = (index) => {
  letterElems[index].classList.add("correctLetter");
};

const handleWrongKey = (index) => {
  const className = letterList[index] === " " ? "wrongSpace" : "wrongLetter";
  letterElems[index].classList.add(className);
};

const handleBackspace = () => {
  if (counter > 0) {
    counter--;
    movePipe(counter);
    letterElems[counter].className = "letter";
  }
};

const processKey = (key, keyCode) => {
  if (key.length === 1) {
    if (key === letterList[counter]) handleCorrectKey(counter);
    else handleWrongKey(counter);
    counter++;
  } else if (keyCode === 8 && counter > 0) handleBackspace();
};

// Handle key
const handleKey = (e) => {
  e.preventDefault();
  if (!activeGame) return;

  statusPipeWink && pipeWink(false);
  if (!statusTimer) {
    timeStart = new Date();
    timer();
    statusTimer = true;
  }
  processKey(e.key, e.keyCode);
  if (counter === letterList.length) {
    finishType();
    return;
  }
  movePipe(counter);
};

const restMinutAndSecend = () => {
  minute = 0;
  second = 0;
};
// Reset
const resetGame = () => {
  activeGame = true;
  counter = 0;
  UpdateElementValue(speedElem, "");
  clearInterval(intervalTimer);
  restMinutAndSecend();
  UpdateElementValue(timeBox, formatTime(minute, second));
  pasteText(letterList);
  letterElems = $.querySelectorAll(".letter");
  pipe.style.display = "block";
  movePipe(0);
  statusTimer = false;
  disableButton(btnNext, true);
  ElementDisplay(resultBox, "none");
  ElementDisplay(timeBox, "block");
};

// Next
const nextQuote = () => {
  resetGame();
  requestAndSetup();
};

// span Element
const pasteText = (letterList) => {
  selectBox.innerHTML = letterList
    .map((letter) => `<span class="letter">${letter}</span>`)
    .join("");
};

// Request
const fetchText = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: { "X-Api-Key": API_KEY },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    return data[0].quote;
  } catch (err) {
    console.error("Failed to fetch quote:", err);
    return "Failed to fetch.";
  }
};

// Request and setup
const requestAndSetup = async () => {
  ElementDisplay(loader, "block");
  ElementDisplay(section, "none");
  const text = await fetchText();
  letterList = text.split("");
  pasteText(letterList);

  letterElems = $.querySelectorAll(".letter");
  ElementDisplay(loader, "none");
  ElementDisplay(section, "block");
  movePipe(0);
  activeGame = true;
};

// Finish
const finishType = () => {
  activeGame = false;
  clearInterval(intervalTimer);
  showRezalt();
  restMinutAndSecend();
  UpdateElementValue(timeBox, formatTime(minute, second));
  ElementDisplay(pipe, "none");
  disableButton(btnNext, false);
  UpdateElementValue(speedElem, "");
  ElementDisplay(timeBox, "none");
};
// Initialize
window.onload = () => {
  requestAndSetup();
  $.addEventListener("keydown", handleKey);
  btnNext.addEventListener("click", nextQuote);
  btnRest.addEventListener("click", resetGame);
};
