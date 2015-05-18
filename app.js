var app = require("./express.js").app;

var mongoose = require("mongoose");

if(!mongoose.connection.readyState);
    mongoose.connect("mongodb://localhost/boiler-node");

//load the controller
var controllers = require("./controllers/index.js");

//set the routes
require("./routes/index.js")(app, controllers);