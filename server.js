const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingUser = null;

io.on("connection", socket => {
  if (waitingUser) {
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("connected");
    waitingUser.emit("connected");

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on("message", msg => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    if (socket.partner) {
      socket.partner.emit("partnerDisconnected");
      socket.partner.partner = null;
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
