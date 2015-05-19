(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$http', '$httpProvider', '$scope', '$rootScope', function(h, $httpProvider, s, rs){
        this.create = function(obj){
            $httpProvider.defaults.headers.get = { 'post' : obj.post };
            h.post("/post/create/"+obj.target+"?title="+obj.title+"&public="+obj.public).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Post created");
            });
        }
    }]);
})();