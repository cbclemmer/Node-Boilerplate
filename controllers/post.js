var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var User = mongoose.model('user', schemas.user);
var Post = mongoose.model('post', schemas.post);
var Friend = mongoose.model('friend', schemas.friend);

var marked = require("marked");
var slug  = require("slug");
var fs = require('fs');

module.exports = {
    /*
        description: creates a new post
        inputs: 
            owner: the user that wrote the post
            title, slug, target
        exits: 
            success
            error
    */
    create: function(inputs, exits){
        if(inputs.content==""||!inputs.content){
            return exits.error("Post empty");
        }else if(inputs.title==""||!inputs.title)
            return exits.error("Title empty");
        else{
            inputs.content = marked(inputs.content);
            var content = inputs.content;
            inputs.preview = inputs.content.slice(inputs.content.search("<p>"),(inputs.content.search("</p>"))).slice(0,400)+"...</p>";
            inputs.content = "";
            inputs.slug = slug(inputs.title);
            var time = new Date();
            inputs.createdOn = time;
            inputs.lastUpdated = time;
            if(inputs.public=="yes"){
                inputs.public = true;
            }else{
                inputs.public = false;
            }
            inputs.hearts = 0;
            User.findOne({_id: inputs.owner}, function(err, user){
                if (err) throw err;
                user.password = null;
                delete inputs.owner;
                var obj = inputs;
                obj.owner = user;
                (new Post(obj)).save(function(err, post){
                    if(err) throw err;
                    obj.slug += ("-"+post._id);
                    fs.writeFile("assets/views/posts/"+post._id+".html", content, function(err) {
                        if(err) throw err;
                        Post.update({_id: post._id}, obj, function(err, pos){
                            if(err) throw err;
                            return exits.success(post);
                        })
                    }); 
                });
            });
        }
    },
    /*
        description: edits a post that a user has rights to
        inputs:
            user: the user ID of the editor
            post: the ID of the post to be edited
            content: the new content of the post
    */
    edit: function(inputs, exits){
        Post.findOne({_id: inputs.post}, function(err, post){
            if(err) throw err;
            if(!post)
                return exits.error("Cannot find post");
            if(post.owner!=inputs.user)
                return exits.error("Do not have rights");
            post.content = marked(inputs.content);
            post.save(function(err, post){
                if(err) throw err;
                return exits.success(post);
            })
        });
    },
    
    /*
        description: deletes post
        inputs:
            user
            post
    */
    remove: function(inputs, exits){
        Post.findOne({_id: inputs.post}, function(err, post){
            if(err) throw err;
            if(!post)
                return exits.error("Cannot find post");
            if(post.owner!=inputs.user)
                return exits.error("Do not have rights");
            post.remove(function(err){
                if(err) throw err;
                return exits.success();
            })
        });
    },
    /*
        description: gets post html if the requirements are met
        inputs: 
            friends: boolean whether the user is friends with the owner
            user: the user that is requesting the post
            post: the id of the requested post
    */
    getText: function(inputs, exits){
        Post.findOne({_id: inputs.post}, function(err, post){
            if(err) throw err;
            if(!post)
                return exits.error("Could not find post");
            // If the user is the one that wrote the post
            if(post.owner._id == inputs.user)
                return exits.success(post._id);
            // if the post is public
            if (post.public)
                return exits.success(post._id);
            // if the user is friends with the user
            Friend.findOne({users: inputs.user, users: post.owner._id}, function(err, friend){
                if(err) throw err;
                if(friend)
                    return exits.success(post._id);
                return exits.error("You do not have permission");
            });
        });
    },
    /*
        description: returns the metadata about a post
        inputs:
            user: the current user id
            post: the id of the post
    */
    get: function(inputs, exits){
        Post.findOne({_id: inputs.post}, function(err, post){
            if(err) throw err;
            if(!post)
                return exits.error("Could not find post");
            // If the user is the one that wrote the post
            if(post.owner._id == inputs.user)
                return exits.success(post);
            // if the post is public
            if (post.public)
                return exits.success(post);
            // if the user is friends with the user
            Friend.findOne({$and: [{users: inputs.user}, {users: post.owner._id}]}, function(err, friend){
                if(err) throw err;
                if(friend)
                    return exits.success(post);
                return exits.error("You do not have permission");
            });
        });
    },
    /*
        description: gets posts for a user after a certain period of time
        inputs:
            current: the current user's id
            time: the time of last post on that page
            user: the id of the user to get the posts for
    */
    getNew: function(inputs, exits){
        var q = Post.find({createdOn: {$gt: inputs.time}, target: inputs.user});
        q.sort("-createdOn");
        q.exec(function(err, posts){
            if(err) throw err;
            return exits.success(posts);
        });
    }
}