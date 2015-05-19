var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.post('/post/create/:target', function(req, res){
        redis.get("user", function(err, user){
            if(err) throw err;
            if(user){
                var obj = req.query;
                obj.target = req.params.target;
                obj.owner = user;
                obj.content = req.body.post;
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
        redis.get("user", function(err, user){
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
        redis.get('user', function(err, user){
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
};