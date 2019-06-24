var express = require("express");
var app = express();
var path = require("path");
var server = require("http").Server(app);
var io = require("/usr/local/lib/node_modules/socket.io")(server);
var bodyParser = require("body-parser");
//var mongoose = require("mongoose");

server.listen(3003);

app.set("views", path.join(__dirname, "views"));
app.use("/assets", express.static(path.join(__dirname, "public")));
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/views/index.html");
});
app.route("/login").get(function(req, res) {
    res.sendFile(__dirname + "/views/login.html");
});
app.route("/login").post(function(req, res) {
    console.log();
    res.send(req.body.username);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //only json

var arrUsers = [];

io.on("connection", function(socket) {
    arrUsers.push(socket.id);
    io.emit("users.connected", arrUsers);
    io.emit("rooms", socket.adapter.rooms);
    socket.on("chat.message", function(message) {
        //!emit all
        //io.emit()
        //!emit room
        io.sockets.in(socket.inRoom).emit("chat.room", message);
        //!emit to this
        //socket.emit("chat.message", message );
        //!emit everyone
        //socket.broadcast.emit("chat.message", message);
    });
    socket.on("user.room", function(room) {
        socket.join(room);
        socket.inRoom = room;
        socket.emit("user.inRoom", room);
    });
    socket.on("user.createRoom", function(room) {
        socket.join(room);
        socket.inRoom = room;
        socket.emit("user.createRoom", socket.inRoom);
        io.emit("rooms", socket.adapter.rooms);
    });
    socket.on("disconnect", function() {
        arrUsers.splice(arrUsers.indexOf(socket.id), 1);
        io.emit("users.disconnected", arrUsers);
    });
});