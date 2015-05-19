var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var User = mongoose.model('user', schemas.user);

module.exports = {
    /*
        inputs: 
            query: the search term
        exits:
            success
    */
    
    search: function(inputs, exits){
        var reg = new RegExp(inputs.query, 'i');
        var q = User.find({$or: [{username: reg}, {email: reg}]}).select('username email name').limit(10).sort('+username');
        q.exec(function(err, users){
            if(users){
                for(var i=0;i<users.length;i++){
                    users[i].password = undefined;
                }
                return exits.success(users);
            }else{
                return exits.error("No users found");
            }
        });
    },
    
    status: function(inputs, exits){
        User.findOne({_id: inputs.user}, function(err, user){
            if(err) throw err;
            if(!user)
                return exits.error("Could not find user");
            return exits.success(user);
        });
    }
}