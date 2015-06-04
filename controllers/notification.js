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
    }
}