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
                }else if (window.location.hash == "#home"){
                    rs.state = "home";
                    rs.pag = rs.user;
                    rs.pag.friends = 3;
                    h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                        if(data.err)
                            return showErr(data.err);
                        rs.pag.posts = data;
                    });
                }else if(window.location.hash.search("@") != -1){
                    if(window.location.hash.split("/")[2].split("-")[window.location.hash.split("/")[2].split("-").length-1]){
                        rs.state = "post";
                        h.get("/post/get/"+window.location.hash.split("/")[2].split("-")[window.location.hash.split("/")[2].split("-").length-1]).success(function(data){
                            if(data.err) return showErr(data.err);
                            rs.pag = {}
                            rs.pag.content = data;
                        });
                    }
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