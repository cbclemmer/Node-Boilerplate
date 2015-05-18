var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.get('/friend/get/:user/:page', function(req, res){
        controllers.friend.get(req.params, {
            success: function(friends){
                res.json(friends);
            }, error: function(error){
                res.json({err: error});
            }
        });
    });
    app.get('/friend/getrequests/:user/:page', function(req, res) {
        controllers.friend.getRequests(req.params, {
            success: function(friends){
                res.json(friends);
            }, error: function(error){
                res.json({err: error});
            }
        });
    });
    app.get('/friend/getstate/:u1/:u2', function(req, res){
        controllers.friend.getState(req.params, {
            success: function(state){
                return res.json({state: state});
            }
        });
    });
    app.post('/friend/addrequest/:request', function(req, res){
        redis.get('user', function(err, user){
            if(user){
                var obj = req.params;
                obj.user = user;
                controllers.friend.addRequest(obj, {
                    success: function(friend){
                        res.json(friend);
                    }, error: function(error){
                        res.json({err: error});
                    }
                })
            }else{
                res.json({err: "Not logged in"});
            }
        })
    });
    app.post('/friend/deleterequest/:request', function(req, res){
        redis.get("user", function(err, user){
            if(user){
                var obj = req.params;
                obj.user = user;
                controllers.friend.deleteRequest(obj, {
                    success: function(){
                        res.json({info: "Deleted"});
                    }, error: function(error){
                        res.json({err: error});
                    }
                })
            }else{
                res.json({err: "Not logged in"});
            }
        })
    });
    app.post('/friend/validaterequest/:request', function(req, res){
            redis.get("user", function(err, user){
                if(user){
                    var obj = req.params;
                    obj.user = user;
                    controllers.friend.validateRequest(obj, {
                        success: function(friend){
                            res.json(friend);
                        }, error: function(error){
                            res.json({err: error});
                        }
                    })
                }else{
                    res.json({err: "Not logged in"});
                }
            });
    });
}