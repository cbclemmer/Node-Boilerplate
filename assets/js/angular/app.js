(function(){
    var app = angular.module("app", ['user', 'friend', 'post', 'ngSanitize']);
    app.controller('initController', ['$http', '$scope', '$rootScope', '$sce', function(h, s, rs, $sce){
        var auth = getCookie("auth");
        if (auth == null||auth == "login"){
            h.defaults.headers.common.auth = "login";
        }else{
            h.defaults.headers.common.auth = auth;
        }
        h.get("/status").success(function(data){
            if(!data.info){
                rs.user = data;
                if(window.location.hash == "#feed"){
                    rs.state = "feed";
                    window.location.hash = "feed";
                }else if (window.location.hash == "#home"){
                    rs.state = "home";
                    window.location.hash = "home";
                    rs.pag = rs.user;
                    rs.pag.friends = 3;
                    h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                        if(data.err)
                            return showErr(data.err);
                        rs.pag.posts = data;
                    });
                }else{
                    rs.user = data;
                    rs.state = "feed";
                    window.location.hash = "feed";
                }
            }else{
                rs.state = "login";
                window.location.hash = "login";
            }
        });
        this.toHome = function(){
            rs.state = "home";
            window.location.hash = "home";
            rs.pag = rs.user;
            rs.pag.friends = 3;
            h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                if(data.err)
                    return showErr(data.err);
                rs.pag.posts = data;
            });
        }
    }]);
})();