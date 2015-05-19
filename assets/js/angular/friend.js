(function(){
    var app = angular.module("friend", []);
    app.controller("friendController", ['$http', '$scope', '$rootScope', function(h, s, rs){
        this.get = function(page){
            h.get('/friend/get/'+rs.user._id+'/'+page).success(function(data){
                rs.user.friends = data;
            });
        }
    }]);
})();