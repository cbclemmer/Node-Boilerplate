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
            User.findOne({$or: [{username: inputs.target}, {email: inputs.target}]}, function(err, user){
                if(err) return err;
                if(user){
                    inputs.target = user._id
                }
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
            });
        }
    }
}