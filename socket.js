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
                sender: the sender's username
                reciever: the reciever's id
        */
        socket.on("fr", function(data){
            // Get the reciver's socket id
            User.findOne({_id: data.reciever}, function(err, user){
                if(err) throw err;
                // find the Notification to send
                Not.findOne({$and: [{'owner.username': user.username}, {'other.username': data.sender}]}, function(err, not){
                    if(err) throw err;
                    // send it to the requested socket
                    return io.sockets.connected[user.socket].emit("not", not);
                });
            });
        });
    });
} 