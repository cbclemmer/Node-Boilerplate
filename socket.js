var mongoose = require("mongoose");
var schemas = require("./schemas/index.js");

var User = mongoose.model('user', schemas.user);

var redis = require("redis").createClient();

redis.on("error", function (err) { 
    console.log("Error " + err);
});


module.exports = function(io, controllers){
    io.on("connection", function(socket){
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
    });
} 