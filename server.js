const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ STATIC FOLDER FIX
app.use(express.static(path.join(__dirname, "public")));

// ✅ FORCE HOME ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---- socket logic (as it is) ----
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

  socket.on("disconnect", () => {
    if (socket.partner) {
      socket.partner.emit("partner-disconnected");
    }
    if (waitingUser === socket) waitingUser = null;
  });
});

// ✅ IMPORTANT: PORT FIX FOR RENDER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
