var mongoose = require("mongoose");
var schemas = require("./schemas/index.js");

var User = mongoose.model('user', schemas.user);
var Not = mongoose.model('notification', schemas.notification);

var redis = require("redis").createClient();

redis.on("error", function (err) { 
    console.log("Error " + err);
});


module.exports = function(io, controllers){
    io.on("connection", function(socket){
        /*
            When a user loads the page, if they are logged on their socket will be added to their record so that it can be accessed
            data: the authentication token if they are logged in;
                'login' if they are not
        */
        socket.on("auth", function(data){
            redis.get(data, function(err, user){
                if(err) throw err;
                if(user){
                    User.update({_id: user}, {$set: {socket: socket.id}}, function(err, user){
                        if(err) throw err;
                    });
                }
            });
        });
        /*
            When a friend request is sent, the other user will recieve a notification
            data: 
                sender: the sender's authentication token
                reciever: the reciever's id
        */
        socket.on("fr", function(data){
            redis.get(data.sender, function(err, send) {
                // Get the reciver's socket id
                User.find({$or: [{_id: data.reciever}, {_id: send}]}, function(err, user){
                    if(err) throw err;
                    var sender = {};
                    var reciever = {};
                    if(user[0]._id==sender){
                        sender = user[0];
                        reciever = user[1];
                    }else{
                        sender = user[1];
                        reciever = user[0];
                    }
                    var obj = {
                        owner: reciever,
                        type: "fr",
                        state: 0,
                        other: sender,
                        
                    }
                    if(io.sockets.connected[reciever.socket]){
                        return io.sockets.connected[reciever.socket].emit("not", obj);
                    }else{
                        console.log("couldn't find socket "+ reciever.socket);
                        console.log(io.sockets.connected);
                    }
                });
            });
        });
        socket.on("fra", function(data){
            redis.get(data.sender, function(err, send) {
                // Get the reciver's socket id
                User.find({$or: [{_id: data.reciever}, {_id: send}]}, function(err, user){
                    if(err) throw err;
                    var sender = {};
                    var reciever = {};
                    if(user[0]._id==sender){
                        sender = user[0];
                        reciever = user[1];
                    }else{
                        sender = user[1];
                        reciever = user[0];
                    }
                    var obj = {
                        owner: reciever,
                        type: "fra",
                        state: 0,
                        other: sender,
                    }
                    if(io.sockets.connected[sender.socket]){
                        return io.sockets.connected[sender.socket].emit("not", obj);
                    }else{
                        console.log("couldn't find socket "+ sender.socket);
                        console.log(io.sockets.connected);
                    }
                });
            });
        });
        /*
            When a user visits their page, subscribe them to getting new posts by socket
        */
        socket.on("toUser", function(data) {
            var rooms = socket.rooms;
            var id = socket.id;
            for(var i = 0;i<rooms.length;i++){
                socket.leave(rooms[i]);
            }
            socket.join(id);
            socket.join(data.user);
        });
        /*
            when a user makes a post, let all the people in that room know
        */
        socket.on("post", function(data) {
            io.to(data).emit("post", true);
        });
        /*
            Send the notification of the message to the user
            data:
                sender: the id of the user that is sending the message
                message: the message content
        */
        socket.on("message", function(data){
            redis.get(data.sender, function(err, user) {
                if(err) throw err;
                var obj = {
                    owner: data.message.to,
                    other: data.message.from,
                    type: "mess",
                    state: 0,
                    reference: data.message._id,
                    createdOn: (new Date())
                }
                var notification = new Not(obj);
                notification.save(function(err, not){
                    if(err) throw err;
                    if(io.sockets.connected[data.message.to.socket]){
                        return io.sockets.connected[data.message.to.socket].emit("not", {
                            message: data.message,
                            not: not
                        });
                    }else{
                        console.log("couldn't find socket "+ data.message.to.socket);
                        console.log(io.sockets.connected)
                    }
                });
            })
        });
    });
} 