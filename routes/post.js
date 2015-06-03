var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.post('/post/create/:target', function(req, res){
        redis.get(req.get("auth"), function(err, user) {
            if(err) throw err;
            if(user){
                var obj = req.body;
                obj.owner = user;
                controllers.post.create(obj, {
                    success: function(post){
                        res.json(post);
                    },
                    error: function(error){
                        res.json({err: error});
                    }
                });    
            }else{
                res.json({err: "Not logged in"});
            }
        });
    });
    app.post('/post/edit/:post', function(req, res){
        redis.get(req.get("auth"), function(err, user) {
            if(err) throw err;
            if(!user)
                return res.json({err: "Not logged in"});
            var obj = {};
            obj.content = req.get("post");
            obj.post = req.params.post;
            obj.user = user;
            controllers.post.edit(obj, {
                success: function(post){
                    res.json(post);
                }, error: function(error){
                    res.json({err: error});
                }
            })
        });
    });
    app.post('/post/remove/:post', function(req, res){
        redis.get(req.get("auth"), function(err, user) {
            if(err) throw err;
            if(!user)
                return res.json({err: "Not logged in"});
            var obj = {
                post: req.params.post,
                user: user
            };
            controllers.post.remove(obj, {
                success: function(){
                    res.json({info: true});
                }, error: function(error){
                    res.json({err: error});
                }
            })
        });
    });
    app.get('/post/get/:post', function(req, res){
        redis.get(req.get("auth"), function(err, user){
            if(err) throw err;
            controllers.post.getOne({user: user, post: req.params.post}, {
                success: function(post){
                    return res.render("posts/"+post);
                }, error: function(error){
                    return res.json({err: error});
                }
            })
        });
    })
};