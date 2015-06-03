var redis = require("redis").createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

//takes in an array and returns a new unique value
function getunique(arr){
    var s = require("random-string")({length: 20});
    for(var i=0;i<arr.length;i++){
        if(arr[i]==s)
            return getunique(arr);
    }
    return s;
}

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
        var auth = req.get('auth');
        if(!auth)
            return res.json({err: "Invalid format"});
        else if(auth=="login"){
            controllers.user.create(req.query, {
                success: function(user){
                    redis.get("auths", function(err, auths){
                    if(!auths) auths = [];
                        auth = getunique(auths);
                        redis.set("auths", auths);
                        redis.set(auth, user._id);
                        res.json({user: user, auth: auth});
                    });
                    },error: function(error){
                    res.json({err: error});
                }
            });
        }else{
            return res.json({err: "You are logged in"});
        }
    });
    app.post('/user/login',  function(req, res){
        var auth = req.get("auth");
        if(!auth)
            return res.json({err: "Invalid format"});
        else if(auth=="login"){
            controllers.user.login(req.body, {
                success: function(user){
                    redis.get("auths", function(err, auths){
                        if(!auths) auths = [];
                        auth = getunique(auths);
                        redis.set("auths", auths);
                        redis.set(auth, user._id);
                        res.json({user: user, auth: auth});
                    });
                }, error: function(error){
                    res.json({err: error});
                }
            });
        }else{
            res.json({err: "Already logged in"});
        }
    });
    app.post('/user/logout', function(req, res){
        redis.get(req.get('auth'), function(err, user){
            if(err) throw err;
            if(!user)
                return res.json({err: "Not logged in"});
            redis.del(req.get("auth"));
            res.json({info: "Logged out successfully"});
        });
    });
}