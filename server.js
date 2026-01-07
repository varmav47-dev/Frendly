const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Pair users
  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser = null;
  } else {
    waitingUser = socket;
    socket.emit("waiting");
  }

  // Message handling
  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  // NEXT button
  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("disconnected");
    }
    socket.partner = null;

    if (!waitingUser) {
      waitingUser = socket;
      socket.emit("waiting");
    }
  });

  socket.on("disconnect", () => {
    if (waitingUser === socket) waitingUser = null;
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("disconnected");
    }
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
