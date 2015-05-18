module.exports = function(app, controllers){
    require("./user.js")(app, controllers);
    require("./util.js")(app, controllers);
    require("./post.js")(app, controllers);
    require("./friend.js")(app, controllers);
}