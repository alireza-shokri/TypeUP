// API
const apiKey = "PuhRt1H8bU65uZ7WXD6mYQ==VZv77IpbCLBdtFXD";
const apiUrl = "https://api.api-ninjas.com/v1/quotes";

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

// Game state
let activeGame = true;
let statusTimer = false;
let statusPipeWink = true;
let counter = 0;
let minute = 0;
let second = 0;
let timeStart;
let timeSave;
let wordList;
let letterList;
let letterElems;
let intervalTimer;

// Utility functions
const createElement = (tag, className, textContent = "") => {
  const element = $.createElement(tag);
  element.className = className;
  element.textContent = textContent;
  return element;
};

const updateDisplay = (element, value) => {
  element.textContent = value;
};

const toggleClass = (element, className, shouldAdd) => {
  element.classList.toggle(className, shouldAdd);
};

const disableButton = (button, isDisabled) => {
  button.disabled = isDisabled;
};

const formatTime = (min, sec) => `${String(min).padStart(2, "0")} : ${String(sec).padStart(2, "0")}`;

// Request
const fetchText = async () => {
  try {
    const res = await fetch(apiUrl, {
      headers: { "X-Api-Key": apiKey },
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data[0].quote;
  } catch (err) {
    console.error("Failed to fetch quote:", err);
    return "Default typing test sentence.";
  }
};

// Paste text in span
const pasteText = (letterList) => {
  selectBox.innerHTML = letterList
    .map((letter) => `<span class="letter">${letter}</span>`)
    .join("");
};

// Pipe
const pipePosition = (count) => {
  pipe.style.left = `${letterElems[count].offsetLeft - 2}px`;
  pipe.style.top = `${letterElems[count].offsetTop + 5}px`;

  const time = new Date().getTime();
  timeSave = time;

  setTimeout(() => {
    if (time === timeSave) {
      pipeWink(true);
    }
  }, 1500);
};

const pipeWink = (status) => {
  toggleClass(pipe, "pipeWink", status);
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
    updateDisplay(timeBox, formatTime(minute, second));
    counter > 5 && typingSpeed();
  }, 1000);
};

// Speed
const typingSpeed = () => {
  const waitTime = (new Date() - timeStart) / 60000;
  const speed = Math.floor(wordList.length / waitTime);
  updateDisplay(speedElem, speed);
};

// Finish
const finishType = () => {
  activeGame = false;
  clearInterval(intervalTimer);
  disableButton(btnNext, false);
  pipe.style.display = "none";
};

// Key check
const keyCheck = (e) => {
  const key = e.key;
  const keyCode = e.keyCode;

  if (key.length === 1) {
    const isCorrect = key === letterList[counter];
    const className = isCorrect
      ? "correctLetter"
      : letterList[counter] === " "
      ? "wrongSpace"
      : "wrongLetter";

    letterElems[counter].classList.add(className);
    counter++;
  } else if (keyCode === 8 && counter > 0) {
    counter--;
    pipePosition(counter);
    letterElems[counter].className = "letter";
  }
};

// Handle key
const handleKey = (e) => {
  e.preventDefault()
  if (activeGame) {
    statusPipeWink && pipeWink(false);

    if (!statusTimer) {
      timeStart = new Date();
      timer();
      statusTimer = true;
    }

    keyCheck(e);

    if (counter === letterList.length) {
      finishType();
      return;
    }

    pipePosition(counter);
  }
};

// Request and setup
const requestAndSetup = async () => {
  loader.style.display = "block";
  section.style.display = "none";

  const text = await fetchText();
  letterList = text.split("");
  wordList = text.split(" ");

  pasteText(letterList);
  letterElems = $.querySelectorAll(".letter");

  loader.style.display = "none";
  section.style.display = "block";
  pipePosition(0);
};

// Reset
const resetGame = () => {
  activeGame = true;
  counter = 0;
  updateDisplay(speedElem, "");
  clearInterval(intervalTimer);
  minute = 0;
  second = 0;
  updateDisplay(timeBox, formatTime(minute, second));
  pasteText(letterList);
  letterElems = $.querySelectorAll(".letter");
  pipe.style.display = "block";
  pipePosition(0);
  statusTimer = false;
  disableButton(btnNext, true);
};

// Next
const nextQuote = () => {
  requestAndSetup();
  resetGame();
  disableButton(btnNext, true);
};

// Initialize
window.onload = () => {
  requestAndSetup();
  $.addEventListener("keydown", handleKey);
  btnNext.addEventListener("click", nextQuote);
  btnRest.addEventListener("click", resetGame);
};
