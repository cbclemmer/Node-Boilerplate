(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$http','$scope', '$rootScope', function(h,s, rs){
        console.log("post");
        this.create = function(obj){
            obj.public = "yes";
            if(!obj.target) obj.target = rs.user._id;
            h.post("/post/create/"+obj.target+"?title="+obj.title+"&public="+obj.public, {post: obj.content}).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Post created");
            });
        }
    }]);
})();