(function(){
    var app = angular.module("post", []);
    app.controller("postController", ['$http','$scope', '$rootScope', 'socket', function(h,s, rs, socket){
        this.create = function(obj){
            obj.public = "yes";
            if(!obj.target) obj.target = rs.user._id;
            this.post = {};
            $("#preview").empty();
            $("#newPostButton").rotate(0);
			$("#newPost").slideUp();
            h.post("/post/create/"+obj.target, obj).success(function(data){
                if(data.err)
                    return showErr(data.err);
                showInfo("Post created");
            });
            socket.emit("post", rs.user.username);
        }
        this.show = function(post){
            $(window).scrollTop(0);
            h.get("/post/gettext/"+post._id).success(function(data){
                if(data.err) return showErr(data.err);
                window.location.hash = "/@"+post.owner.username+"/"+post.slug;
                rs.state = "post";
                rs.pag.content = data;
                h.get("/post/get/"+post._id).success(function(data) {
                    if(data.err) return showErr(data.err);
                    rs.pag.post = data;
                    rs.pag.post.createdOn = moment(rs.pag.post.createdOn).format('LLL');
                });
            });
        }
        this.getNew = function(){
            if(rs.pag.posts){
                h.post("/post/getnew/"+rs.pag._id, {created: rs.pag.posts[0].createdOn}).success(function(data){
                    if(data.err) return showErr(data.err);
                    for (var i = (data.length-1);i>=0;i--){
                        rs.pag.posts.unshift(data[i]);
                    }
                    rs.pag.newPosts = 0;
                });
            }
        }
    }]);
})();