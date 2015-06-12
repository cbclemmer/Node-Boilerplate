(function(){
    var app = angular.module("app", ['user', 'friend', 'post', 'message', 'ngSanitize', 'btford.socket-io']).
    // Socket
    factory('socket', function (socketFactory) {
        return socketFactory();
    });
    /*
        The state determines what part of the page is shown
        States:
            user:   a page for a specific user
            mess:   messaging a user
            feed:   the user feed
            home:   shows the current user's posts
            post:   shows an article
            login:  login screen
    */
    app.controller('initController', ['$http', '$scope', '$rootScope', '$sce', 'socket', function(h, s, rs, $sce, socket){
        // get the authentication token if it exists
        var auth = getCookie("auth"); 
        // emit the authentication token so that the server knows what socket it is now on
        socket.emit("auth", auth);
        //initialize the notifications
        rs.nots = {
            unRead: [],
            read: []
        };
        
        // if there is no authentencation token
        if (auth == null||auth == "login"){
            // set the headers to login
            h.defaults.headers.common.auth = "login";
        }else{
            // set the headers to the authentication token
            h.defaults.headers.common.auth = auth;
        }
        
        // determine if the user is logged in
        h.get("/status").success(function(data){
            if(!data.info){
                // set the user data
                rs.user = data;
                
                /*
                #########################
                            Feed
                #########################
                */
                if(window.location.hash == "#feed"){
                    rs.state = "feed";
                    // get the notifications for this user
                    h.get("/user/getnots").success(function(data){
                        if(data.err) return showErr(data.err);
                        rs.pag = {};
                        rs.nots.unRead = data;
                    });
                /*
                #########################
                            Home
                #########################
                */
                }else if (window.location.hash == "#home"){
                    rs.state = "home";
                    rs.pag = rs.user;
                    // make sure that the div that shows your relationship does not show
                    rs.pag.friends = 3;
                    //get the first page of posts for the current user
                    h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                        if(data.err) return showErr(data.err);
                        rs.pag.posts = data;
                        // add a formatted date to them
                        for(var i =0;i<data.length;i++){
                            rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                        }
                    });
                /*
                #############################
                    User page or article
                #############################
                */
                // if there is an @ in the hash
                }else if(window.location.hash.search("@") != -1){
                    // the slug for the article will be located in the third section of the hash
                    var slug = window.location.hash.split("/")[3];
                    var username = window.location.hash.slice((window.location.hash.search("@") + 1), window.location.hash.search("/"));
                    // if there is a slug, then you have to chop the slug part off of the username
                    if(slug)
                        username = username.slice(0,username.search("/"));
                    // get the details of the user for this page or article
                    h.get("/user/getone/"+username).success(function(user){
                        if(user.err) return showErr(user.err);
                        /*
                        #########################
                                Article
                        #########################
                        */
                        if(slug){
                            rs.state = "post";
                            h.get("/post/gettext/"+slug.split("-")[window.location.hash.split("/")[3].split("-").length-1]).success(function(data){
                                if(data.err) return showErr(data.err);
                                rs.pag = user;
                                rs.pag.content = data;
                                h.get("/post/get/"+slug.split("-")[window.location.hash.split("/")[3].split("-").length-1]).success(function(data){
                                    rs.pag.post = data;
                                    rs.pag.post.createdOn = moment(rs.pag.post.createdOn).format('LLL');
                                });
                            });
                        /*
                        #########################
                                User
                        #########################
                        */
                        }else{
                            // start listening for changes to the user
                            socket.emit("toUser", {auth: getCookie("auth"), user: username});
                            // get the posts for this user
                            h.get("/user/getposts/1/"+user._id).success(function(posts){
                                if(posts.err) return showErr(posts.err);
                                rs.state = "user";
                                // set the page to the user
                                rs.pag = user;
                                rs.pag.posts = posts;
                                for(var i =0;i<posts.length;i++){
                                    rs.pag.posts[i].prettyCreated = moment(rs.pag.posts[i].createdOn).format('LLL');
                                }
                                // this variable tracks if a new post is made. 
                                rs.pag.newPosts = 0;
                                // determine the relationship between the two users
                                h.get("/friend/getstate/"+rs.user._id+"/"+user._id).success(function(state){
                                    rs.pag.friends = state.state;
                                });
                            });
                        }
                    });
                }
            /*
            ####################
                    Login
            ####################
            */
            }else{
                rs.state = "login";
                window.location.hash = "login";
            }
        });
        this.toHome = function(){
            $(window).scrollTop(0);
            h.get("/user/getposts/1/"+rs.user._id).success(function(data){
                if(data.err) return showErr(data.err);
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
                    if(posts.err) return showErr(posts.err);
                    rs.state = "user";
                    window.location.hash = "@"+username+"/posts";
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
        /*
        #####################
                Message
        #####################
        */
        this.toMess = function(username){
            $(window).scrollTop(0);
            h.get("/user/getone/"+username).success(function(user) {
                if(user.err) return showErr(user.err);
                rs.state = "mess";
                socket.emit("toMess", {auth: getCookie("auth"), user: username});
                window.location.hash = "@"+username+"/messages";
                rs.pag = user;
                h.get("/mess/get/1/"+username).success(function(mess) {
                    if(mess.err) showErr(mess.err);
                    for(var i=0;i<mess.length;i++){
                        mess[i].created = moment(mess[i].createdOn).format('LLL');
                    }
                    rs.pag.messages = mess;
                    var objDiv = document.getElementById("messages");
                    objDiv.scrollTop = objDiv.scrollHeight;
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
            if(data.message&& window.location.hash.search('@')!=-1){
                rs.pag.messages.push(data.message);
                return;
            }
            if(data.message){
                return rs.nots.unRead.push(data.not);
            }
            rs.nots.unRead.push(data);
        });
        socket.on("post", function(data){
            rs.pag.newPosts += 1;
        });
    }]);
})();