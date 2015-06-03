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
                rs.state = "home";
                window.location.hash = "home";
            }else{
                rs.state = "login";
                window.location.hash = "login";
            }
            
        });
    }]);
})();