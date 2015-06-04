(function(){
    var app = angular.module("user", []);
    app.controller("userController", ['$http', '$scope', '$rootScope', function(h, s, rs){
        s.register = {};
        s.login = {};
        this.login = function(username, password){
            var obj = {
                un: username,
                password: password
            }
            h.post("/user/login", obj).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Logged in");
                rs.user = data.user;
                config.headers.auth = data.auth;
                h.defaults.headers.common.auth = data.auth;
                rs.state = "home";
                document.cookie = "auth="+data.auth;
                window.location.hash = "home"
            });
        }
        this.register = function(obj){
            h.post("/user/create", obj).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Registration successful");
                rs.user = data.user;
                config.headers.auth = data.auth;
                rs.state = "home";
                document.cookie = "auth="+data.auth;
                window.location.hash = "home"
            });
        }
        this.logout = function(){
            h.post('/user/logout', {}, config).success(function(data){
                window.location.hash = "login";
                rs.state = "login";
                h.defaults.headers.common.auth = "login";
                document.cookie = "auth=login"
                showInfo("Logged out");
            });
        }
    }]);
})();