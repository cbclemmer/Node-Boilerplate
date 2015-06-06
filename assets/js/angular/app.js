(function(){
    var app = angular.module("app", ['user', 'friend', 'post', 'ngSanitize', 'btford.socket-io']).
    factory('socket', function (socketFactory) {
        return socketFactory();
    });
    app.controller('initController', ['$http', '$scope', '$rootScope', '$sce', 'socket', function(h, s, rs, $sce, socket){
        var auth = getCookie("auth"); 
        socket.emit("auth", auth);
        rs.nots = {
            unRead: [],
            read: []
        };
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
                    h.get("/user/getnots").success(function(data){
                        if(data.err) return showErr(data.err);
                        rs.pag = {};
                        rs.nots.unRead = data;
                    });
                }else if (window.location.hash == "#home"){
                    rs.state = "home";
                    rs.pag = rs.user;
                    rs.pag.friends = 3;
                    h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                        if(data.err)
                            return showErr(data.err);
                        rs.pag.posts = data;
                        for(var i =0;i<data.length;i++){
                            rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                        }
                    });
                }else if(window.location.hash.search("@") != -1){
                    var slug = window.location.hash.split("/")[2];
                    var username = window.location.hash.slice((window.location.hash.search("@") + 1))
                    if(slug)
                        username = username.slice(0,username.search("/"));
                    h.get("/user/getone/"+username).success(function(user){
                        if(user.err) return showErr(user.err);
                        if(slug){
                            rs.state = "post";
                            h.get("/post/gettext/"+slug.split("-")[window.location.hash.split("/")[2].split("-").length-1]).success(function(data){
                                if(data.err) return showErr(data.err);
                                rs.pag = user;
                                rs.pag.content = data;
                                h.get("/post/get/"+slug.split("-")[window.location.hash.split("/")[2].split("-").length-1]).success(function(data){
                                    rs.pag.post = data;
                                    rs.pag.post.createdOn = moment(rs.pag.post.createdOn).format('LLL');
                                });
                            });
                        }else{
                            socket.emit("toUser", {auth: getCookie("auth"), user: username});
                            h.get("/user/getposts/1/"+user._id).success(function(posts){
                                if(posts.err)
                                    return showErr(posts.err);
                                rs.state = "user";
                                rs.pag = user;
                                rs.pag.posts = posts;
                                for(var i =0;i<posts.length;i++){
                                    rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                                }
                                rs.pag.newPosts = 0;
                                h.get("/friend/getstate/"+rs.user._id+"/"+user._id).success(function(state){
                                    rs.pag.friends = state.state;
                                });
                            });
                        }
                    });
                }
            }else{
                rs.state = "login";
                window.location.hash = "login";
            }
        });
        this.toHome = function(){
            $(window).scrollTop(0);
            h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                if(data.err)
                    return showErr(data.err);
                rs.state = "home";
                window.location.hash = "home";
                rs.pag = rs.user;
                rs.pag.friends = 3;
                rs.pag.posts = data;
                for(var i =0;i<data.length;i++){
                    rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                }
            });
        }
        this.toFeed = function(){
            $(window).scrollTop(0);
            if(!rs.pag) rs.pag = {}
            rs.state = "feed";
            window.location.hash = "feed";
            h.get("/user/getnots").success(function(data){
                if(data.err) return showErr(data.err);
                rs.nots.unRead = data;
            });
        }
        this.toUser = function(username){
            $(window).scrollTop(0);
            socket.emit("toUser", {auth: getCookie("auth"), user: username});
            h.get("/user/getone/"+username).success(function(user){
                if(user.err) return showErr(user.err);
                h.get("/user/getposts/1/"+user._id).success(function(posts){
                    if(posts.err)
                        return showErr(posts.err);
                    rs.state = "user";
                    window.location.hash = "@"+username;
                    rs.pag = user;
                    rs.pag.posts = posts;
                    rs.pag.newPosts = 0;
                    for(var i =0;i<posts.length;i++){
                        rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                    }
                    h.get("/friend/getstate/"+rs.user._id+"/"+user._id).success(function(state){
                        rs.pag.friends = state.state;
                    });
                });
            });
        }
        this.readNot = function(not){
            h.post("/not/read/"+not).success(function(data){
                if(data.err) return showErr(data.err);
                for (var i=0;i<rs.nots.unRead.length;i++){
                    if(rs.nots.unRead[i]._id == not){
                        rs.nots.unRead[i].state = 1;
                        var obj = rs.nots.unRead[i];
                        if(!rs.nots.read)
                            rs.nots.read = [obj];
                        rs.nots.unRead.splice(i, 1);
                        break;
                    }
                }
            });
        }
        this.delNot = function(not){
            h.post("/not/delnot/"+not).success(function(data) {
                if(data.err) return showErr(data.err);
                for (var i=0;i<rs.nots.unRead.length;i++){
                    if(rs.nots.unRead[i]._id == not){
                        rs.nots.unRead[i].state = 1;
                        var obj = rs.nots.unRead[i];
                        if(!rs.nots.read)
                            rs.nots.read = [obj];
                        rs.nots.unRead.splice(i, 1);
                        break;
                    }
                }
            })
        }
        this.getOldNots = function(){
            h.get("/not/getold").success(function(data){
                if(data.err) return showErr(data.err);
                rs.nots.read = data;
            });
        }
        /*
        #######################
                Sockets
        #######################
        */
        socket.on("not", function(data){
            rs.nots.unRead.push(data);
        });
        socket.on("post", function(data){
            rs.pag.newPosts += 1;
        });
    }]);
})();