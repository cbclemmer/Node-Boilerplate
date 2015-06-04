var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var Friend = mongoose.model('friend', schemas.friend);
var User = mongoose.model('user', schemas.user);
var Not = mongoose.model('notification', schemas.notification);

module.exports = {
    /*
        description: reads a single notification
        inputs:
            user: the user it belongs to
            not: the id of the notification
    */
    read: function(inputs, exits){
        User.findOne({_id: inputs.user}, function(err, user){
            if(err) throw err;
            Not.findOne({_id: inputs.not, 'owner.username': user.username}, function(err, not){
                if(err) throw err;
                not.state = 1;
                not.save();
                return exits.success();
            });
            
        })
    },
    /*
        description: returns a list of read notifications
        inputs:
            user
    */
    getOld: function(inputs, exits){
        User.findOne({_id: inputs.user}, function(err, user){
            if(err) throw err;
            var q = Not.find({state: 1, 'owner.username': user.username});
            q.sort("-createdOn");
            q.limit(50);
            q.exec(function(err, nots){
                if(err) throw err;
                return exits.success(nots);
            });
        });
    }
}