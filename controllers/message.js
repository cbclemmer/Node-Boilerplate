var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var Message = mongoose.model('Message', schemas.message);
var User = mongoose.model('User', schemas.user);
module.exports = {
    /*
        description: gets the messages to a user
        inputs:
            user: the current user
            other: the other user
            page: page of mesages
    */
    get: function(inputs, exits){
        User.find({$or: [{_id: inputs.user}, {username: inputs.other}]}, function(err, users){
            if(err) throw err;
            if(users.length < 2){
                return exits.error("Users not found");
            }
            var q = Message.find({$or: [{'to.username': users[0].username, 'from.username': users[1].username}, {'to.username': users[1].username, 'from.username': users[0].username}]});
            q.sort("+createdOn");
            q.limit(50);
            q.skip((parseInt(inputs.page)-1)*50);
            q.exec(function(err, messages){
                if(err) throw err;
                return exits.success(messages);
            });
        });
    },
    /*
        description: creates a new message
        inputs:
            user: the current user id
            to: the user id that the user is sending to
            content: the content of the message
    */
    create: function(inputs, exits){
        var q = User.find({$or: [{_id: inputs.user}, {_id: inputs.to}]});
        q.exec(function(err, users) {
            if(err) throw err;
            users[0].password = null;
            users[1].password = null;
            var to = {};
            var from = {};
            if(users[0]._id == inputs.user){
                from = users[0];
                to = users[1];
            }else{
                from = users[1];
                to = users[0];
            }
            var message = new Message({
                to: to,
                from: from,
                content: inputs.content,
                createdOn: (new Date())       
            });
            message.save(function(err, message){
                if(err) throw err;
                return exits.success(message);
            });
        });
    }
}