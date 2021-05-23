// const sshuffle = require('secure-shuffle')
const socket = io("/");
let mydata = "";
let answerArray = [];
const category = document.getElementById("category");
const questionSelector = document.getElementById("questionSelector");
const cat = document.getElementById("catChoice");
const form = document.getElementById("myQuestions");

//const question = document.getElementById("question").innerHTML;
//const answer = document.getElementById("answer");

let question = (x) => {
  console.log(mydata[x]);
};

let showCategory = () => {
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

socket.on("categoryChoice", (data) => {
  let choice = [];
  choice.id = "choice";
  document.getElementById(
    "catChoice"
  ).textContent = `Player ${data[0]} choosed ${data[1].category}`;
  document.getElementById("question").textContent = data[1].question;
  for (let i = 0; i <= 2; i++) {
    choice[i] = document.createElement("div");
    choice[i].id = "answer" + [i];
    choice[i].textContent = data[1].incorrect_answers[i];

    document.getElementById("answers").appendChild(choice[i]);
    document
      .getElementById("answer" + [i])
      .addEventListener("click", function () {
        console.log(this.textContent);
        document.getElementById(
          "feedback"
        ).textContent = `Wrong :( The right answer is ${data[1].correct_answer}`;
        lockAnswers();
        socket.emit("wrongAnswer", data[1].incorrect_answers[i]);
      });
  }
  choice[3] = document.createElement("div");
  choice[3].id = "answer4";
  choice[3].textContent = data[1].correct_answer;
  document.getElementById("answers").appendChild(choice[3]);

  document.getElementById("answer4").addEventListener("click", function () {
    if (this.textContent === data[1].correct_answer) {
      document.getElementById("feedback").textContent = "CORRECT!";
      lockAnswers();
      socket.emit("rightAnswer", data[1].correct_answer);
    } else {
      console.log("User gave wroooong answer");
    }
  });
});

socket.on("wrongFeedback", (data) => {
  console.log("YOU gave wrong answer");
  document.getElementById(
    "othersFeedback"
  ).innerHTML = `Player: ${data[0]} answered: ${data[1]}`;
});

socket.on("rightAnswer", (data) => {
  document.getElementById(
    "othersFeedback"
  ).innerHTML = `Player: ${data[0]} answered: ${data[1]}`;
});

socket.on("scoreboard", (data) => {
  let text = "";
  for (let i = 1; i < data.length; i++) {
    text += `${data[i].player} Score: ${data[i].Score} <br>`;
  }
  document.getElementById("scoreboard").innerHTML = text;
});

function lockAnswers() {
  document.getElementById("answer0").style.backgroundColor = "Red";
  document.getElementById("answer1").style.backgroundColor = "Red";
  document.getElementById("answer2").style.backgroundColor = "Red";
  document.getElementById("answer4").style.backgroundColor = "lightGreen";
  document.getElementById("answers").style.pointerEvents = "none";
}

function resetAnswers() {
  document.getElementById("answers").style.backgroundColor = "white";
  document.getElementById("answer4").style.backgroundColor = "white";
  document.getElementById("answers").style.pointerEvents = "auto";
  document.getElementById("questionSelector").innerHTML = "";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("catChoice").textContent = "";
  document.getElementById("question").textContent = "";
  response();
}

document.getElementById("newRound").addEventListener("click", resetAnswers);

socket.on("userId", (data) => {
  document.getElementById("userId").innerHTML = `Your ID: ${data}`;
});
