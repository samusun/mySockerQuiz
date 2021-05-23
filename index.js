const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer);
let players = [{ player: 0, Score: 0 }];

app.use(express.static(path.join(__dirname, "/public")));

io.of("/").on("connect", (socket) => {
  console.log(`A client with id ${socket.id} connected!`);
  players.push({ player: socket.id, Score: 0 });
  socket.emit("userId", socket.id);

  socket.on("selectCategory", (data) => {
    console.log(`${socket.id}, choosed category ${data.category}`);
    io.of("/").emit("categoryChoice", [socket.id, data]);
  });

  socket.on("wrongAnswer", (myData) => {
    console.log(`${socket.id} gave wrong answer; ${myData}`);
    socket.broadcast.emit("wrongFeedback", [socket.id, myData]);
  });

  socket.on("rightAnswer", (myData) => {
    console.log(`${socket.id} gave right answer; ${myData}`);
    socket.broadcast.emit("rightAnswer", [socket.id, myData]);
    let userIndex = players.findIndex(function (arr) {
      return arr.player === socket.id;
    });
    players[userIndex].Score++;
  });

  socket.on("resetAnswers", () => {
    socket.broadcast.emit("resetAnswers");
  });

  setInterval(() => {
    io.emit("scoreboard", players);
  }, 1000);

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
    let userIndex = players.findIndex(function (arr) {
      return arr.player === socket.id;
    });
    players.splice(userIndex, 1);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

/*

  function findPlayer(playerArray) {
    return playerArray.player === x;
  }
  if (players.find(findPlayer)) {
    players.forEach((element, index) => {
      console.log("Element: ", element, "Index: ", index); // FORTSÄTT HÄÄÄR SÅ NÄRA!! :D
    });
    console.log(`${x} got score`);
    console.log(players[0], players[1]);
  } else {
    console.log("searching player");
  }
}
*/
