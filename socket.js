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
                    return io.sockets.connected[reciever.socket].emit("not", obj);
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
                    return io.sockets.connected[sender.socket].emit("not", obj);
                });
            });
        });
    });
} 