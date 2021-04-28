const socketIO = require("socket.io");

//只要有用户加入聊天就加入这个数组
let users = [];

module.exports = function (server) {
  const io = socketIO(server);
  io.on("connection", socket => {
    let curUser = ""; //当前用户名
    socket.on("login", data => {
      //在这里服务器接收到客户端的请求
      if (data === "所有人" || users.filter((u) => u.username === data).length > 0) {
        //下方表示如果有重名的用户则昵称不可用
        socket.emit("login", false);
      } else {
        //昵称可以用
        users.push({
          username: data,
          socket,
        });
        curUser = data; //存储当前用户名
        socket.emit("login", true);


        //新用户进入,将信息发送个所有的socket
        socket.broadcast.emit("userin", data);
      };
    });

    //监听新进来的用户。
    socket.on("users", () => {
      const arr = users.map( u => u.username);
      socket.emit("users", arr);
    });

    //监听发送出去的消息
    socket.on("msg", data => {
      if(data.to) {
        //表示发送给指定的某一个人
        const us = users.filter(u => u.username === data.to);
        const u = us[0];
        u.socket.emit("new msg", {
          from: curUser,
          content: data.content,
          to: data.to,
        })
      } else {
        //表示发送给所有人
        socket.broadcast.emit("new msg", {
          from: curUser,
          content: data.content,
          to: data.to,
        });
      }
    });

    //用于监听看是否有人退出聊天室
    socket.on("disconnect", () => {
      socket.broadcast.emit("userout", curUser);
      //用户退出，需要删除掉列表中的人员
      users = users.filter(u => u.username !== curUser);
    });
  });
};