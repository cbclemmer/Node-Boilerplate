(function(){
    var app = angular.module("message", []);
    app.controller("messageController", ['$http', '$scope', '$rootScope', 'socket', function(h, s, rs, socket){
        this.send = function(message){
            if(message == "") return showErr("message is empty");
            h.post("/mess/send/"+rs.pag._id, {content: message}).success(function(data){
                if(data.err) return showErr(data.err);
                rs.pag.messages.push(data);
                socket.emit("message", {sender: getCookie("auth"), message: data});
                s.messCtl.message = "";
            });
        }
        s.$watch(function () {
            return document.getElementById("messages").innerHTML;
        }, function(val) {
            var objDiv = document.getElementById("messages");
            objDiv.scrollTop = objDiv.scrollHeight;
        });
    }]);
})();