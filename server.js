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

  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("disconnected");
    }
    socket.partner = null;
    waitingUser = socket;
  });

  socket.on("disconnect", () => {
    if (socket === waitingUser) {
      waitingUser = null;
    }
    if (socket.partner) {
      socket.partner.emit("disconnected");
      socket.partner.partner = null;
    }
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
