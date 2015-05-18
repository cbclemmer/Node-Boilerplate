var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var Friend = mongoose.model('friend', schemas.friend);
module.exports = {
    /*
        description: gets friends from a specific user. if not specified it gets them from the currently logged in one
        inputs:
            user, page
    */
    get: function(inputs, exits){
        var q = Friend.find({users: inputs.user, state: 2});
        q.sort('-createdOn');
        q.limit(20);
        q.skip(inputs.page*20);
        q.exec(function(err, friends){
            if(err) throw err;
            if(friends)
                return exits.success(friends);
            else
                return exits.error("No friends");
        });
    },
    
    getRequests: function(inputs, exits){
        var q = Friend.find({users: inputs.user, state: 1});
        q.sort('-createdOn');
        q.limit(20);
        q.skip(inputs.page*20);
        q.exec(function(err, friends){
            if(err) throw err;
            if(friends)
                return exits.success(friends);
            else
                return exits.error("No friend requests");
        });
    },
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
    getState: function(inputs, exits){
        Friend.findOne({users: inputs.u1, users: inputs.u2}, function(err, friend){
            if(err) throw err;
            if(friend)
                return exits.success(friend.state);
            return exits.success(0);
        });
    },
    
    /*
        description: adds a friend request
        inputs: 
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    addRequest: function(inputs, exits){
        Friend.findOne({users: inputs.user, users: inputs.request}, function(err, friend){
            if(err) throw err;
            if(friend){
                return exits.error("Request already sent");
            }
            var obj = {users: [inputs.user, inputs.request], requestTo: inputs.request, state: 1, createdOn: (new Date())};
            (new Friend(obj)).save(function(err, friend){
                if(err) throw err;
                return exits.success(friend);
            });
        });
    },
    
    /*
        description: deletes a friend request
        inputs:
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    deleteRequest: function(inputs, exits){
        Friend.findOne({users: inputs.user, users: inputs.request}, function(err, friend){
            if(err) throw err;
            if(!friend)
                return exits.error("Request not found");
            if(friend.state==2)
                return exits.error("Already friends");
            Friend.remove({users: inputs.user, users: inputs.request}, function(err){
                if(err) throw err;
                return exits.success();
            })
        });
    },
    
    /*
        description: validates a friend request
        inputs: 
            user: the user that is logged in.
            request: the ID that you are making a request to.
    */
    validateRequest: function(inputs, exits){
        Friend.findOne({users: inputs.user, users: inputs.request}, function(err, friend){
            if(err) throw err;
            if(!friend)
                return exits.error("Request not found");
            if(friend.state==2)
                return exits.error("Already friends");
            if(friend.requestTo==inputs.user){
                friend.state = 2;
                friend.createdOn = new Date();
                friend.save(function(err, friend){
                    return exits.success(friend);
                });
            }else{
                return exits.error("User cannot validate");
            }
            
        });
    }
}