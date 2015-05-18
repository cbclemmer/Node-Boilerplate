var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

module.exports = function(app, controllers){
    app.post('/post/create', function(req, res){
        redis.get("user", function(err, user){
            if(user){
            if(err) throw err;
            
                var obj = req.query;
                obj.content = req.get("post");
                obj.user = user;
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
        })
        
    });
};