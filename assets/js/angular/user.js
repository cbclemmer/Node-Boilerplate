(function(){
    var app = angular.module("user", []);
    app.controller("userController", ['$http', '$scope', '$rootScope', function(h, s, rs){
        s.register = {};
        s.login = {};
        this.login = function(username, password){
            h.post("/user/login?un="+username+"&password="+password).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showinfo("Logged in");
                rs.user = data;
                rs.state = "home";
                window.location.hash = "home"
            });
        }
        this.register = function(obj){
            h.post("/user/create", obj).success(function(data){
                
            });
        }
        this.logout = function(){
            h.post('/user/logout').success(function(data){
                window.location.hash = "login";
                rs.state = "login";
                showinfo("Logged out");
            });
        }
    }]);
})();