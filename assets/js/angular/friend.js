(function(){
    var app = angular.module("friend", []);
    app.controller("friendController", ['$http', '$scope', '$rootScope', function(h, s, rs){
        this.get = function(page){
            h.get('/friend/get/'+rs.user._id+'/'+page).success(function(data){
                rs.user.friends = data;
            });
        }
        this.sendRequest = function(user){
            h.post("/friend/addrequest/"+user).success(function(data){
                if(data.err) showErr(data.err);
                rs.pag.friends = 1;
            });
        }
    }]);
})();