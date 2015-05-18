var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var Friend = mongoose.model('friend', schemas.friend);
module.exports = {
    /*
        description: tests the state of two users
            0: nothing
            1: request
            2: friends
        inputs:
            u1, u2
        exits:
            success: returns true
            error: returns false
    */
    getFriendState: function(inputs, exits){
        Friend.findOne({users: {$elemMatch: inputs.u1}, users: {$elemMatch: inputs.u2}}, function(err, friend){
            if(err) throw err;
            if(friend)
                return exits.success(friend.state);
            return exits.success(0);
        });
    },
}