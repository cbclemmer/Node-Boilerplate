var redis = require("redis").createClient();

redis.on("error", function (err) { 
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.get("/mess/get/:page/:other", function(req, res){
        redis.get(req.get("auth"), function(err, user){
            if(err) throw err;
            if(!user) return res.json({err: "Not logged in"});
            controllers.message.get({user: user, other: req.params.other, page: req.params.page}, {
                success: function(messages){
                    return res.json(messages);
                }, error: function(error){
                    return res.json({err: error});
                }
            })
        });
    });
    app.post("/mess/send/:user", function(req, res){
        redis.get(req.get("auth"), function(err, user){
            if(err) throw err;
            if(!user) return res.json({err: "not logged in"});
            controllers.friend.getState({u1: user, u2: req.params.user}, {
                success: function(state){
                    if(state != 2) return res.json({err: "not friends"});
                    controllers.message.create({
                            user: user,
                            to: req.params.user,
                            content: req.body.content
                        }, {
                        success: function(mess){
                            return res.json(mess);
                        }
                    });
                }
            });
        });
    });
}