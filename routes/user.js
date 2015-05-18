var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.get('/user/getone/:query', function(req, res){
        controllers.user.getOne(req.params, {
            success: function(user){
                res.json(user);
            }, error: function(error){
                res.json(error);
            }
        })
    });
    app.post('/user/create', function(req, res){
        redis.get("user", function(err, user){
            if(!user){
                controllers.user.create(req.query, {
                    success: function(user){
                        redis.set('user', user._id);
                        res.json(user);
                    },error: function(error){
                        res.json({err: error});
                    }
                });
            }else{
                return res.json({err: "You are logged in"});
            }
        })
    });
    app.post('/user/login', function(req, res){
        redis.get("user", function(err, user){
            if(!user){
                controllers.user.login(req.query, {
                    success: function(user){
                        redis.set('user', user._id);
                        res.json(user);
                    }, error: function(error){
                        res.json({err: error});
                    }
                });
            }else{
                return res.json({err: "You are logged in"});
            }
        });
    });
    app.post('/user/logout', function(req, res){
        redis.get("user", function(err, user){
            if(!user){
                return res.json({err: "Not logged in"});
            }
            redis.del("user");
            res.json({info: "Logged out successfully"});
        });
    });
} 