var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    /*
        description: searches for a user
        inputs:
            query: the string to look for a user
        exits: 
            success
    */
    app.get("/search/:query", function(req, res){
        controllers.util.search(req.params, {
            success: function(users){
                res.json(users);
            }
        });
    });
    app.get('/status', function(req, res){
        redis.get(req.get("auth"), function(err, user){
            if(user){
                controllers.util.status({user: user}, {
                    success: function(user){
                        res.json(user);
                    }, error: function(error){
                        res.json({info: error});
                    }
                });
            }else{
                res.json({info: "not logged in"});
            }
        });
    });
    app.post("/not/read/:not", function(req, res){
       redis.get(req.get("auth"), function(err, user) {
           if(!user)
                return res.json({err: "Not logged in"});
            controllers.notification.read({not: req.params.not, user: user}, {
                success: function(){
                    return res.json({status: true});
                }
            })
       })
    });
    app.get("/not/getold", function(req, res) {
        redis.get(req.get("auth"), function(err, user) {
            if(!user)
                return res.json({err: "Not logged in"});
            controllers.notification.getOld({user: user}, {
                success: function(nots){
                    return res.json(nots);
                }
            });
        })
    })
    app.get('/', function(req, res) {
        res.render('index.html');
    });
}