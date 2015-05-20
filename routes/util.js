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
    app.get('/', function(req, res) {
        res.render('index.html');
    });
}