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
                res.json({users: users});
            }
        });
    });
    app.get('/', function(req, res) {
        res.render('index.html');
    })
}