const socket = io("/");
let mydata = "";
let newData;
const questionSelector = document.getElementById("questionSelector");
const form = document.getElementById("myQuestions");
let catChoice = document.getElementById("catChoice");
let question = document.getElementById("question");
let othersFeedback = document.getElementById("othersFeedback");
let feedback = document.getElementById("feedback");

const allData = (x) => {
  console.log(mydata[x]);
};

const showCategory = () => {
  console.log(mydata);
  for (let i = 0; i <= 4; i++) {
    let node = document.createElement("OPTION");
    node.id = [i];
    node.appendChild(document.createTextNode(mydata[i].category));
    document.getElementById("questionSelector").appendChild(node);
  }
};

const response = async () => {
  try {
    await fetch("https://opentdb.com/api.php?amount=5&type=multiple")
      .then((response) => response.json())
      .then((data) => (mydata = data.results));
    showCategory();
  } catch (err) {
    console.error(err);
  }
};

response();

form.addEventListener("submit", (x) => {
  x.preventDefault();
  let choice = questionSelector.options[questionSelector.selectedIndex].id;
  socket.emit("selectCategory", mydata[choice]);
});

function createElements(data) {
  newData = data;
  let choice = [];
  catChoice.textContent = `Player ${data[0]} choosed ${data[1].category}`;
  question.textContent = data[1].question;

  for (let i = 0; i <= 2; i++) {
    let element = document.createElement("div");
    element.className = "answerClass";
    element.id = "answer";
    element.textContent = data[1].incorrect_answers[i];
    choice.push(element);
  }

  choice[3] = document.createElement("div");
  choice[3].id = "correct";
  choice[3].textContent = data[1].correct_answer;
  shuffleArray(choice);

  for (let i = 0; i <= 3; i++) {
    document.getElementById("answers").appendChild(choice[i]);
    choice[i].addEventListener("click", function () {
      rightOrWrong(this.textContent);
    });
  }
}

function rightOrWrong(x) {
  if (x == newData[1].correct_answer) {
    document.getElementById("feedback").textContent = "CORRECT!";
    lockAnswers();
    let log = document.createElement("p");
    log.textContent = `${x} (Right)`;
    document.getElementById("log").appendChild(log);
    socket.emit("rightAnswer", x);
  } else {
    document.getElementById(
      "feedback"
    ).textContent = `Wrong :( The right answer is ${newData[1].correct_answer}`;
    let log = document.createElement("p");
    log.textContent = `${x} (Wrong)`;
    document.getElementById("log").appendChild(log);
    lockAnswers();
    socket.emit("wrongAnswer", x);
  }
}

function lockAnswers() {
  document.getElementById("correct").style.backgroundColor = "lightGreen";
  document.getElementById("answers").style.pointerEvents = "none";
}

function resetAnswers() {
  document.getElementById("answers").style.pointerEvents = "auto";
  document.getElementById("questionSelector").innerHTML = "";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  catChoice.textContent = "";
  question.textContent = "";
  response();
  // socket.emit("resetAnswers");
}

function shuffleArray(choice) {
  for (let i = choice.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = choice[i];
    choice[i] = choice[j];
    choice[j] = temp;
  }
}

document.getElementById("newRound").addEventListener("click", resetAnswers);

// SOCKETS
socket.on("categoryChoice", (data) => {
  resetAnswers();
  console.log(data);
  createElements(data);
  let log = document.createElement("B");
  log.textContent = data[1].question;
  document.getElementById("log").appendChild(log);
});

socket.on("wrongFeedback", (data) => {
  othersFeedback.innerHTML = `Player: ${data[0]} answered: ${data[1]}`;
});

socket.on("rightAnswer", (data) => {
  othersFeedback.innerHTML = `Player: ${data[0]} answered: ${data[1]}`;
});

socket.on("resetAnswers", () => {
  resetAnswers();
});

socket.on("scoreboard", (data) => {
  let text = "";
  for (let i = 1; i < data.length; i++) {
    text += `${data[i].player} Score: ${data[i].Score} <br>`;
  }
  document.getElementById("scoreboard").innerHTML = text;
});

socket.on("userId", (data) => {
  document.getElementById("userId").innerHTML = `Your ID: ${data}`;
});
