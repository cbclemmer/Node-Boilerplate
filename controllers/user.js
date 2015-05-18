var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var User = mongoose.model('user', schemas.user);

var objectID = require("mongodb").ObjectID;
var bCrypt = require("bcrypt")
module.exports = {
    /*
        description: gets the user info from an ID, an email, or username
        inputs:
            query
        exits: 
            success
            error
    */
    getOne: function(inputs, exits){
        var q;
        if((new RegExp("^[0-9a-fA-F]{24}$").test(inputs.query)))
            q = User.findOne({_id: inputs.query});
        else
            q = User.findOne({$or: [{username: inputs.query}, {email: inputs.query}]});
        q.exec(function(err, user){
            if(err) throw err;
            if(user){
                delete user.password;
                return exits.success(user);
            }
            return exits.error("User not found");
        });
    },
    
    /*
        inputs: 
            name, username, email, password, cpass
        exits: 
            success: returns the user variable
            error: returns a string with the error
    */
    create: function(inputs, exits){
        //Validation
        if(inputs.password!=inputs.cpass)
            return exits.error("Passwords do not match");
        if(!inputs.username||!inputs.email||!inputs.password||!inputs.name||!inputs)
            return exits.error("The form is incomplete");
        if(inputs.username.search(" ")!=-1||inputs.username.search(",")!=-1||inputs.username.search("<")!=-1)
            return exits.error("There is whitespace in the username");
        else if(inputs.password.length<8)
            return exits.error("The password must be at least 8 characters long");
        if(!require("validator").isEmail(inputs.email))
            return exits.error("Email is not valid");
        inputs.email = inputs.email.toLowerCase();
        User.findOne({$or: [{email: inputs.email}, {username: inputs.username}]}, {username: true, email: true}, function(err, user){
                if(err)  throw err;
                if(!user){
                    var nUser = inputs;
                    nUser.db = null;
                    nUser.cpass = null;
                    bCrypt.hash(inputs.password, 10, function(err, hash){
                        if(err) throw err;
                        nUser.password = hash;
                        nUser.confirmed = false;
                        (new User(nUser)).save(function(err, user){
                            if(err) throw err;
                            delete user.password;
                            return exits.success(user);
                        });
                        
                    });
                }else{
                    if(user.username==inputs.username){
                        return exits.error("Username taken");
                    }else if(user.email==inputs.email){
                        return exits.error("Email taken");
                    }
                }
        });
    }, 
    
    /*
        inputs: 
            un: can either be the username or password,
            password
        exits:
            success: returns the user
            error
    */
    login: function(inputs, exits){
        User.findOne({$or: [{username: inputs.un}, {email: inputs.un}]}, function(err, user){
            if(err) throw err;
            if(user){
                bCrypt.compare(inputs.password, user.password, function(err, res){
                    if(err) throw err;
                    if(res){
                        delete user.password;
                        return exits.success(user);
                    }else{
                        return exits.error("Password was incorrect");
                    }
                })
            }else{
                exits.error("Username or email not found");
            }
        });
    }
}