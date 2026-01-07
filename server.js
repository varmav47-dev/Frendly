const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingUser = null;
let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-count", onlineUsers);

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

  // Messages
  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  // Typing indicator
  socket.on("typing", () => {
    if (socket.partner) {
      socket.partner.emit("typing");
    }
  });

  socket.on("stop-typing", () => {
    if (socket.partner) {
      socket.partner.emit("stop-typing");
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
    onlineUsers--;
    io.emit("online-count", onlineUsers);

    if (waitingUser === socket) waitingUser = null;
    if (socket.partner) {
      socket.partner.partner = null;
      socket.partner.emit("disconnected");
    }
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
