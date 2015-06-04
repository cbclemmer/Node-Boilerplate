var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var User = mongoose.model('user', schemas.user);
var Post = mongoose.model('post', schemas.post);
var Not = mongoose.model('notification', schemas.notification);

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
                user.password = undefined;
                return exits.success(user);
            }
            return exits.error("User not found");
        });
    },
    /*
        description: gets the posts from the selected user
            show all: friends or same as logged in
            just public: not friends or not logged in
        inputs: 
            friends:    boolean whether they are friends or not
            target:     The user ID that you are gettinmg the posts from
            page:       for pagination the page number
    */
    getPosts: function(inputs, exits){
        var q;
        if(inputs.friends)
            q = Post.find({target: inputs.target});
        else
            q = Post.find({target: inputs.target, public: true});
        q.limit(15);
        q.skip((parseInt(inputs.page)-1)*15);
        q.sort('-createdOn');
        q.exec(function(err, posts){
            if(err) throw err;
            if(posts)
                return exits.success(posts);
            return exits.error("No posts found");
        });
    },

    /*
        description: gets notifications for a specific user
            sends back two lists: read and unread
        inputs:
            user: the user to get the notifications for
    */
    getNots: function(inputs, exits){
        User.findOne({_id: inputs.user}, function(err, user){
            if(err) throw err;
            var q = Not.find({state: 0, 'owner.username': user.username});
            q.sort("-createdOn");
            q.exec(function(err, nots){ 
                if(err) throw err;
                return exits.success(nots);
            });
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
                            user.password = undefined;
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
                        user.password = undefined;
                        return exits.success(user);
                    }else{
                        return exits.error("Password was incorrect");
                    }
                })
            }else{
                exits.error("Username or email not found");
            }
        });
    },
}