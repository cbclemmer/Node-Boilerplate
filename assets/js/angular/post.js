(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$http','$scope', '$rootScope', function(h,s, rs){
        this.create = function(obj){
            obj.public = "yes";
            if(!obj.target) obj.target = rs.user._id;
            h.post("/post/create/"+obj.target, obj).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Post created");
            });
        }
        this.show = function(post){
            h.get("/post/get/"+post._id).success(function(data){
                if(data.err) return showErr(data.err);
                window.location.hash = "/@"+post.owner.username+"/"+post.slug;
                rs.state = "post";
                rs.pag.content = data
            });
        }
    }]);
})();