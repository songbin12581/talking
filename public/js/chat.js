const socket = io.connect();

// 客户端发送消息给服务器
page.onLogin = function (username) {
  socket.emit("login", username);
};

//发送消息:我是谁，发什么， 发给谁
page.onSendMsg = function (me, msg, to) {
  socket.emit("msg", {
    to,
    content: msg,
  });
  page.addMsg(me, msg, to);
  page.clearInput();
};

// 客户端监听服务器消息
socket.on("login", (result) => {
  if (result) {
    page.intoChatRoom(); //表示进入聊天室
    socket.emit("users", "");
  } else {
    alert("昵称不可用，请更换昵称");
  }
});

socket.on("users", (users) => {
  page.initChatRoom();

  //记录进入聊天室的人员并打印在页面
  for (const u of users) {
    page.addUser(u);
  }
});

//监听新进来的用户,并推送至其他的客户端
socket.on("userin", (username) => {
  page.addUser(username);
});

socket.on("userout", (username) => {
  page.removeUser(username);
});


//客户端监听新消息
socket.on("new msg", (result) => {
  page.addMsg(result.from, result.content, result.to);
});
