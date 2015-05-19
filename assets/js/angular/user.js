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
            var s = "/user/create?";
            for(var keys in obj){
                s += keys + "=" + obj[keys] + "&";
            }
            h.post(s).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showinfo("Registration successful");
                rs.user = data;
                rs.state = "home";
                window.location.hash = "home"
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