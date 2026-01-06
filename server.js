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
    // match found
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser = null;
  } else {
    // wait
    waitingUser = socket;
    socket.emit("waiting");
  }

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", msg);
    }
  });

  socket.on("disconnect", () => {
    if (socket.partner) {
      socket.partner.emit("partner-disconnected");
      socket.partner.partner = null;
    }
    if (waitingUser === socket) {
      waitingUser = null;
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
