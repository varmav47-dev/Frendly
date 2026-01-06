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
    // pair found
    const room = `room-${waitingUser.id}-${socket.id}`;

    socket.join(room);
    waitingUser.join(room);

    io.to(room).emit("matched");

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on("message", (msg) => {
    const rooms = [...socket.rooms];
    rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.to(room).emit("message", msg);
      }
    });
  });

  socket.on("disconnect", () => {
    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
