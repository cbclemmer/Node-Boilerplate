var mongoose = require("mongoose");
var schemas = require("../schemas/index.js");

var User = mongoose.model('user', schemas.user);
var Post = mongoose.model('post', schemas.post);

var marked = require("marked");
var slug  = require("slug");

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
            (new Post(inputs)).save(function(err, post){
                if(err) throw err;
                return exits.success(post);
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
    }
}