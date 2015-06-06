(function(){
    var app = angular.module("friend", []);
    app.controller("friendController", ['$http', '$scope', '$rootScope', 'socket', function(h, s, rs, socket){
        this.get = function(page){
            h.get('/friend/get/'+rs.user._id+'/'+page).success(function(data){
                rs.user.friends = data;
            });
        }
        this.sendRequest = function(user){
            h.post("/friend/addrequest/"+user).success(function(data){
                if(data.err) showErr(data.err);
                rs.pag.friends = 1;
                socket.emit("fr", {sender: rs.user.username, reciever: user});
            });
        }
        this.acceptRequest = function(req){
            h.post("/friend/validaterequest/" + req).success(function(data) {
                if(data.err) return showErr(data.err);
                if(window.location.hash="#feed"){
                    if(rs.pag.nots.read){
                        for(var i=0;i<rs.pag.nots.read.length;i++){
                            if(rs.pag.nots.read[i].reference==data._id){
                                rs.pag.nots.read.splice(i, 1);
                            }
                        }
                    }
                    if(rs.pag.nots.unRead){
                        for(var i=0;i<rs.pag.nots.unRead.length;i++){
                            if(rs.pag.nots.unRead[i].reference==data._id){
                                rs.pag.nots.unRead.splice(i, 1);
                            }
                        }
                    }
                }
            });
        }
        this.deleteRequest = function(req){
            h.post("/friend/deleterequest/"+req).success(function(data) {
                if(data.err) return showErr(data.err);
                if(window.location.hash="#feed"){
                    if(rs.pag.nots.read){
                        for(var i=0;i<rs.pag.nots.read.length;i++){
                            if(rs.pag.nots.read[i].other._id==req){
                                rs.pag.nots.read.splice(i, 1);
                            }
                        }
                    }
                    if(rs.pag.nots.unRead){
                        for(var i=0;i<rs.pag.nots.unRead.length;i++){
                            if(rs.pag.nots.unRead[i].other._id==req){
                                rs.pag.nots.unRead.splice(i, 1);
                            }
                        }
                    }
                }
            })
        }
    }]);
})();