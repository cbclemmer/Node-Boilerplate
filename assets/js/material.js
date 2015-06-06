var converter = new Showdown.converter();

function showErr(error){
	$('#err').css({top: '-200px'});
	$('#err').empty();
	$('#err').append(error);
	$('#err').show();
	$('#err').animate({top: '50px'}, function(){
		setTimeout(function() {
			$('#err').fadeOut('fast');
		}, 5000);
	});
}
function showInfo(info){
	$('#info').css({top: '-200px'});
	$('#info').empty();
	$('#info').append(info);
	$('#info').show();
	$('#info').animate({top: '50px'}, function(){
		setTimeout(function() {
			$('#info').fadeOut('fast');
		}, 5000);
	});
}

function getCookie(name){
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};

window.onscroll=function(){
    if(window.pageYOffset>0){
    	$(".top").css({paddingTop: "20px", top: "0px", fontSize: "20pt", height: "60px"});
    	$(".topRight").css({marginTop: "-10px"});
    	$("#searchResults").css({top: "80px"});
    	$("#aboutDiv").css({top: "80px"});
    	$("#newPost").css({top: "80px"});
    }
    if(window.pageYOffset==0){
    	$(".top").css({paddingTop: "100px", fontSize: "34pt", height: "75px"});
    	$(".topRight").css({marginTop: "0px"});
    	$("#searchResults").css({top: "175px"});
    	$("#aboutDiv").css({top: "175px"});
    	$("#newPost").css({top: "175px"});
    }
}

$(document).on('click', "#signUp-button", function(){
    $(".sLogin").hide();
    $(".sSign-up").show();
});

$(document).on('click', "#login-button", function(){
    $(".sSign-up").hide();
    $(".sLogin").show();
});
$(document).on("click", "#searchResults div", function(){
	var username = this.getElementsByTagName("span")[0].innerHTML.slice(1);
	console.log(angular.element($("body")).scope().init.toUser(username));
});
$(document).ready(function(){
	var i = screen.height;
    
	$("#sideNav").css({height: (i+"px")});
	$("#shadow").css({height: (i+"px")});
	$("#search").click(function(){
		if($("#searchBar").is(":visible")){
			$("#searchBar").animate({top: "-200px"}, 500, function(){
				$("#searchBar").hide();
			});		
		}else{
			$("#searchBar").show();
			$("#searchBar").animate({top: "0px"}, 500);
			$("#searchBar").focus();
		}
	});
	$("#menuButton").click(function(){
		$("#shadow").fadeIn('fast', function(){
			$("#sideNav").css({left: "-20%", display: "none"});
			$("#sideNav").show();
			$("#sideNav").animate({left: "0px"}, 200);			
		});
	});
	$("#shadow").click(function(){
		$("#sideNav").animate({left: "-20%"}, 200, function(){
			$("#sideNav").hide();
			$("#shadow").fadeOut('fast');
		});
	});
	$("#searchBar").keyup(function(){
		$.get('/search/'+$("#searchBar").val(), function(data){
			$("#searchResults").empty();
			for(var i=0;i<data.length;i++){
				$("#searchResults").append("<div>"+data[i].name+" <span>@"+data[i].username+"</span></div>");
			}	
		});
		if($("#searchBar").val()!=""){
			$("#searchResults").slideDown();
		}else{
			$("#searchResults").slideUp();
		}
	});
	$("#postInput textarea").keyup(function(){
    		$("#preview").empty();
    		$("#preview").append(converter.makeHtml($("#postInput textarea").val()));
	});
	$("#newPostButton").click(function(){
		if($("#newPost").is(":visible")) {
			$("#newPostButton").rotate(0);
			$("#newPost").slideUp();
		}else{
			$("#newPostButton").rotate(45);
			var height = $(window).height();
			$("#postInput").css({height: height*.5});
			$("#preview").css({height: height*.5});
			$("#postInput textarea").css({height: height*.5});
			$("#newPost").slideDown();
		}
	});
	$("#aboutButton").click(function(){
		if($("#aboutDiv").is(":visible")){
			$("#aboutDiv").slideUp();
		}else{
			$("#aboutDiv").slideDown();
		}
	});
	$(".main").click(function(){
		$("#newPostButton").rotate(0);
		$("#newPost").slideUp();
	});
	$("#aboutFriends").click(function(){
		$("#friendsDiv").css({right: "-70%"});
		$("#friendsDiv").show();
		$("#friendsDiv").animate({right: "5%"});
		$("#aboutDiv").slideUp();
	});
	$("#friendsExit").click(function(){
		$("#friendsDiv").animate({right: "-70%"}, 500, function(){
			$("#friendsDiv").hide();
		});
	});
	$(document).click(function(){
		if($("#sideNav").is(":visible")){
			$("#sideNav").animate({left: "-20%"}, 200, function(){
				$("#sideNav").hide();
				$("#shadow").fadeOut('fast');
			});
		}
		if($("#err").is(":visible")){
			$("#err").fadeOut('fast');
		}
		if($("#info").is(":visible")){
			$("#info").fadeOut('fast');
		}
		if($("#searchResults").is(":visible")){
			$("#searchResults").slideUp();
		}
	});
});