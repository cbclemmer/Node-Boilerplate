(function(){
    var app = angular.module("socke", []);
    app.controller("socketController", ['$scope', '$rootScope', 'socket', function(s, rs, socket){
        socket.emit("news", "hello world");
    }]);
})();