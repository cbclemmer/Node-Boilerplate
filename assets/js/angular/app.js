(function(){
    var app = angular.module("app", ['user', 'friend', 'post', 'ngSanitize']);
    app.controller('initController', ['$http', '$scope', '$rootScope', '$sce', function(h, s, rs, $sce){
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