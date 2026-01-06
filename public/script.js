const socket = io();

const chat = document.getElementById("chat");
const status = document.getElementById("status");
const input = document.getElementById("msg");

socket.on("connect", () => {
  status.innerText = "Looking for stranger...";
});

socket.on("paired", () => {
  status.innerText = "Connected to stranger";
  chat.innerHTML = "";
});

socket.on("message", msg => {
  addMsg("Stranger", msg, "stranger");
});

socket.on("disconnectUser", () => {
  status.innerText = "Stranger disconnected";
});

function sendMsg() {
  if (input.value.trim() === "") return;
  socket.emit("message", input.value);
  addMsg("Me", input.value, "me");
  input.value = "";
}

function nextChat() {
  socket.emit("next");
  status.innerText = "Looking for new stranger...";
  chat.innerHTML = "";
}

function addMsg(sender, text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  div.innerText = sender + ": " + text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
